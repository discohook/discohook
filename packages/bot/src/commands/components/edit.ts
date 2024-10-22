import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
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
  APIActionRowComponent,
  APIEmoji,
  APIInteraction,
  APIMessage,
  APIMessageActionRowComponent,
  APIMessageComponentEmoji,
  APIPartialEmoji,
  APISelectMenuOption,
  ButtonStyle,
  ComponentType,
  Routes,
  TextInputStyle,
} from "discord-api-types/v10";
import { sql } from "drizzle-orm";
import { t } from "i18next";
import { getDb, launchComponentDurableObject, upsertDiscordUser } from "store";
import {
  discordMessageComponents,
  makeSnowflake,
  webhooks,
} from "store/src/schema/schema.js";
import {
  StorableButtonWithUrl,
  StorableComponent,
} from "store/src/types/components.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import {
  AutoComponentCustomId,
  AutoModalCustomId,
  ButtonCallback,
  ModalCallback,
  SelectMenuCallback,
} from "../../components.js";
import {
  InteractionContext,
  MessageConstructorData,
} from "../../interactions.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { getComponentId, parseAutoComponentId } from "../../util/components.js";
import { color } from "../../util/meta.js";
import { resolveEmoji } from "../reactionRoles.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import {
  buildStorableComponent,
  generateEditorTokenForComponent,
  getEditorTokenComponentUrl,
} from "./add.js";
import { getWebhookMessage, resolveMessageLink } from "./entry.js";

export const editComponentChatEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const message = await resolveMessageLink(
    ctx.rest,
    ctx.getStringOption("message").value,
    ctx.interaction.guild_id,
  );
  if (typeof message === "string") {
    return ctx.reply({
      content: message,
      ephemeral: true,
    });
  }
  if (
    !message.webhook_id ||
    !message.application_id ||
    !ctx.env.APPLICATIONS[message.application_id]
  ) {
    return ctx.reply({
      content: !message.webhook_id
        ? "This is not a webhook message."
        : !message.application_id
          ? `This message's webhook is owned by a user, so it cannot have components.`
          : `This message's webhook is owned by <@${message.application_id}>, so I cannot edit it.`,
      ephemeral: true,
    });
  }

  const webhook = await getWebhook(
    message.webhook_id,
    ctx.env,
    message.application_id,
  );

  const response = await pickWebhookMessageComponentToEdit(ctx, message);
  return [
    response,
    async () => {
      const db = getDb(ctx.env.HYPERDRIVE);
      await db
        .insert(webhooks)
        .values({
          platform: "discord",
          id: webhook.id,
          token: webhook.token,
          applicationId: webhook.application_id,
          name: webhook.name ?? "Webhook",
          avatar: webhook.avatar,
          channelId: webhook.channel_id,
          discordGuildId: webhook.guild_id
            ? BigInt(webhook.guild_id)
            : undefined,
        })
        .onConflictDoUpdate({
          target: [webhooks.platform, webhooks.id],
          set: {
            token: sql`excluded.token`,
            applicationId: sql`excluded."applicationId"`,
            name: sql`excluded.name`,
            avatar: sql`excluded.avatar`,
            channelId: sql`excluded."channelId"`,
            discordGuildId: sql`excluded."discordGuildId"`,
          },
        });
    },
  ];
};

export const editComponentButtonEntry: ButtonCallback = async (ctx) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) {
    return ctx.reply("Guild-only");
  }

  const { webhookId, messageId, threadId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
    "messageId",
    "threadId",
  );
  const { message } = await getWebhookMessage(
    ctx.env,
    webhookId,
    messageId,
    threadId,
    ctx.rest,
  );

  const response = await pickWebhookMessageComponentToEdit(ctx, message);
  return ctx.updateMessage(response.data);
};

export const getComponentsAsOptions = (
  components: APIActionRowComponent<APIMessageActionRowComponent>[],
  emojis: APIEmoji[],
  dbComponents?: { id: bigint; data: StorableComponent }[],
) =>
  components.flatMap((row, ri) =>
    row.components
      .map((component, ci): APISelectMenuOption | undefined => {
        const id = getComponentId(component, dbComponents);
        const value = id
          ? `id:${id}:${ri}-${ci}`
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

const pickWebhookMessageComponentToEdit = async (
  ctx: InteractionContext,
  message: APIMessage,
) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) {
    return ctx.reply("Guild only");
  }

  const emojis = (await ctx.rest.get(
    Routes.guildEmojis(guildId),
  )) as APIEmoji[];

  const options = getComponentsAsOptions(message.components ?? [], emojis);
  if (options.length === 0) {
    return ctx.reply({
      content: "That message has no components that can be picked from.",
      embeds: [],
      components: [],
      ephemeral: true,
    });
  }

  const threadId = message.position === undefined ? "" : message.channel_id;
  const select = new StringSelectMenuBuilder()
    .setCustomId(
      `a_edit-component-flow-pick_${message.webhook_id}:${message.id}:${threadId}` satisfies AutoComponentCustomId,
    )
    .setPlaceholder("Select a component to edit")
    .addOptions(options);

  return ctx.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Edit Component")
        .setColor(color)
        .addFields({
          name: "Message",
          value: messageLink(message.channel_id, message.id, guildId),
        })
        .setThumbnail(
          webhookAvatarUrl({
            id: message.author.id,
            avatar: message.author.avatar,
          }),
        ),
    ],
    components: [new ActionRowBuilder<typeof select>().addComponents(select)],
    ephemeral: true,
  });
};

export const getComponentPickCallbackData = (
  messageId: string,
  componentId: bigint,
): MessageConstructorData => ({
  content:
    "What aspect of this component would you like to edit? Surface details are what users can see before clicking on the component.",
  embeds: [],
  components: [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId(
          `a_edit-component-flow-mode_${messageId}:${componentId}` satisfies AutoComponentCustomId,
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
            .setDescription("Change what happens when this component is used"),
        ),
    ),
  ],
});

export const editComponentFlowPickCallback: SelectMenuCallback = async (
  ctx,
) => {
  const {
    webhookId,
    messageId,
    threadId: threadId_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
    "messageId",
    "threadId",
  );
  const threadId = threadId_ || undefined;

  const db = getDb(ctx.env.HYPERDRIVE);

  const [scope, key] = ctx.interaction.data.values[0].split(":");
  switch (scope as "id" | "link" | "unknown") {
    case "id": {
      const id = BigInt(key);
      // const position = ctx.interaction.data.values[0]
      //   .split(":")[2]
      //   .split("-")
      //   .map(Number) as [number, number];

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

      return ctx.updateMessage(
        getComponentPickCallbackData(messageId, component.id),
      );
    }
    case "link": {
      const [row, column] = key.split("-").map(Number);
      const { message } = await getWebhookMessage(
        ctx.env,
        webhookId,
        messageId,
        threadId,
        ctx.rest,
      );
      const rows = message.components ?? [];
      const foundComponent = rows[row]?.components?.[column];
      if (
        !foundComponent ||
        foundComponent.type !== ComponentType.Button ||
        foundComponent.style !== ButtonStyle.Link
      ) {
        return ctx.updateMessage({
          content:
            "A button was referenced by its position but it is now missing.",
          components: [],
        });
      }

      const dbComponents = await db.query.discordMessageComponents.findMany({
        where: (table, { eq, and }) =>
          and(
            eq(table.messageId, BigInt(messageId)),
            eq(table.type, ComponentType.Button),
          ),
        columns: {
          id: true,
          data: true,
        },
      });
      let dbComponent = dbComponents.find(
        (c) =>
          c.data.type === ComponentType.Button &&
          c.data.style === ButtonStyle.Link &&
          c.data.url === foundComponent.url,
      );
      if (!dbComponent) {
        dbComponent = (
          await db
            .insert(discordMessageComponents)
            .values({
              channelId: makeSnowflake(message.channel_id),
              messageId: makeSnowflake(message.id),
              // biome-ignore lint/style/noNonNullAssertion: Guild only
              guildId: makeSnowflake(ctx.interaction.guild_id!),
              type: ComponentType.Button,
              data: foundComponent satisfies StorableButtonWithUrl,
            })
            .returning({
              id: discordMessageComponents.id,
              data: discordMessageComponents.data,
            })
        )[0];
      }

      const modal = getComponentEditModal(dbComponent, messageId, [
        row,
        column,
      ]);
      return [
        ctx.modal(modal.toJSON()),
        async () => {
          await ctx.followup.editOriginalMessage({
            content: "Click the button to resume editing the button.",
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId(
                    `a_edit-component-flow-modal-resend_${messageId}:${dbComponent.id}:${row},${column}` satisfies AutoComponentCustomId,
                  )
                  .setStyle(ButtonStyle.Secondary)
                  .setLabel(t("customize")),
              ),
            ],
          });
        },
      ];
    }
    default:
      // As far as we know, this component doesn't exist in the database or
      // it's a type that we can't handle. What do you do here?
      // Answer for a prize: https://github.com/discohook/discohook/issues
      return ctx.reply({
        content: "Cannot resolve that component from the database.",
        ephemeral: true,
      });
  }
};

const getComponentEditModal = (
  component: {
    id: bigint;
    data: StorableComponent;
  },
  messageId: string,
  position?: [number, number],
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_edit-component-flow-modal_${messageId}:${component.id}${
        position ? `:${position[0]},${position[1]}` : ""
      }` satisfies AutoModalCustomId,
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

  const db = getDb(ctx.env.HYPERDRIVE);
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
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `a_edit-component-flow-modal-resend_${messageId}:${componentId}` satisfies AutoComponentCustomId,
                )
                .setStyle(ButtonStyle.Secondary)
                .setLabel(t("customize")),
            ),
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
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(t("customize"))
          .setURL(getEditorTokenComponentUrl(editorToken, ctx.env)),
      ),
    ],
  });
};

const registerComponentUpdate = async (
  ctx: InteractionContext<APIInteraction>,
  id: bigint,
  data: StorableComponent,
  webhook: { id: string; token: string; guild_id?: string },
  message: APIMessage,
  position?: [y: number, x: number],
) => {
  const db = getDb(ctx.env.HYPERDRIVE);
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
  let row: APIActionRowComponent<APIMessageActionRowComponent> | undefined;
  let current: APIMessageActionRowComponent | undefined;
  if (position) {
    row = components[position[0]];
    current = row?.components?.[position[1]];
  } else {
    row = components.find((c) =>
      c.components
        .filter((c) => c.type === built.type)
        .map((c) => getComponentId(c))
        .includes(id),
    );
    current = row?.components.find(
      (c) => c.type === built.type && getComponentId(c) === id,
    );
  }
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
  const {
    messageId,
    componentId,
    position: position_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
    "position",
  );
  const position = position_
    ? (position_.split(",").map(Number) as [number, number])
    : undefined;

  const db = getDb(ctx.env.HYPERDRIVE);
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
              ephemeral: true,
            });
          }

          const emoji = await resolveEmoji(
            ctx.rest,
            emojiRaw,
            undefined,
            guildId,
            ctx.env,
          );
          if (!emoji) {
            return ctx.reply({
              content:
                "Could not find an emoji that matches the input. For a custom emoji, try using the numeric ID, and make sure Discohook has access to it.",
              ephemeral: true,
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
            ephemeral: true,
          });
        }
        if (url.searchParams.get("dhc-id")) {
          url.searchParams.delete("dhc-id");
        }
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
        ephemeral: true,
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
    position,
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
  const {
    messageId,
    componentId,
    position: position_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
    "position",
  );

  const db = getDb(ctx.env.HYPERDRIVE);
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

  return ctx.modal(
    getComponentEditModal(
      component,
      messageId,
      position_
        ? (position_.split(",").map(Number) as [number, number])
        : undefined,
    ).toJSON(),
  );
};
