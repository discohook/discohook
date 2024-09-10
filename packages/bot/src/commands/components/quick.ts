import {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  TextInputBuilder,
} from "@discordjs/builders";
import {
  APIGuild,
  APIGuildMember,
  APIMessageComponentEmoji,
  ButtonStyle,
  MessageFlags,
  Routes,
  TextInputStyle,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { eq } from "drizzle-orm";
import { getDb } from "store";
import { flowActions } from "store/src/schema";
import {
  FlowAction,
  FlowActionCheckFunctionType,
  FlowActionSetVariableType,
  FlowActionType,
  StorableButtonWithCustomId,
} from "store/src/types";
import { SelectMenuCallback } from "../../components.js";
import { storeComponents } from "../../util/components.js";
import { getHighestRole } from "../reactionRoles.js";
import { ComponentFlow, getComponentFlowEmbed } from "./add.js";

interface QuickButtonConfig {
  id: string;
  name: string;
  emoji: APIMessageComponentEmoji;
  // description: string;
  // arguments: {
  //   id: string;
  //   name: string;
  //   description: string;
  //   component: APIMessageActionRowComponent | APIModalActionRowComponent;
  // }[];
  build: (props: any) => FlowAction[];
}

export const quickButtonConfigs: QuickButtonConfig[] = [
  {
    id: "toggle-role",
    name: "Togglable Role",
    emoji: { name: "🏷️" },
    // arguments: [
    //   {
    //     id: "roleId",
    //     name: "Role",
    //     description: "",
    //     component: {
    //       custom_id: "",
    //       type: ComponentType.RoleSelect,
    //       max_values: 1,
    //       placeholder: "Select or search for a role",
    //     },
    //   },
    // ],
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
];

export const addComponentQuickEntry: SelectMenuCallback = async (ctx) => {
  const value = ctx.interaction.data.values[0];
  // biome-ignore lint/style/noNonNullAssertion: Options generated from this array
  const config = quickButtonConfigs.find((c) => c.id === value)!;

  const state = ctx.state as ComponentFlow;
  state.steps = state.steps ?? [];

  state.stepTitle = `Configure ${config.name}`;
  state.steps.splice(1, 1, { label: `Choose a quick setup (${config.name})` });

  switch (value) {
    case "toggle-role": {
      if (!ctx.userPermissons.has(PermissionFlags.ManageRoles)) {
        return ctx.reply({
          content: "You need the **Manage Roles** permission",
          flags: MessageFlags.Ephemeral,
        });
      }
      return ctx.updateMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [
          new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents(
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
            )
            .toJSON(),
        ],
      });
    }
    default:
      break;
  }

  return ctx.reply({
    content: "Unknown quick setup value",
    flags: MessageFlags.Ephemeral,
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

  const { roles, owner_id } = (await ctx.rest.get(
    Routes.guild(guildId),
  )) as APIGuild;
  const role = roles.find((r) => r.id === value);
  if (!role) {
    return ctx.reply({
      content:
        "The role could not be found. Please choose a different one or try restarting Discord.",
      flags: MessageFlags.Ephemeral,
    });
  }
  if (role.managed) {
    return ctx.reply({
      content: `<@&${role.id}> can't be assigned to members.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const me = (await ctx.rest.get(
    Routes.guildMember(guildId, ctx.env.DISCORD_APPLICATION_ID),
  )) as APIGuildMember;
  const botHighestRole = getHighestRole(roles, me.roles);
  if (!botHighestRole && owner_id !== ctx.env.DISCORD_APPLICATION_ID) {
    // You could be running an instance of this bot where
    // the bot is the owner of the guild
    return ctx.reply({
      content: `I can't assign <@&${role.id}> to members because I don't have any roles.`,
      flags: MessageFlags.Ephemeral,
    });
  } else if (botHighestRole && role.position >= botHighestRole.position) {
    return ctx.reply({
      content: `<@&${role.id}> is higher than my highest role (<@&${botHighestRole.id}>), so I can't assign it to members. <@&${role.id}> needs to be lower in the role list, or my highest role needs to be higher.`,
      flags: MessageFlags.Ephemeral,
    });
  }
  // biome-ignore lint/style/noNonNullAssertion: guild-only
  const member = ctx.interaction.member!;
  const memberHighestRole = getHighestRole(roles, member.roles);
  if (!memberHighestRole && owner_id !== ctx.user.id) {
    // Guild owner has all permissions. This message should never be seen
    // unless someone messes with permissions.
    return ctx.reply({
      content: `You can't assign <@&${role.id}> to members because you don't have any roles.`,
      flags: MessageFlags.Ephemeral,
    });
  } else if (memberHighestRole && role.position >= memberHighestRole.position) {
    return ctx.reply({
      content: `<@&${role.id}> is higher than your highest role (<@&${memberHighestRole.id}>), so you can't select it to be assigned to members. <@&${role.id}> needs to be lower in the role list, or your highest role needs to be higher.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const state = ctx.state as ComponentFlow;
  state.steps = state.steps ?? [];
  state.steps.push({ label: `Set role: <@&${role.id}>` });

  // Assume button
  const { flowId } = state.component as StorableButtonWithCustomId;
  const actions = config.build({ roleId: role.id });

  const db = getDb(ctx.env.HYPERDRIVE);
  await db.transaction(async (tx) => {
    await tx.delete(flowActions).where(eq(flowActions.flowId, BigInt(flowId)));
    await tx.insert(flowActions).values(
      actions.map((action) => ({
        flowId: BigInt(flowId),
        type: action.type,
        data: action,
      })),
    );
  });

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
    ctx.modal(modal.toJSON()),
    async () => {
      await ctx.followup.editOriginalMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
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
            )
            .toJSON(),
        ],
      });
    },
  ];
};
