import {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  type APIButtonComponentWithCustomId,
  type APIMessageComponentEmoji,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  TextInputStyle,
} from "discord-api-types/v10";
import { MessageFlagsBitField, PermissionFlags } from "discord-bitflag";
import { eq } from "drizzle-orm";
import {
  autoRollbackTx,
  backups,
  discordMessageComponents,
  discordMessageComponentsToFlows,
  type FlowAction,
  FlowActionCheckFunctionType,
  flowActions,
  FlowActionSetVariableType,
  FlowActionType,
  flows,
  generateId,
  makeSnowflake,
} from "store";
import type { Client } from "../../client.js";
import type { ModalCallback, SelectMenuCallback } from "../../components.js";
import type { InteractionContext } from "../../interactions.js";
import { storeComponents } from "../../util/components.js";
import { getHighestRole } from "../reactionRoles.js";
import {
  type ComponentFlow,
  generateEditorTokenForComponent,
  getComponentFlowContainer,
  getEditorTokenComponentUrl,
} from "./add.js";

interface QuickButtonConfig {
  id: string;
  name: string;
  emoji: APIMessageComponentEmoji;
  build: (props: any) => FlowAction[];
}

export const quickButtonConfigs: QuickButtonConfig[] = [
  {
    id: "toggle-role",
    name: "Toggle Role",
    emoji: { name: "🏷️" },
    build(props: { roleId: string }) {
      const { roleId } = props;
      return [
        {
          type: FlowActionType.SetVariable,
          name: "roleId",
          value: roleId,
        },
        {
          type: FlowActionType.Check,
          function: {
            type: FlowActionCheckFunctionType.In,
            element: {
              varType: FlowActionSetVariableType.Get,
              value: "roleId",
            },
            array: {
              varType: FlowActionSetVariableType.Get,
              value: "member.role_ids",
            },
          },
          // biome-ignore lint/suspicious/noThenProperty: sorry! maybe we will rename this in a future version
          then: [
            {
              type: FlowActionType.RemoveRole,
              roleId,
            },
            {
              type: FlowActionType.Stop,
              message: {
                content: "Removed the <@&{roleId}> role from you.",
                flags: MessageFlags.Ephemeral,
              },
            },
          ],
          else: [
            {
              type: FlowActionType.AddRole,
              roleId,
            },
            {
              type: FlowActionType.Stop,
              message: {
                content: "Gave you the <@&{roleId}> role.",
                flags: MessageFlags.Ephemeral,
              },
            },
          ],
        },
      ];
    },
  },
  {
    id: "send-message",
    name: "Send Message",
    emoji: { name: "✉️" },
    build(props: { backupId: string; flags: MessageFlagsBitField }) {
      return [
        {
          type: FlowActionType.SendMessage,
          backupId: props.backupId,
          flags: Number(props.flags.value),
          response: true,
        },
      ];
    },
  },
];

export const addComponentQuickEntry: SelectMenuCallback = async (ctx) => {
  const value = ctx.interaction.data.values[0];
  // biome-ignore lint/style/noNonNullAssertion: Options generated from this array (except `_`)
  const config = quickButtonConfigs.find((c) => c.id === value)!;

  const state = ctx.state as ComponentFlow;
  state.steps = state.steps ?? [];

  if (value === "_") {
    state.stepTitle = "Finish on Discohook";
    state.steps.splice(
      1,
      1,
      { label: "Choose path (custom flow)" },
      {
        label:
          'Click "Customize" to set details and flows **<--- you are here**',
      },
      { label: 'Finish editing and click "Add Button" in the tab' },
    );
  } else {
    state.stepTitle = `Configure ${config.name}`;
    state.steps.splice(1, 1, {
      label: `Choose a quick setup (${config.name})`,
    });
  }

  const db = ctx.client.getDb();
  const flowId = BigInt(generateId());
  await db.insert(flows).values({ id: flowId }).returning({ id: flows.id });

  state.component = state.component ?? {
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
    flowId: String(flowId),
    label: "Button",
  };

  // biome-ignore lint/style/noNonNullAssertion: insert always returns or throws. what's up with this type?
  const component = (
    await db
      .insert(discordMessageComponents)
      .values({
        guildId: makeSnowflake(state.message.guildId),
        channelId: makeSnowflake(state.message.channelId),
        messageId: makeSnowflake(state.message.id),
        type: state.component.type,
        data: state.component,
        createdById: makeSnowflake(state.user.id),
        updatedById: makeSnowflake(state.user.id),
        draft: true,
      })
      .returning({
        id: discordMessageComponents.id,
      })
  )[0]!;
  await db
    .insert(discordMessageComponentsToFlows)
    .values({
      discordMessageComponentId: component.id,
      flowId,
    })
    .onConflictDoNothing();
  state.componentId = String(component.id);

  const doId = ctx.env.DRAFT_CLEANER.idFromName(String(component.id));
  const stub = ctx.env.DRAFT_CLEANER.get(doId);
  const cleanerParams = new URLSearchParams({ id: String(component.id) });
  if (value !== "_") {
    // If we're not going to use the web flow, we don't need 2 weeks
    // for expiry in case the user backs out
    cleanerParams.set(
      "expires",
      new Date(new Date().getTime() + 86_400_000).toISOString(),
    );
  }
  await stub.fetch(`http://do/?${cleanerParams}`, { method: "GET" });

  switch (value) {
    case "_": {
      const editorToken = await generateEditorTokenForComponent(component.id, {
        user: {
          id: ctx.user.id,
          name: ctx.user.username,
          avatar: ctx.user.avatar,
        },
      });

      const container = getComponentFlowContainer(state);
      container.addTextDisplayComponents((c) =>
        c.setContent(`-# ${ctx.t("componentWillExpire")}`),
      );
      await ctx.updateMessage({
        components: [
          container,
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel(ctx.t("customize"))
              .setStyle(ButtonStyle.Link)
              .setURL(getEditorTokenComponentUrl(editorToken)),
          ),
        ],
      });
      return;
    }
    case "toggle-role": {
      state.totalSteps = 5;
      if (!ctx.userPermissons.has(PermissionFlags.ManageRoles)) {
        return ctx.reply({
          content: "You need the **Manage Roles** permission",
          ephemeral: true,
        });
      }
      await ctx.updateMessage({
        components: [
          getComponentFlowContainer(state),
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            await storeComponents(ctx.env.KV, [
              new RoleSelectMenuBuilder().setPlaceholder(
                "Select or search for a role",
              ),
              {
                ...state,
                componentTimeout: 600,
                componentRoutingId: `add-component-quick-${value}`,
                componentOnce: false,
              },
            ]),
          ),
        ],
      });
      return;
    }
    case "send-message": {
      state.totalSteps = 6;
      state.stepTitle = "Set share link";
      state.step = 3;
      const modal = new ModalBuilder()
        .setTitle("Button message")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("share-link")
              .setLabel("Share Link")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("https://discohook.app/?share=...")
              .setMaxLength(40)
              .setMinLength(30),
          ),
        );
      await storeComponents(ctx.env.KV, [
        modal,
        {
          ...state,
          componentTimeout: 600,
          componentRoutingId: `add-component-quick-${value}-modal`,
          componentOnce: false,
        },
      ]);

      await ctx.modal(modal);
      await ctx.followup.editOriginalMessage({
        components: [
          getComponentFlowContainer(state),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await storeComponents(ctx.env.KV, [
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Open modal"),
              {
                ...state,
                modal,
                componentTimeout: 600,
                componentRoutingId: "add-component-flow-customize-modal-resend",
                componentOnce: false,
              },
            ]),
          ),
        ],
      });
      return;
    }
    default:
      break;
  }

  await ctx.reply({
    content: "Unknown setup path",
    ephemeral: true,
  });
};

const getCustomButtonValuesModal = () =>
  new ModalBuilder().setTitle("Custom button values").addLabelComponents(
    (l) =>
      l
        .setLabel("Label")
        .setDescription("The text displayed on this button.")
        .setTextInputComponent((b) =>
          b
            .setCustomId("label")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(80),
        ),
    (l) =>
      l
        .setLabel("Emoji")
        .setDescription("Like :smile: or a custom emoji in the server.")
        .setTextInputComponent((b) =>
          b
            .setCustomId("emoji")
            .setStyle(TextInputStyle.Short)
            .setRequired(false),
        ),
    (l) =>
      l
        .setLabel("Disabled?")
        .setStringSelectMenuComponent((s) =>
          s
            .setCustomId("disabled")
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel("True")
                .setValue("true")
                .setDescription("The button will not be clickable."),
              new StringSelectMenuOptionBuilder()
                .setLabel("False")
                .setValue("false")
                .setDescription("The button will be clickable (default)")
                .setDefault(true),
            ),
        ),
  );

const addComponentSetStylePrompt = async (ctx: InteractionContext) => {
  const state = ctx.state as ComponentFlow;
  state.stepTitle = "Choose a button style";
  state.step += 1;

  return await ctx.followup.editOriginalMessage({
    components: [
      getComponentFlowContainer(state),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        await storeComponents(ctx.env.KV, [
          new StringSelectMenuBuilder().addOptions(
            (
              [
                ButtonStyle.Primary,
                ButtonStyle.Secondary,
                ButtonStyle.Success,
                ButtonStyle.Danger,
              ] as const
            ).map((style) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(
                  {
                    [ButtonStyle.Primary]: "Blurple",
                    [ButtonStyle.Secondary]: "Gray",
                    [ButtonStyle.Success]: "Green",
                    [ButtonStyle.Danger]: "Red",
                  }[style],
                )
                .setDescription(ButtonStyle[style])
                .setValue(String(style))
                .setEmoji({
                  name: {
                    [ButtonStyle.Primary]: "🟦",
                    [ButtonStyle.Secondary]: "⬜",
                    [ButtonStyle.Success]: "🟩",
                    [ButtonStyle.Danger]: "🟥",
                  }[style],
                }),
            ),
          ),
          {
            ...state,
            componentOnce: true,
            componentTimeout: 300,
            componentRoutingId: "add-component-quick-style",
          },
        ]),
      ),
    ],
  });
};

export const submitButtonQuickStyle: SelectMenuCallback = async (ctx) => {
  // const style = ctx.interaction.message.components?.[0].components.find(
  //   (c): c is APIButtonComponentWithCustomId =>
  //     c.type === ctx.interaction.data.component_type &&
  //     "custom_id" in c &&
  //     c.custom_id === ctx.interaction.data.custom_id,
  // )?.style;
  // if (style === undefined) {
  //   throw Error(
  //     "This should not happen unless this callback was assigned to the wrong component",
  //   );
  // }
  const state = ctx.state as ComponentFlow;
  if (!state.component) throw Error("state.component is missing");

  const style = Number(
    ctx.interaction.data.values[0],
  ) as APIButtonComponentWithCustomId["style"];
  (state.component as unknown as APIButtonComponentWithCustomId).style = style;

  state.stepTitle = "Customize button details";
  state.steps = state.steps ?? [];
  state.steps.push({
    label: `Select style (${ButtonStyle[style].toLowerCase()})`,
  });

  const modal = getCustomButtonValuesModal();
  await storeComponents(ctx.env.KV, [
    modal,
    {
      ...state,
      componentTimeout: 600,
      componentRoutingId: "add-component-flow-customize-modal",
      componentOnce: false,
    },
  ]);

  await ctx.modal(modal);
  await ctx.followup.editOriginalMessage({
    components: [
      getComponentFlowContainer(state),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        await storeComponents(ctx.env.KV, [
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Open modal"),
          {
            componentRoutingId: "add-component-flow-customize-modal-resend",
            componentTimeout: 600,
            modal: modal.toJSON(),
          },
        ]),
      ),
    ],
  });
};

export const addComponentQuickToggleRoleCallback: SelectMenuCallback = async (
  ctx,
) => {
  const value = ctx.interaction.data.values[0];
  // biome-ignore lint/style/noNonNullAssertion: Options generated from this array
  const config = quickButtonConfigs.find((c) => c.id === "toggle-role")!;

  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only");

  const { roles, owner_id } = await ctx.client.api.guilds.get(guildId);
  const role = roles.find((r) => r.id === value);
  if (!role) {
    await ctx.reply({
      content:
        "The role could not be found. Please choose a different one or try restarting Discord.",
      ephemeral: true,
    });
    return;
  }
  if (role.managed) {
    await ctx.reply({
      content: `<@&${role.id}> can't be assigned to members.`,
      ephemeral: true,
    });
    return;
  }

  const me = await ctx.client.api.guilds.getMember(
    guildId,
    Bun.env.DISCORD_APPLICATION_ID,
  );
  const botHighestRole = getHighestRole(roles, me.roles);
  if (owner_id !== Bun.env.DISCORD_APPLICATION_ID) {
    // You could be running an instance of this bot where
    // the bot is the owner of the guild
    if (!botHighestRole) {
      await ctx.reply({
        content: `I can't assign <@&${role.id}> to members because I don't have any roles.`,
        ephemeral: true,
      });
      return;
    } else if (botHighestRole && role.position >= botHighestRole.position) {
      await ctx.reply({
        content: `<@&${role.id}> is higher than my highest role (<@&${botHighestRole.id}>), so I can't assign it to members. <@&${role.id}> needs to be lower in the role list, or my highest role needs to be higher.`,
        ephemeral: true,
      });
      return;
    }
  }
  // biome-ignore lint/style/noNonNullAssertion: guild-only
  const member = ctx.interaction.member!;
  const memberHighestRole = getHighestRole(roles, member.roles);
  if (owner_id !== ctx.user.id) {
    // Guild owner can always do everything
    if (!memberHighestRole) {
      // This message should never be seen unless someone messes with permissions
      await ctx.reply({
        content: `You can't assign <@&${role.id}> to members because you don't have any roles.`,
        ephemeral: true,
      });
      return;
    } else if (
      memberHighestRole &&
      role.position >= memberHighestRole.position
    ) {
      await ctx.reply({
        content: `<@&${role.id}> is higher than your highest role (<@&${memberHighestRole.id}>), so you can't select it to be assigned to members. <@&${role.id}> needs to be lower in the role list, or your highest role needs to be higher.`,
        ephemeral: true,
      });
      return;
    }
  }

  const state = ctx.state as ComponentFlow;
  state.step = 4;
  state.steps = state.steps ?? [];
  state.steps.push({ label: `Select role (<@&${role.id}>)` });

  // Assume button
  const { flowId } = state.component as StorableButtonWithCustomId;
  const actions = config.build({ roleId: role.id });

  await ctx.defer();
  const db = ctx.client.getDb();
  await db.transaction(
    autoRollbackTx(async (tx) => {
      await tx
        .delete(flowActions)
        .where(eq(flowActions.flowId, BigInt(flowId)));
      await tx.insert(flowActions).values(
        actions.map((action) => ({
          flowId: BigInt(flowId),
          type: action.type,
          data: action,
        })),
      );
    }),
  );

  await addComponentSetStylePrompt(ctx);
};

export const parseShareLink = async (client: Client, raw: string) => {
  const invalidShareLinkMessage = `Invalid share link. They look like this: \`${Bun.env.DISCOHOOK_ORIGIN}/?share=...\``;
  let shareUrl: URL;
  try {
    shareUrl = new URL(raw);
  } catch {
    throw Error(invalidShareLinkMessage);
  }
  const shareId = shareUrl.searchParams.get("share");
  if (shareUrl.origin !== Bun.env.DISCOHOOK_ORIGIN || !shareId) {
    if (shareUrl.host === "share.discohook.app") {
      throw Error(dedent`
        This is an old-style share link. You must use a share link created on <${Bun.env.DISCOHOOK_ORIGIN}>. They look like this: \`${Bun.env.DISCOHOOK_ORIGIN}/?share=...\`

        -# TIP: Just [open the share link](${shareUrl.href}), change the address from \`discohook.org\` to \`discohook.app\`, then press "Share" again to generate a new link.
      `);
    }
    throw Error(invalidShareLinkMessage);
  }

  if (!(await getShareLinkExists(client, shareId))) {
    throw Error(
      "Share link does not exist. Keep in mind that they expire after a week by default.",
    );
  }
  return shareId;
};

export const addComponentQuickSendMessageCallback: ModalCallback = async (
  ctx,
) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only");

  let shareId: string;
  try {
    shareId = await parseShareLink(
      ctx.client,
      ctx.getModalComponent("share-link").value,
    );
  } catch (e) {
    await ctx.reply({ content: String(e), flags: MessageFlags.Ephemeral });
    return;
  }

  const state = ctx.state as ComponentFlow;
  state.steps?.push({
    label: `Set share link ([${shareId}](${Bun.env.DISCOHOOK_ORIGIN}/?share=${shareId}))`,
  });
  state.stepTitle = "Set visibility";
  state.step += 1;

  await ctx.updateMessage({
    components: [
      getComponentFlowContainer(state),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        await storeComponents(ctx.env.KV, [
          new StringSelectMenuBuilder()
            .setPlaceholder("Select whether the message should be hidden")
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setValue("0")
                .setLabel("Public")
                .setEmoji({ name: "🦺" })
                .setDescription(
                  "The message is visible to everyone in the channel",
                ),
              new StringSelectMenuOptionBuilder()
                .setValue(String(MessageFlags.Ephemeral))
                .setLabel("Hidden")
                .setEmoji({ name: "😶‍🌫️" })
                .setDescription(
                  "Only the person who pressed the button can see the message",
                ),
            ),
          {
            ...state,
            shareId,
            componentRoutingId: "add-component-quick-send-message-visibility",
            componentTimeout: 600,
            componentOnce: true,
          },
        ]),
      ),
    ],
  });
};

export const addComponentQuickSendMessageVisibilityCallback: SelectMenuCallback =
  async (ctx) => {
    const guildId = ctx.interaction.guild_id;
    if (!guildId) throw Error("Guild-only");

    const flags = new MessageFlagsBitField(
      Number(ctx.interaction.data.values[0]),
    );

    const { shareId, ...state } = ctx.state as ComponentFlow & {
      shareId: string;
    };

    await ctx.defer();
    const { data } = await getShareLink(ctx.client, shareId);

    // Assume button
    const { flowId } = state.component as StorableButtonWithCustomId;

    // biome-ignore lint/style/noNonNullAssertion: Options generated from this array
    const config = quickButtonConfigs.find((c) => c.id === "send-message")!;
    const backupId = generateId();
    const backupName = `Button in #${
      ctx.interaction.channel.name ?? "unknown"
    } (share ${shareId})`.slice(0, 100);
    const actions = config.build({ flags, backupId });

    const db = ctx.client.getDb();
    await db.transaction(
      autoRollbackTx(async (tx) => {
        await tx.insert(backups).values({
          id: BigInt(backupId),
          ownerId: BigInt(state.user.id),
          name: backupName,
          dataVersion: "d2",
          data,
        });
        await tx
          .delete(flowActions)
          .where(eq(flowActions.flowId, BigInt(flowId)));
        await tx.insert(flowActions).values(
          actions.map((action) => ({
            flowId: BigInt(flowId),
            type: action.type,
            data: action,
          })),
        );
      }),
    );

    state.steps?.splice(
      // Remove share link step and replace it with editable backup link now
      // that we have fetched the data and created the backup
      state.steps.length - 1,
      1,
      {
        label: `Set [message data](${Bun.env.DISCOHOOK_ORIGIN}/?backup=${backupId} "${backupName}") (${shareId})`,
      },
      {
        label: `Set message visibility (${
          flags.has(MessageFlags.Ephemeral) ? "hidden" : "public"
        })`,
      },
    );
    state.stepTitle = "Set visibility";
    state.step += 1;

    await addComponentSetStylePrompt(ctx);
  };
