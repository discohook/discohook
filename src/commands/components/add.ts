import { APIButtonComponent, APIInteraction, APIMessage, APIMessageComponentEmoji, APIModalInteractionResponseCallbackData, APISelectMenuComponent, APISelectMenuDefaultValue, APISelectMenuOption, APIStringSelectComponent, APIWebhook, ButtonStyle, ComponentType, MessageFlags, Routes, SelectMenuDefaultValueType, TextInputStyle } from "discord-api-types/v10";
import { InteractionContext } from "../../interactions.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, messageLink } from "@discordjs/builders";
import { color } from "../../util/meta.js";
import { getComponentWidth, getCustomId, getRowWidth, storeComponents } from "../../util/components.js";
import { getDb, upsertDiscordUser, upsertGuild } from "../../db/index.js";
import { discordMessageComponents, discordUsers, makeSnowflake, users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { Flow } from "../../types/components/flows.js";
import { ButtonCallback, MinimumKVComponentState, ModalCallback, SelectMenuCallback } from "../../components.js";
import { BUTTON_URL_RE } from "../../util/regex.js";
import { isDiscordError } from "../../util/error.js";
import dedent from "dedent-js";
import { getchGuild } from "../../util/kv.js";

export type StorableComponent =
  | {
    type: ComponentType.Button;
    style:
      | ButtonStyle.Primary
      | ButtonStyle.Secondary
      | ButtonStyle.Success
      | ButtonStyle.Danger;
    label?: string;
    emoji?: APIMessageComponentEmoji;
    flow: Flow;
    disabled?: boolean;
  } | {
    type: ComponentType.Button;
    style: ButtonStyle.Link;
    label?: string;
    emoji?: APIMessageComponentEmoji;
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
    minValues?: number;
    maxValues?: number;
    defaultValues?: APISelectMenuDefaultValue<SelectMenuDefaultValueType>[];
    disabled?: boolean;
  }

const buildStorableComponent = (component: StorableComponent, customId?: string):
  | APIButtonComponent
  | APISelectMenuComponent
  | undefined => {
  switch (component.type) {
    case ComponentType.Button:
      return {
        type: component.type,
        custom_id: component.style === ButtonStyle.Link ? undefined : customId,
        url: component.style === ButtonStyle.Link ? component.url : undefined,
        style: component.style,
        label: component.label,
        emoji: component.emoji,
        disabled: component.disabled,
      } as APIButtonComponent;
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
}

interface ComponentFlow extends MinimumKVComponentState {
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
    guildId: string;
    webhookId: string;
    webhookName: string;
    webhookAvatar: string | null;
  };
  user: {
    id?: number;
    subscribedSince: Date | null;
  };
  component?: StorableComponent;
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

const registerComponent = async (
  ctx: InteractionContext<APIInteraction>,
  flow: ComponentFlow,
) => {
  const data = flow.component!;

  const customId = data.type === ComponentType.Button && data.style === ButtonStyle.Link
    ? undefined
    : getCustomId(false);
  const built = buildStorableComponent(data, customId);
  if (!built) {
    throw new Error(`Failed to built the component (type ${data.type}).`);
  }
  const requiredWidth = getComponentWidth(built);

  let message;
  try {
    message = await ctx.client.get(
      Routes.webhookMessage(flow.message.webhookId, flow.webhookToken, flow.message.id),
    ) as APIMessage;
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

  const components = message.components ?? [new ActionRowBuilder().toJSON()];
  let nextAvailableRow = components.find(c => 5 - getRowWidth(c) >= requiredWidth);
  if (!nextAvailableRow && components.length < 5) {
    nextAvailableRow = new ActionRowBuilder().toJSON();
    components.push(nextAvailableRow);
  } else if (!nextAvailableRow) {
    throw new Error(`No available slots for this component (need at least ${requiredWidth}).`);
  }
  nextAvailableRow.components.push(built);

  const db = getDb(ctx.env.DB);
  const returned = await db.insert(discordMessageComponents).values({
    guildId: makeSnowflake(flow.message.guildId),
    channelId: makeSnowflake(flow.message.channelId),
    messageId: makeSnowflake(flow.message.id),
    createdById: flow.user.id,
    customId,
    data,
  }).returning();
  const insertedId = returned[0].id;

  try {
    return await ctx.client.patch(
      Routes.webhookMessage(flow.message.webhookId, flow.webhookToken, flow.message.id),
      { body: { components }},
    ) as APIMessage
  } catch (e) {
    if (isDiscordError(e)) {
      await db
        .delete(discordMessageComponents)
        .where(eq(discordMessageComponents.id, insertedId));
    }
    throw e;
  }
}

export const startComponentFlow = async (ctx: InteractionContext<APIInteraction>, message: APIMessage) => {
  const db = getDb(ctx.env.DB);
  const user = await upsertDiscordUser(db, ctx.user);

  if (!message.webhook_id) {
    return ctx.reply({
      content: "This is not a webhook message.",
      flags: MessageFlags.Ephemeral,
    });
  }
  let webhookToken;
  try {
    const webhook = await ctx.client.get(Routes.webhook(message.webhook_id)) as APIWebhook;
    webhookToken = webhook.token;
  } catch {
  }
  if (!webhookToken) {
    return ctx.reply({
      content: `
        Webhook token (ID ${message.webhook_id}) was not available.
        It may be an incompatible type of webhook, or it may have been
        created by a different bot user.
      `,
      flags: MessageFlags.Ephemeral,
    });
  }

  const componentFlow: ComponentFlow = {
    componentTimeout: 60,
    componentRoutingId: "add-component-flow",
    step: 0,
    stepTitle: "Add Component",
    webhookToken,
    message: {
      id: message.id,
      channelId: message.channel_id,
      guildId: ctx.interaction.guild_id!,
      webhookId: message.webhook_id,
      webhookName: message.author.username,
      webhookAvatar: message.author.avatar,
    },
    user,
  };

  const guild = await getchGuild(ctx.client, ctx.env.KV, ctx.interaction.guild_id!);
  await upsertGuild(db, guild);

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
        }), {
          ...componentFlow,
          componentOnce: true,
        }],
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
      state.stepTitle = "Customize the button's link, label, & emoji";
      state.totalSteps = 3;
      state.component = {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url: "",
      }

      const modal = new ModalBuilder()
        .setTitle("Custom button values")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
              new TextInputBuilder()
                .setCustomId("label")
                .setLabel("Label")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(80)
                .setPlaceholder("The text displayed on this button.")
            ),
          new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
              new TextInputBuilder()
                .setCustomId("emoji")
                .setLabel("Emoji")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder("Like :smile: or a custom emoji in the server.")
            ),
          new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
              new TextInputBuilder()
                .setCustomId("url")
                .setLabel("Button URL")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder("The full URL this button will lead to when it is clicked.")
            ),
        );

      await storeComponents(
        ctx.env.KV,
        [modal, {
          ...state,
          componentTimeout: 600,
          componentRoutingId: "add-component-flow_customize-modal",
          componentOnce: false,
        }],
      );

      return [
        ctx.modal(modal.toJSON()),
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
                  componentRoutingId: "add-component-flow_customize-modal-resend",
                  componentTimeout: 600,
                  modal: modal.toJSON(),
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

export const submitCustomizeModal: ModalCallback = async (ctx) => {
  const state = ctx.state as ComponentFlow;

  if (state.component?.type === ComponentType.Button) {
    const label = ctx.getModalComponent('label').value,
      emoji = ctx.getModalComponent('emoji').value;

    if (!label && !emoji) {
      return ctx.reply({
        content: "Must provide either a label or emoji.",
        flags: MessageFlags.Ephemeral,
      });
    }

    state.component.label = label;
    // state.component.emoji = emoji;
    // state.step += 1;
    // state.steps!.push({ label: `Set label (${escapeMarkdown(label)})` });
    // state.step += 1;
    // state.steps!.push({ label: `Set emoji (${escapeMarkdown(label)})` });

    if (state.component.style === ButtonStyle.Link) {
      const url = ctx.getModalComponent('url').value;
      if (!BUTTON_URL_RE.test(url)) {
        return ctx.reply({
          content: "Invalid URL. Must be a `http://`, `https://`, or `discord://` address.",
          flags: MessageFlags.Ephemeral,
        });
      }

      state.component.url = url;
      state.step += 1;
      state.steps!.push({ label: "Set URL" });

      try {
        await registerComponent(ctx, state);
      } catch (e) {
        // return ctx.reply({ content: String(e), flags: MessageFlags.Ephemeral });
        throw e;
      }

      return ctx.updateMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [],
      });
    }
  }

  return ctx.reply('a')
}
