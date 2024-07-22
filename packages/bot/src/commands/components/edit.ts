import {
  ActionRowBuilder,
  ButtonBuilder,
  MessageActionRowComponentBuilder,
  ModalBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  messageLink,
} from "@discordjs/builders";
import { isLinkButton } from "discord-api-types/utils";
import {
  APIEmoji,
  APIInteraction,
  APIMessage,
  APIMessageComponentEmoji,
  APIPartialEmoji,
  APISelectMenuOption,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  Routes,
  TextInputStyle,
} from "discord-api-types/v10";
import { t } from "i18next";
import { getDb, launchComponentDurableObject, upsertDiscordUser } from "store";
import {
  discordMessageComponents,
  makeSnowflake,
} from "store/src/schema/schema.js";
import { StorableComponent } from "store/src/types/components.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import {
  AutoComponentCustomId,
  AutoModalCustomId,
  ButtonCallback,
  ModalCallback,
  SelectMenuCallback,
} from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { getComponentId, parseAutoComponentId } from "../../util/components.js";
import { resolveEmoji } from "../reactionRoles.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import {
  buildStorableComponent,
  generateEditorTokenForComponent,
  getEditorTokenComponentUrl,
} from "./add.js";
import { resolveMessageLink } from "./entry.js";

export const editComponentChatEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const message = await resolveMessageLink(
    ctx.rest,
    ctx.getStringOption("message").value,
  );
  if (typeof message === "string") {
    return ctx.reply({
      content: message,
      flags: MessageFlags.Ephemeral,
    });
  }

  return await pickWebhookMessageComponentToEdit(ctx, message);
};

export const pickWebhookMessageComponentToEdit = async (
  ctx: InteractionContext,
  message: APIMessage,
) => {
  const mapping: Record<string, string> = {};

  // const rows = (message.components ?? []).map((row) => ({
  //   ...row,
  //   components: row.components.map(
  //     (component): APIButtonComponentWithCustomId => {
  //       const custom_id = generateId();
  //       switch (component.type) {
  //         case ComponentType.Button:
  //           if (component.style === ButtonStyle.Premium) {
  //             return {
  //               type: component.type,
  //               style: ButtonStyle.Primary,
  //               custom_id,
  //               label: "Premium",
  //               emoji: { name: "🛒" },
  //               // We can't really do anything with these
  //               disabled: true,
  //             };
  //           }
  //           if (component.style === ButtonStyle.Link) {
  //             return {
  //               type: component.type,
  //               style: ButtonStyle.Secondary,
  //               custom_id,
  //               label: component.label,
  //               emoji: component.emoji,
  //             };
  //           }
  //           return {
  //             ...component,
  //             custom_id,
  //           };
  //         case ComponentType.StringSelect:
  //           return {
  //             type: ComponentType.Button,
  //             custom_id,
  //           };
  //         default:
  //           break;
  //       }
  //     },
  //   ),
  // }));

  const emojis = ctx.interaction.guild_id
    ? ((await ctx.rest.get(
        Routes.guildEmojis(ctx.interaction.guild_id),
      )) as APIEmoji[])
    : [];

  const options = (message.components ?? []).flatMap((row, ri) =>
    row.components
      .map((component, ci): APISelectMenuOption | undefined => {
        const id = getComponentId(component);
        const value = id
          ? `id:${id}`
          : component.type === ComponentType.Button && isLinkButton(component)
            ? `link:${ri}-${ci}`
            : `unknown:${ri}-${ci}`;

        switch (component.type) {
          case ComponentType.Button: {
            if (component.style === ButtonStyle.Premium) {
              return undefined;
            }
            const styleEmoji: Record<typeof component.style, string> = {
              [ButtonStyle.Danger]: "🟥",
              [ButtonStyle.Link]: "🌐",
              [ButtonStyle.Primary]: "🟦",
              [ButtonStyle.Secondary]: "⬜",
              [ButtonStyle.Success]: "🟩",
            };
            const emoji = component.emoji?.id
              ? emojis.find((e) => e.id === component.emoji?.id)
                ? component.emoji
                : { name: styleEmoji[component.style] }
              : component.emoji?.name
                ? component.emoji
                : { name: styleEmoji[component.style] };

            return {
              label: component.label ?? "Emoji-only",
              value,
              description: `${
                component.style === ButtonStyle.Link ? "Link button" : "Button"
              }, row ${ri + 1}, column ${ci + 1}`,
              emoji,
            };
          }
          case ComponentType.StringSelect:
            return {
              label: (
                component.placeholder ?? `${component.options.length} options`
              ).slice(0, 100),
              value,
              description: `Select menu, row ${ri + 1}`,
              emoji: { name: "🔽" },
            };
          case ComponentType.ChannelSelect:
          case ComponentType.MentionableSelect:
          case ComponentType.RoleSelect:
          case ComponentType.UserSelect:
            return {
              label: (
                component.placeholder ??
                `${component.default_values?.length ?? 0} defaults`
              ).slice(0, 100),
              value,
              description: `Select menu, row ${ri + 1}`,
              emoji: {
                name:
                  component.type === ComponentType.ChannelSelect
                    ? "#️⃣"
                    : component.type === ComponentType.MentionableSelect
                      ? "*️⃣"
                      : component.type === ComponentType.RoleSelect
                        ? "🏷️"
                        : "👤",
              },
            };
          default:
            break;
        }
      })
      .filter((c): c is APISelectMenuOption => !!c),
  );

  if (options.length === 0) {
    return ctx.reply({
      content: "That message has no components that can be picked from.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(
      `a_edit-component-flow-pick_${message.id}` satisfies AutoComponentCustomId,
    )
    .setPlaceholder("Select a component to edit")
    .addOptions(options);

  return ctx.reply({
    components: [
      new ActionRowBuilder<typeof select>().addComponents(select).toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const editComponentFlowPickCallback: SelectMenuCallback = async (
  ctx,
) => {
  const { messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
  );

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);

  const [scope, key] = ctx.interaction.data.values[0].split(":");
  switch (scope as "id" | "link" | "unknown") {
    case "id": {
      const id = BigInt(key);
      const component = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          id: true,
          guildId: true,
          messageId: true,
        },
      });
      if (
        !component ||
        component.guildId?.toString() !== ctx.interaction.guild_id ||
        component.messageId?.toString() !== messageId
      ) {
        return ctx.updateMessage({
          content: "Unknown component",
          components: [],
        });
      }

      return ctx.updateMessage({
        content:
          "What aspect of this component would you like to edit? Surface details are what users can see before clicking on the component.",
        components: [
          new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
              new SelectMenuBuilder()
                .setCustomId(
                  `a_edit-component-flow-mode_${messageId}:${component.id}` satisfies AutoComponentCustomId,
                )
                .addOptions(
                  new SelectMenuOptionBuilder()
                    .setLabel("Details")
                    .setValue("internal")
                    .setDescription(
                      "Just change the surface details without leaving Discord",
                    ),
                  new SelectMenuOptionBuilder()
                    .setLabel("Everything")
                    .setValue("external")
                    .setDescription(
                      "Change what happens when this component is used",
                    ),
                ),
            )
            .toJSON(),
        ],
      });
    }
    default:
      // As far as we know, this component doesn't exist in the database or
      // it's a type that we can't handle. What do you do here?
      // Answer for a prize: https://github.com/discohook/discohook/issues
      return ctx.reply({
        content: "Cannot resolve that component from the database.",
        flags: MessageFlags.Ephemeral,
      });
  }
};

const getComponentEditModal = (
  component: {
    id: bigint;
    data: StorableComponent;
  },
  messageId: string,
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_edit-component-flow-modal_${messageId}:${component.id}` satisfies AutoModalCustomId,
    )
    .setTitle("Edit Component");

  switch (component.data.type) {
    case ComponentType.Button:
      if (component.data.style === ButtonStyle.Premium) {
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("sku_id")
              .setLabel("SKU ID")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(component.data.sku_id)
              .setPlaceholder("Identifier for a purchasable SKU"),
          ),
        );
      } else {
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("label")
              .setLabel("Label")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setMaxLength(80)
              .setValue(component.data.label ?? "")
              .setPlaceholder("The text displayed on this button."),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("emoji")
              .setLabel("Emoji")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setValue(
                component.data.emoji?.id ?? component.data.emoji?.name ?? "",
              )
              .setPlaceholder("Like :smile: or a custom emoji in the server."),
          ),
        );
        if (component.data.style === ButtonStyle.Link) {
          modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("url")
                .setLabel("Button URL")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(component.data.url)
                .setPlaceholder(
                  "The full URL this button will lead to when it is clicked.",
                ),
            ),
          );
        }
      }
      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("disabled")
            .setLabel("Disabled?")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMinLength(4)
            .setMaxLength(5)
            .setValue(String(component.data.disabled ?? false))
            .setPlaceholder(
              'Type "true" or "false" for whether the button should be unclickable.',
            ),
        ),
      );
      break;
    case ComponentType.StringSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.RoleSelect:
    case ComponentType.UserSelect:
      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("placeholder")
            .setLabel("Placeholder")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(150)
            .setRequired(false)
            .setValue(component.data.placeholder ?? "")
            .setPlaceholder(
              "The text to show in the select menu when it is collapsed.",
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
            .setValue(String(component.data.disabled ?? false))
            .setPlaceholder(
              'Type "true" or "false" for whether the select should be unclickable.',
            ),
        ),
      );
      break;
    default:
      break;
  }
  return modal;
};

export const editComponentFlowModeCallback: SelectMenuCallback = async (
  ctx,
) => {
  const { messageId, componentId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
  );
  const mode = ctx.interaction.data.values[0] as "internal" | "external";

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      data: true,
      guildId: true,
      messageId: true,
    },
  });
  if (
    !component ||
    component.guildId?.toString() !== ctx.interaction.guild_id ||
    component.messageId?.toString() !== messageId
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({ content: "Unknown component", components: [] });
  }

  if (mode === "internal") {
    const modal = getComponentEditModal(component, messageId);
    // TODO: also allow changing button style in this mode
    return [
      ctx.modal(modal.toJSON()),
      async () => {
        await ctx.followup.editOriginalMessage({
          content: "Click the button to continue editing the component.",
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(
                    `a_edit-component-flow-modal-resend_${messageId}:${componentId}` satisfies AutoComponentCustomId,
                  )
                  .setStyle(ButtonStyle.Secondary)
                  .setLabel(t("customize")),
              )
              .toJSON(),
          ],
        });
      },
    ];
  }

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

  return ctx.updateMessage({
    content: "Click the button to open your browser and edit the component.",
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(t("customize"))
            .setURL(getEditorTokenComponentUrl(editorToken, ctx.env)),
        )
        .toJSON(),
    ],
  });
};

const registerComponentUpdate = async (
  ctx: InteractionContext<APIInteraction>,
  id: bigint,
  data: StorableComponent,
  webhook: { id: string; token: string; guild_id?: string },
  message: APIMessage,
) => {
  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  const user = await upsertDiscordUser(db, ctx.user);

  const customId =
    data.type === ComponentType.Button &&
    (data.style === ButtonStyle.Link || data.style === ButtonStyle.Premium)
      ? undefined
      : `p_${id}`;

  const built = buildStorableComponent(data, customId);
  if (!built) {
    throw new Error(`Failed to built the component (type ${data.type}).`);
  }

  const components = message.components ?? [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().toJSON(),
  ];
  const row = components.find((c) =>
    c.components
      .filter((c) => c.type === built.type)
      .map(getComponentId)
      .includes(id),
  );
  const current = row?.components.find(
    (c) => c.type === built.type && getComponentId(c) === id,
  );
  if (!row || !current) {
    throw new Error(
      `Couldn't find the row that this component is on. Try editing via the site instead (choose "Everything")`,
    );
  }
  row.components.splice(row.components.indexOf(current), 1, built);

  const editedMsg = await db.transaction(async (tx) => {
    await tx
      .insert(discordMessageComponents)
      .values({
        id,
        guildId: webhook.guild_id ? makeSnowflake(webhook.guild_id) : undefined,
        channelId: makeSnowflake(message.channel_id),
        messageId: makeSnowflake(message.id),
        createdById: user.id,
        type: data.type,
        data,
      })
      .onConflictDoUpdate({
        target: discordMessageComponents.id,
        set: {
          data,
          draft: false,
          updatedAt: new Date(),
          updatedById: user.id,
        },
      });

    // An error thrown here triggers a rollback
    return (await ctx.rest.patch(
      Routes.webhookMessage(webhook.id, webhook.token, message.id),
      {
        body: { components },
        query:
          message.position !== undefined
            ? new URLSearchParams({ thread_id: message.channel_id })
            : undefined,
      },
    )) as APIMessage;
  });

  await launchComponentDurableObject(ctx.env, {
    messageId: editedMsg.id,
    componentId: id,
    customId: customId ?? `p_${id}`,
  });
  return editedMsg;
};

export const partialEmojiToComponentEmoji = (
  emoji: APIPartialEmoji,
): APIMessageComponentEmoji => ({
  id: emoji.id ?? undefined,
  name: emoji.name ?? undefined,
  animated: emoji.animated,
});

export const editComponentFlowModalCallback: ModalCallback = async (ctx) => {
  const { messageId, componentId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
  );

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      data: true,
      guildId: true,
      channelId: true,
      messageId: true,
    },
  });
  if (
    !component ||
    component.guildId?.toString() !== ctx.interaction.guild_id ||
    component.messageId?.toString() !== messageId
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({ content: "Unknown component", components: [] });
  }
  // biome-ignore lint/style/noNonNullAssertion: Only a guild-only command should get us here
  const guildId = (component.guildId?.toString() ?? ctx.interaction.guild_id)!;

  const channelId =
    component.channelId?.toString() ?? ctx.interaction.channel?.id;
  if (!channelId) {
    return ctx.updateMessage({
      content: "Channel context was unavailable",
      components: [],
    });
  }

  let message: APIMessage | undefined;
  try {
    message = (await ctx.rest.get(
      Routes.channelMessage(channelId, messageId),
    )) as APIMessage;
  } catch {
    return ctx.updateMessage({
      content: `Failed to fetch the message (${messageId}). Make sure I am able to view <#${channelId}>.`,
      components: [],
    });
  }
  const webhookId = message.webhook_id;
  if (!webhookId) {
    return ctx.updateMessage({
      content: `Apparently, the message (${messageId}) was not sent by a webhook. This shouldn't happen.`,
      components: [],
    });
  }
  const webhook = await getWebhook(webhookId, ctx.env, message.application_id);
  if (!webhook.token) {
    return ctx.updateMessage({
      content: `The webhook's token (ID ${webhookId}) is not accessible, so I cannot edit the message.`,
      components: [],
    });
  }

  const data: StorableComponent = component.data;
  switch (data.type) {
    case ComponentType.Button:
      if (data.style === ButtonStyle.Premium) {
        data.sku_id = ctx.getModalComponent("sku_id").value;
      } else {
        data.label = ctx.getModalComponent("label")?.value || undefined;
        const emojiRaw = ctx.getModalComponent("emoji")?.value || undefined;
        if (!emojiRaw) {
          data.emoji = undefined;
        } else {
          if (emojiRaw.includes(" ")) {
            return ctx.reply({
              content: "Invalid emoji: Contains invalid characters.",
              flags: MessageFlags.Ephemeral,
            });
          }

          const emoji = await resolveEmoji(
            ctx.rest,
            emojiRaw,
            undefined,
            guildId,
            ctx.env.DISCOHOOK_ORIGIN,
          );
          if (!emoji) {
            return ctx.reply({
              content:
                "Could not find an emoji that matches the input. For a custom emoji, try using the numeric ID, and make sure Discohook has access to it.",
              flags: MessageFlags.Ephemeral,
            });
          }
          data.emoji = partialEmojiToComponentEmoji(emoji);
        }
      }
      if (data.style === ButtonStyle.Link) {
        let url: URL;
        try {
          url = new URL(ctx.getModalComponent("url").value);
          if (!["http:", "https:", "discord:"].includes(url.protocol)) {
            throw Error("Protocol must be `http`, `https`, or `discord`.");
          }
        } catch (e) {
          return ctx.reply({
            content: "Invalid URL",
            flags: MessageFlags.Ephemeral,
          });
        }
        url.searchParams.set("dhc-id", componentId);
        data.url = url.href;
      }
      break;
    default:
      break;
  }
  const disabledRaw = ctx.getModalComponent("disabled")?.value;
  if (disabledRaw) {
    if (!["true", "false"].includes(disabledRaw.toLowerCase())) {
      return ctx.reply({
        content: "Disabled field must be either `true` or `false`.",
        flags: MessageFlags.Ephemeral,
      });
    }
    data.disabled = disabledRaw.toLowerCase() === "true";
  }

  const edited = await registerComponentUpdate(
    ctx,
    component.id,
    data,
    {
      id: webhookId,
      token: webhook.token,
      guild_id: guildId,
    },
    message,
  );

  return ctx.updateMessage({
    content: `Message edited successfully: ${messageLink(
      edited.channel_id,
      edited.id,
      guildId,
    )}`,
    components: [],
  });
};

export const editComponentFlowModalResendCallback: ButtonCallback = async (
  ctx,
) => {
  const { messageId, componentId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
  );

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      data: true,
      guildId: true,
      messageId: true,
    },
  });
  if (
    !component ||
    component.guildId?.toString() !== ctx.interaction.guild_id ||
    component.messageId?.toString() !== messageId
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({ content: "Unknown component", components: [] });
  }

  return ctx.modal(getComponentEditModal(component, messageId).toJSON());
};
