import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  escapeMarkdown,
  formatEmoji,
  messageLink,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIButtonComponent,
  APIInteraction,
  APIMessage,
  APIModalInteractionResponseCallbackData,
  APISelectMenuComponent,
  APIStringSelectComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  Routes,
  TextInputStyle,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { t } from "i18next";
import { SignJWT } from "jose";
import {
  DBWithSchema,
  getDb,
  getchGuild,
  launchComponentDurableObject,
  upsertDiscordUser,
  upsertGuild,
} from "store";
import {
  discordMessageComponents,
  flows,
  generateId,
  makeSnowflake,
  tokens,
} from "store/src/schema";
import { StorableComponent } from "store/src/types";
import { InteractionInstantOrDeferredResponse } from "../../commands.js";
import {
  ButtonCallback,
  MinimumKVComponentState,
  ModalCallback,
  SelectMenuCallback,
} from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { Env } from "../../types/env.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import {
  getComponentWidth,
  getRowWidth,
  storeComponents,
} from "../../util/components.js";
import { isDiscordError } from "../../util/error.js";
import { color } from "../../util/meta.js";
import { BUTTON_URL_RE } from "../../util/regex.js";
import { getUserPremiumDetails } from "../../util/user.js";
import { resolveEmoji } from "../reactionRoles.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import { partialEmojiToComponentEmoji } from "./edit.js";
import { quickButtonConfigs } from "./quick.js";

export const buildStorableComponent = (
  component: StorableComponent,
  customId?: string,
): APIButtonComponent | APISelectMenuComponent | undefined => {
  switch (component.type) {
    case ComponentType.Button:
      return component.style === ButtonStyle.Premium
        ? component
        : ({
            type: component.type,
            custom_id:
              component.style === ButtonStyle.Link ? undefined : customId,
            url:
              component.style === ButtonStyle.Link ? component.url : undefined,
            style: component.style,
            label: component.label,
            emoji: component.emoji,
            disabled: component.disabled,
          } as APIButtonComponent);
    case ComponentType.StringSelect:
      return {
        type: component.type,
        custom_id: customId,
        placeholder: component.placeholder,
        disabled: component.disabled,
        min_values: component.minValues,
        max_values: component.maxValues,
        options: component.options,
      } as APIStringSelectComponent;
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return {
        type: component.type,
        custom_id: customId,
        placeholder: component.placeholder,
        disabled: component.disabled,
        min_values: component.minValues,
        max_values: component.maxValues,
        default_values: component.defaultValues,
      } as APISelectMenuComponent;
    default:
      break;
  }
};

export interface ComponentFlow extends MinimumKVComponentState {
  step: number;
  stepTitle: string;
  totalSteps?: number;
  steps?: {
    label: string;
  }[];
  webhookToken: string;
  message: {
    id: string;
    channelId: string;
    isInThread?: boolean;
    guildId: string;
    webhookId: string;
    webhookName: string;
    webhookAvatar: string | null;
  };
  user: {
    id: string;
    premium: ReturnType<typeof getUserPremiumDetails>;
  };
  componentId?: string;
  component?: StorableComponent;
}

export const getComponentFlowEmbed = (flow: ComponentFlow) => {
  const embed = new EmbedBuilder({
    title:
      flow.stepTitle +
      (flow.totalSteps
        ? ` - Step ${flow.step}/${flow.totalSteps} (${Math.floor(
            (flow.step / flow.totalSteps) * 100,
          )}%)`
        : ""),
    description: flow.steps
      ? flow.steps.map((step, i) => `${i + 1}. ${step.label}`).join("\n")
      : undefined,
    color,
  }).addFields({
    name: "Message",
    value: messageLink(
      flow.message.channelId,
      flow.message.id,
      flow.message.guildId,
    ),
  });

  if (flow.step === 0) {
    embed.setThumbnail(
      webhookAvatarUrl({
        id: flow.message.webhookId,
        avatar: flow.message.webhookAvatar,
      }),
    );
  } else {
    embed.setAuthor({
      name: flow.message.webhookName.slice(0, 256) || "Webhook",
      iconURL: webhookAvatarUrl({
        id: flow.message.webhookId,
        avatar: flow.message.webhookAvatar,
      }),
    });
  }

  return embed;
};

const registerComponent = async (
  ctx: InteractionContext<APIInteraction>,
  flow: ComponentFlow,
  componentId?: bigint,
) => {
  // biome-ignore lint/style/noNonNullAssertion: It's not null
  const data = flow.component!;

  const id = componentId ?? BigInt(generateId());
  const customId =
    data.type === ComponentType.Button &&
    (data.style === ButtonStyle.Link || data.style === ButtonStyle.Premium)
      ? undefined
      : `p_${id}`;
  const built = buildStorableComponent(data, customId);
  if (!built) {
    throw new Error(`Failed to built the component (type ${data.type}).`);
  }
  const requiredWidth = getComponentWidth(built);

  let message: APIMessage | undefined = undefined;
  try {
    message = (await ctx.rest.get(
      Routes.webhookMessage(
        flow.message.webhookId,
        flow.webhookToken,
        flow.message.id,
      ),
      {
        query: flow.message.isInThread
          ? new URLSearchParams({ thread_id: flow.message.channelId })
          : undefined,
      },
    )) as APIMessage;
  } catch {
    throw new Error(dedent`
      Failed to fetch the message (${flow.message.id}).
      Make sure the webhook (${flow.message.webhookId})
      exists and is in the same channel.
    `);
  }
  // const components = message.components
  //   ? message.components.map(c => new ActionRowBuilder(c))
  //   : [new ActionRowBuilder()];

  const components = message.components ?? [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().toJSON(),
  ];
  let nextAvailableRow = components.find(
    (c) => 5 - getRowWidth(c) >= requiredWidth,
  );
  if (!nextAvailableRow && components.length < 5) {
    nextAvailableRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().toJSON();
    components.push(nextAvailableRow);
  } else if (!nextAvailableRow) {
    throw new Error(
      `No available slots for this component (need at least ${requiredWidth}).`,
    );
  }
  nextAvailableRow.components.push(built);

  const db = getDb(ctx.env.HYPERDRIVE);
  const returned = await db
    .insert(discordMessageComponents)
    .values({
      id,
      guildId: makeSnowflake(flow.message.guildId),
      channelId: makeSnowflake(flow.message.channelId),
      messageId: makeSnowflake(flow.message.id),
      createdById: makeSnowflake(flow.user.id),
      type: data.type,
      data,
    })
    .onConflictDoUpdate({
      target: discordMessageComponents.id,
      set: {
        data,
        draft: false,
        updatedAt: new Date(),
        updatedById: makeSnowflake(flow.user.id),
      },
    })
    .returning({
      id: discordMessageComponents.id,
    });

  let editedMsg: APIMessage;
  try {
    editedMsg = (await ctx.rest.patch(
      Routes.webhookMessage(
        flow.message.webhookId,
        flow.webhookToken,
        flow.message.id,
      ),
      {
        body: { components },
        query: flow.message.isInThread
          ? new URLSearchParams({ thread_id: flow.message.channelId })
          : undefined,
      },
    )) as APIMessage;
  } catch (e) {
    if (isDiscordError(e)) {
      await db
        .update(discordMessageComponents)
        .set({ draft: true })
        .where(eq(discordMessageComponents.id, returned[0].id));
    }
    throw e;
  }
  await launchComponentDurableObject(ctx.env, {
    messageId: editedMsg.id,
    componentId: id,
    customId: customId ?? `p_${id}`,
  });
  return editedMsg;
};

export const startComponentFlow = async (
  ctx: InteractionContext<APIInteraction>,
  message: APIMessage,
  components?: ActionRowBuilder<MessageActionRowComponentBuilder>[],
): Promise<InteractionInstantOrDeferredResponse> => {
  const db = getDb(ctx.env.HYPERDRIVE);
  const user = await upsertDiscordUser(db, ctx.user);

  if (!message.webhook_id) {
    return ctx.reply({
      content: "This is not a webhook message.",
      ephemeral: true,
    });
  }
  if (
    !message.application_id ||
    message.application_id !== ctx.env.DISCORD_APPLICATION_ID
  ) {
    return ctx.reply({
      // content:
      //   "This message's webhook is not owned by Discohook Utils. You can create a bot-owned webhook with </webhook create:908884724087410732>. Would you like to automatically clone the message using a new webhook?",
      content: `This message's webhook is ${
        message.application_id
          ? `owned by <@${message.application_id}>, not Discohook Utils`
          : "not owned by Discohook Utils"
      }. You can create a bot-owned webhook with </webhook create:908884724087410732>, then re-send the message from Discohook (use </restore:979811266073878560> to load the message).`,
      ephemeral: true,
      // components: [
      //   new ActionRowBuilder<ButtonBuilder>()
      //     .addComponents(
      //       new ButtonBuilder()
      //         .setCustomId(
      //           `a_clone-webhook-message_${message.id}:${message.webhook_id}` satisfies AutoComponentCustomId,
      //         )
      //         .setLabel("Create webhook & re-send message"),
      //     ),
      // ],
    });
  }
  const webhook = await getWebhook(
    message.webhook_id,
    ctx.env,
    message.application_id,
  );
  const webhookToken = webhook.token;
  if (!webhookToken) {
    return ctx.reply({
      content: dedent`
        Webhook token (ID ${message.webhook_id}) was not available.
        It may be an incompatible type of webhook, or it may have been
        created by a different bot user.
      `,
      ephemeral: true,
    });
  }

  const componentFlow: ComponentFlow = {
    componentTimeout: 300,
    componentRoutingId: "add-component-flow",
    step: 0,
    stepTitle: "Message Components",
    webhookToken,
    message: {
      id: message.id,
      channelId: message.channel_id,
      isInThread: message.position !== undefined,
      // biome-ignore lint/style/noNonNullAssertion: Guild-only command
      guildId: ctx.interaction.guild_id!,
      webhookId: message.webhook_id,
      webhookName: message.author.username,
      webhookAvatar: message.author.avatar,
    },
    user: {
      id: String(user.id),
      premium: getUserPremiumDetails(user),
    },
  };

  return [
    ctx.reply({
      embeds: [getComponentFlowEmbed(componentFlow)],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          await storeComponents(ctx.env.KV, [
            new StringSelectMenuBuilder({
              placeholder: "Add a component",
              options: [
                {
                  label: "Button",
                  description:
                    "A simple button that runs a flow (add roles/send messages/etc)",
                  value: "button",
                  emoji: { name: "🟦" },
                },
                {
                  label: "Link Button",
                  description: "Direct a user to a webpage",
                  value: "link-button",
                  emoji: { name: "🌐" },
                },
                {
                  label: "String Select",
                  description:
                    "Select from a custom list of options (up to 25)",
                  value: "string-select",
                  emoji: { name: "🔽" },
                },
                {
                  label: "User Select",
                  description: "Select from a list of all server members",
                  value: "user-select",
                  emoji: { name: "👤" },
                },
                {
                  label: "Role Select",
                  description: "Select from a list of all server roles",
                  value: "role-select",
                  emoji: { name: "🏷️" },
                },
                {
                  label: "User/Role Select",
                  description: "Select from a list of all members and roles",
                  value: "mentionable-select",
                  emoji: { name: "*️⃣" },
                },
                {
                  label: "Channel Select",
                  description: "Select from a list of all server channels",
                  value: "channel-select",
                  emoji: { name: "#️⃣" },
                },
              ],
            }),
            {
              ...componentFlow,
              componentOnce: true,
            },
          ]),
        ),
        ...(components ?? []),
      ],
      ephemeral: true,
    }),
    async () => {
      const guild = await getchGuild(
        ctx.rest,
        ctx.env.KV,
        // biome-ignore lint/style/noNonNullAssertion:
        ctx.interaction.guild_id!,
      );
      await upsertGuild(db, guild);
    },
  ];
};

/**
 * An editor token is a special subset of our JWTs that is scoped for editing
 * one or more components, and does not authorize a request as a user.
 * This flow makes them fairly safe; Even if the token is hijacked, the
 * attacker cannot edit the message itself or send any new messages to the server.
 *
 * The drawback is that if the user wants to add a custom message action, they
 * will need to log in the long way through OAuth to access their backups.
 */
const createEditorToken = async (env: Env) => {
  const secretKey = Uint8Array.from(
    env.TOKEN_SECRET.split("").map((x) => x.charCodeAt(0)),
  );

  const now = new Date();
  // 2 hours
  const expiresAt = new Date(now.getTime() + 7_200_000);
  const id = generateId(now);
  const token = await new SignJWT({ scp: "editor" })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(id)
    .setIssuedAt(now)
    .setIssuer(env.DISCOHOOK_ORIGIN)
    .setExpirationTime(expiresAt)
    .sign(secretKey);

  return { id, value: token, expiresAt };
};

interface KVComponentEditorState {
  interactionId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  row?: number;
  column?: number;
}

export const getSessionManagerStub = (env: Env, sessionId: string) => {
  const id = env.SESSIONS.idFromName(sessionId);
  const stub = env.SESSIONS.get(id);
  return stub;
};

export const generateEditorTokenForComponent = async (
  db: DBWithSchema,
  env: Env,
  componentId: bigint,
  data: KVComponentEditorState,
) => {
  const editorToken = await createEditorToken(env);
  await db.insert(tokens).values({
    platform: "discord",
    id: makeSnowflake(editorToken.id),
    prefix: "editor",
    expiresAt: editorToken.expiresAt,
    // userId: makeSnowflake(state.user.id),
  });

  const key = `token:${editorToken.id}-component-${componentId}`;
  const stub = getSessionManagerStub(env, key);
  await stub.fetch("http://do/", {
    method: "PUT",
    body: JSON.stringify({ data, expires: editorToken.expiresAt }),
    headers: { "Content-Type": "application/json" },
  });
  return { ...editorToken, componentId };
};

export type EditorTokenWithComponent = Awaited<
  ReturnType<typeof generateEditorTokenForComponent>
>;

export const getEditorTokenComponentUrl = (
  token: EditorTokenWithComponent,
  env: Env,
): string =>
  `${env.DISCOHOOK_ORIGIN}/edit/component/${
    token.componentId
  }?${new URLSearchParams({
    token: token.value,
  })}`;

export const continueComponentFlow: SelectMenuCallback = async (ctx) => {
  const value = ctx.interaction.data.values[0];

  const state = ctx.state as ComponentFlow;
  state.steps = [];
  state.steps.push({
    label: `Select component type (${value.replace("-", " ")})`,
  });
  state.step += 1;

  switch (value) {
    case "button": {
      state.stepTitle = "Choose a quick setup or finish on Discohook";
      state.steps.push({
        label:
          'Choose from the select menu. For more in-depth configuration, click the final "Custom Flow" option.',
      });

      const embed = getComponentFlowEmbed(state);
      return ctx.updateMessage({
        embeds: [embed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            await storeComponents(ctx.env.KV, [
              new StringSelectMenuBuilder()
                .setPlaceholder("Choose your path")
                .addOptions(
                  ...quickButtonConfigs.map((config) =>
                    new StringSelectMenuOptionBuilder()
                      .setValue(config.id)
                      .setLabel(config.name)
                      .setEmoji(config.emoji),
                  ),
                  new StringSelectMenuOptionBuilder()
                    .setValue("_")
                    .setLabel("Custom Flow")
                    .setEmoji({ name: "⛓️" }),
                ),
              {
                ...state,
                componentTimeout: 600,
                componentRoutingId: "add-component-quick-entry",
                componentOnce: true,
              },
            ]),
          ),
        ],
      });
    }
    case "link-button": {
      state.stepTitle = "Customize the button's link, label, & emoji";
      state.totalSteps = 3;
      state.component = {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url: "",
      };

      const modal = new ModalBuilder()
        .setTitle("Custom button values")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("label")
              .setLabel("Label")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setMaxLength(80)
              .setPlaceholder("The text displayed on this button."),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("emoji")
              .setLabel("Emoji")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setPlaceholder("Like :smile: or a custom emoji in the server."),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("url")
              .setLabel("Button URL")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
              .setPlaceholder(
                "The full URL this button will lead to when it is clicked.",
              ),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("disabled")
              .setLabel("Disabled?")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setMinLength(4)
              .setMaxLength(5)
              .setPlaceholder(
                'Type "true" or "false" for whether the button should be unclickable.',
              ),
          ),
        );

      await storeComponents(ctx.env.KV, [
        modal,
        {
          ...state,
          componentTimeout: 600,
          componentRoutingId: "add-component-flow-customize-modal",
          componentOnce: false,
        },
      ]);

      return [
        ctx.modal(modal),
        async () => {
          await ctx.followup.editOriginalMessage({
            embeds: [getComponentFlowEmbed(state)],
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                await storeComponents(ctx.env.KV, [
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Open modal"),
                  {
                    componentRoutingId:
                      "add-component-flow-customize-modal-resend",
                    componentTimeout: 600,
                    modal: modal.toJSON(),
                  },
                ]),
              ),
            ],
          });
        },
      ];
    }
    case "string-select":
    case "user-select":
    case "role-select":
    case "mentionable-select":
    case "channel-select": {
      const db = getDb(ctx.env.HYPERDRIVE);
      const { id: flowId } =
        state.component ?? value === "string-select"
          ? { id: 0 }
          : (await db.insert(flows).values({}).returning({ id: flows.id }))[0];

      state.component =
        state.component ?? value === "string-select"
          ? {
              type: ComponentType.StringSelect,
              options: [],
              flowIds: {},
            }
          : {
              type:
                value === "user-select"
                  ? ComponentType.UserSelect
                  : value === "role-select"
                    ? ComponentType.RoleSelect
                    : value === "mentionable-select"
                      ? ComponentType.MentionableSelect
                      : ComponentType.ChannelSelect,
              flowId: String(flowId),
            };

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
      )[0];
      const doId = ctx.env.DRAFT_CLEANER.idFromName(String(component.id));
      const stub = ctx.env.DRAFT_CLEANER.get(doId);
      await stub.fetch(`http://do/?id=${component.id}`);

      const editorToken = await generateEditorTokenForComponent(
        db,
        ctx.env,
        component.id,
        {
          interactionId: ctx.interaction.id,
          user: {
            id: ctx.user.id,
            name: ctx.user.username,
            avatar: ctx.user.avatar,
          },
        },
      );

      state.stepTitle = "Finish in the editor";
      // state.totalSteps = 3;
      state.steps.push(
        {
          label:
            'Click "Customize" to set details and flows **<--- you are here**',
        },
        {
          label: 'Finish editing and click "Add Select" in the tab',
        },
      );

      const embed = getComponentFlowEmbed(state);
      embed.setFooter({ text: t("componentWillExpire") });
      return ctx.updateMessage({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel(t("customize"))
              .setURL(getEditorTokenComponentUrl(editorToken, ctx.env)),
          ),
        ],
      });
    }
    default:
      break;
  }

  return ctx.updateMessage({
    embeds: [getComponentFlowEmbed(state)],
    components: [],
  });
};

export const reopenCustomizeModal: ButtonCallback = async (ctx) => {
  const state = ctx.state as MinimumKVComponentState & {
    modal: APIModalInteractionResponseCallbackData;
  };
  return ctx.modal(state.modal);
};

export const submitCustomizeModal: ModalCallback = async (ctx) => {
  const state = ctx.state as ComponentFlow;
  const id = state.componentId ?? generateId();

  if (state.component?.type === ComponentType.Button) {
    const label = ctx.getModalComponent("label").value;
    const emojiRaw = ctx.getModalComponent("emoji").value;

    if (!label && !emojiRaw) {
      return ctx.reply({
        content: "Must provide either a label or emoji.",
        ephemeral: true,
      });
    }

    if (state.component.style !== ButtonStyle.Premium) {
      state.component.label = label;
      if (emojiRaw) {
        if (emojiRaw.includes(" ")) {
          return ctx.reply({
            content: "Invalid emoji: Contains invalid characters.",
            ephemeral: true,
          });
        }

        const emoji = await resolveEmoji(
          ctx.rest,
          emojiRaw,
          undefined,
          state.message.guildId,
          ctx.env,
        );
        if (!emoji) {
          return ctx.reply({
            content:
              "Could not find an emoji that matches the input. For a custom emoji, try using the numeric ID, and make sure Discohook has access to it.",
            ephemeral: true,
          });
        }
        state.component.emoji = partialEmojiToComponentEmoji(emoji);
      }
      state.step += 1;
      state.steps?.push({
        label: `Set label (${
          label ? escapeMarkdown(label) : "none"
        }) and emoji (${
          state.component.emoji?.id
            ? formatEmoji(
                state.component.emoji.id,
                state.component.emoji.animated,
              )
            : state.component.emoji?.name ?? "none"
        })`,
      });
    }

    const disabledRaw = ctx.getModalComponent("disabled")?.value;
    if (disabledRaw) {
      if (!["true", "false"].includes(disabledRaw.toLowerCase())) {
        return ctx.updateMessage({
          content: "Disabled field must be either `true` or `false`.",
          components: [],
        });
      }
      state.component.disabled = disabledRaw.toLowerCase() === "true";
    }

    if (state.component.style === ButtonStyle.Link) {
      let url: URL;
      try {
        url = new URL(ctx.getModalComponent("url").value);
      } catch {
        return ctx.reply({
          content: "Invalid URL.",
          ephemeral: true,
        });
      }
      if (!BUTTON_URL_RE.test(url.href)) {
        return ctx.reply({
          content:
            "Invalid URL. Must be a `http://`, `https://`, or `discord://` address.",
          ephemeral: true,
        });
      }

      state.component.url = url.href;
      state.step += 1;
      state.steps?.push({ label: "Set URL" });
    }

    try {
      await registerComponent(ctx, state, BigInt(id));
    } catch (e) {
      console.error(e);
      return ctx.reply({ content: String(e), flags: MessageFlags.Ephemeral });
    }

    state.stepTitle = "Finished!";
    state.step = state.steps?.length ?? 0;
    state.totalSteps = state.steps?.length;
    return ctx.updateMessage({
      embeds: [getComponentFlowEmbed(state)],
      components: [],
    });
  }

  return ctx.reply({
    content: "This shouldn't happen",
    ephemeral: true,
  });
};
