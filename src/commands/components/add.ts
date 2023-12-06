import { APIInteraction, APIMessage, APIModalInteractionResponseCallbackData, APISelectMenuDefaultValue, APISelectMenuOption, ButtonStyle, ComponentType, SelectMenuDefaultValueType, TextInputStyle } from "discord-api-types/v10";
import { InteractionContext } from "../../interactions.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, messageLink } from "@discordjs/builders";
import { color } from "../../util/meta.js";
import { getCustomId, storeComponents } from "../../util/components.js";
import { getDb } from "../../db/index.js";
import { discordUsers, users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { Flow } from "../../types/components/flows.js";
import { ButtonCallback, MinimumKVComponentState, SelectMenuCallback } from "../../components.js";

interface ComponentFlow extends MinimumKVComponentState {
  step: number;
  stepTitle: string;
  totalSteps?: number;
  steps?: {
    label: string;
  }[];
  message: {
    id: string;
    channelId: string;
    guildId: string;
    webhookId: string;
    webhookName: string;
    webhookAvatar: string | null;
  };
  user: {
    id?: number;
    subscribedSince: Date | null;
  };
  component?:
    | {
      type: ComponentType.Button;
      style:
        | ButtonStyle.Primary
        | ButtonStyle.Secondary
        | ButtonStyle.Success
        | ButtonStyle.Danger;
      flow: Flow;
      disabled?: boolean;
    } | {
      type: ComponentType.Button;
      style: ButtonStyle.Link;
      url: string;
      disabled?: boolean;
    } | {
      type: ComponentType.StringSelect;
      flows: Record<string, Flow>;
      options: APISelectMenuOption[];
      placeholder?: string;
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    } | {
      type:
        | ComponentType.UserSelect
        | ComponentType.RoleSelect
        | ComponentType.MentionableSelect
        | ComponentType.ChannelSelect;
      flow: Flow;
      placeholder?: string;
      defaultValues: APISelectMenuDefaultValue<SelectMenuDefaultValueType>[];
      disabled?: boolean;
    }
}

const getComponentFlowEmbed = (flow: ComponentFlow) => {
  const embed = new EmbedBuilder({
    title: flow.stepTitle + (flow.totalSteps
      ? ` - Step ${flow.step}/${flow.totalSteps} (${Math.floor((flow.step / flow.totalSteps) * 100)}%)`
      : ""),
    description: flow.steps
      ? flow.steps.map((step, i) => `${i + 1}. ${step.label}`).join("\n")
      : undefined,
    color,
  })
    .addFields({
      name: "Message",
      value: messageLink(flow.message.channelId, flow.message.id, flow.message.guildId),
    });

  if (flow.step === 0) {
    embed.setThumbnail(webhookAvatarUrl({
      id: flow.message.webhookId,
      avatar: flow.message.webhookAvatar,
    }));
  } else {
    embed.setAuthor({
      name: flow.message.webhookName.slice(0, 256) || "Webhook",
      iconURL: webhookAvatarUrl({
        id: flow.message.webhookId,
        avatar: flow.message.webhookAvatar,
      }),
    })
  }

  return embed;
}

export const startComponentFlow = async (ctx: InteractionContext<APIInteraction>, message: APIMessage) => {
  const db = getDb(ctx.env.DB);
  let user: ComponentFlow["user"] | undefined = await db.query.users.findFirst({
    where: eq(users.discordId, BigInt(ctx.user.id)),
    columns: {
      id: true,
      subscribedSince: true,
    },
  });
  if (!user) {
    await db
      .insert(discordUsers)
      .values({
        id: BigInt(ctx.user.id),
        name: ctx.user.username,
        globalName: ctx.user.global_name,
        avatar: ctx.user.avatar,
        discriminator: ctx.user.discriminator,
      })
      .onConflictDoUpdate({
        target: discordUsers.id,
        set: {
          name: ctx.user.username,
          globalName: ctx.user.global_name,
          avatar: ctx.user.avatar,
          discriminator: ctx.user.discriminator,
        },
      });

    // Couldn't figure out how to get returning({ ... }) working properly
    await db
      .insert(users)
      .values({
        discordId: BigInt(ctx.user.id),
        name: ctx.user.global_name ?? ctx.user.username,
      })
      .onConflictDoNothing();

    user = { subscribedSince: null };
  }

  const componentFlow: ComponentFlow = {
    componentTimeout: 60,
    componentRoutingId: "add-component-flow",
    step: 0,
    stepTitle: "Add Component",
    message: {
      id: message.id,
      channelId: message.channel_id,
      guildId: ctx.interaction.guild_id!,
      webhookId: message.webhook_id ?? message.author.id,
      webhookName: message.author.username,
      webhookAvatar: message.author.avatar,
    },
    user,
  };

  // Maybe switch to a quickie web form instead of a long flow like this
  // but some users prefer to stay within discord (for whatever reason!)
  return ctx.reply({
    embeds: [getComponentFlowEmbed(componentFlow).toJSON()],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      await storeComponents(ctx.env.KV,
        [new StringSelectMenuBuilder({
          placeholder: "Select a component type",
          options: [
            {
              label: "Button",
              description: "One press to execute one or several actions",
              value: "button",
              emoji: { name: "🟦" },
            },
            {
              label: "Link Button",
              description: "Direct a user to a specified URL",
              value: "link-button",
              emoji: { name: "🌐" },
            },
            {
              label: "String Select",
              description: "Select from a custom list of options to execute actions",
              value: "string-select",
              emoji: { name: "🔽" },
            },
            {
              label: "User Select",
              description: "Select from a list of users to execute actions",
              value: "user-select",
              emoji: { name: "👤" },
            },
            {
              label: "Role Select",
              description: "Select from a list of roles to execute actions",
              value: "role-select",
              emoji: { name: "🏷️" },
            },
            {
              label: "User/Role Select",
              description: "Select from a list of users and roles to execute actions",
              value: "mentionable-select",
              emoji: { name: "*️⃣" },
            },
            {
              label: "Channel Select",
              description: "Select from a list of channels to execute actions",
              value: "channel-select",
              emoji: { name: "#️⃣" },
            },
          ],
        }), componentFlow],
      )
    ).toJSON()],
  });
}

export const continueComponentFlow: SelectMenuCallback = async (ctx) => {
  const value = ctx.interaction.data.values[0];

  const state = ctx.state as ComponentFlow;
  state.steps = [];
  state.steps.push({ label: `Select component type (${value.replace('-', ' ')})` });

  state.step += 1;
  switch (value) {
    case "button": {
      state.stepTitle = "Finish on the web";
      state.totalSteps = 3;
      return ctx.updateMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Customize")
            .setURL(`${ctx.env.BOOGIEHOOK_ORIGIN}/`)
        ).toJSON()],
      });
    }
    case "link-button": {
      state.stepTitle = "Customize the button's link & emoji";
      state.totalSteps = 3;

      const modal = new ModalBuilder()
        .setTitle("Custom button values")
        .setCustomId(getCustomId(true))
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
              new TextInputBuilder()
                .setCustomId("url")
                .setLabel("Button URL")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder("The full URL this button will lead to when it is clicked.")
            ),
          new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
              new TextInputBuilder()
                .setCustomId("emoji")
                .setLabel("Emoji")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder("Like :smile: or a custom emoji in the server.")
            )
        )
        .toJSON();

      return [
        ctx.modal(modal),
        async () => {
          await ctx.followup.editOriginalMessage({
            embeds: [getComponentFlowEmbed(state).toJSON()],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
              await storeComponents(ctx.env.KV, [
                new ButtonBuilder({
                  style: ButtonStyle.Primary,
                  label: "Open modal",
                }),
                {
                  componentRoutingId: "add-component-flow_customize-modal",
                  componentTimeout: 600,
                  modal,
                }
              ]),
            ).toJSON()],
          });
        }
      ];
    }
    case "string-select": {
      // state.stepTitle = "";
      // state.totalSteps = 0;
      break;
    }
    case "user-select": {
      // state.stepTitle = "";
      // state.totalSteps = 0;
      break;
    }
    case "role-select": {
      // state.stepTitle = "";
      // state.totalSteps = 0;
      break;
    }
    case "mentionable-select": {
      // state.stepTitle = "";
      // state.totalSteps = 0;
      break;
    }
    case "channel-select": {
      // state.stepTitle = "";
      // state.totalSteps = 0;
      break;
    }
    default:
      break;
  }

  return ctx.updateMessage({
    embeds: [getComponentFlowEmbed(state).toJSON()],
    components: [],
  });
}

export const reopenCustomizeModal: ButtonCallback = async (ctx) => {
  const state = ctx.state as MinimumKVComponentState & {
    modal: APIModalInteractionResponseCallbackData;
  };
  return ctx.modal(state.modal);
}
