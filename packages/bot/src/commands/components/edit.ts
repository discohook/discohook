import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  ModalBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  messageLink,
} from "@discordjs/builders";
import { isLinkButton } from "discord-api-types/utils";
import {
  APIComponentInMessageActionRow,
  APIEmoji,
  APIInteraction,
  APIMessage,
  APIMessageComponentEmoji,
  APIMessageTopLevelComponent,
  APIPartialEmoji,
  APISectionComponent,
  APISelectMenuOption,
  ButtonStyle,
  ComponentType,
  Routes,
  TextInputStyle,
} from "discord-api-types/v10";
import { sql } from "drizzle-orm";
import { t } from "i18next";
import {
  StorableButtonWithUrl,
  StorableComponent,
  autoRollbackTx,
  discordMessageComponents,
  getDb,
  launchComponentDurableObject,
  makeSnowflake,
  upsertDiscordUser,
  webhooks,
} from "store";
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
import {
  chunkArray,
  getComponentId,
  getRemainingComponentsCount,
  isActionRow,
  parseAutoComponentId,
  textDisplay,
} from "../../util/components.js";
import { MAX_SELECT_OPTIONS } from "../../util/constants.js";
import { color } from "../../util/meta.js";
import { resolveEmoji } from "../reactionRoles.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import {
  buildStorableComponent,
  generateEditorTokenForComponent,
  getEditorTokenComponentUrl,
} from "./add.js";
import { extractComponentByPath } from "./delete.js";
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
      components: [textDisplay(message)],
      ephemeral: true,
      componentsV2: true,
    });
  }
  if (
    !message.webhook_id ||
    !message.application_id ||
    !ctx.env.APPLICATIONS[message.application_id]
  ) {
    return ctx.reply({
      components: [
        textDisplay(
          !message.webhook_id
            ? "This is not a webhook message."
            : !message.application_id
              ? `This message's webhook is owned by a user, so it cannot have components.`
              : `This message's webhook is owned by <@${message.application_id}>, so I cannot edit it.`,
        ),
      ],
      ephemeral: true,
      componentsV2: true,
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

function ensureValidEmoji<T extends APIMessageComponentEmoji | APIPartialEmoji>(
  emoji: T | undefined,
  emojis: APIEmoji[],
  fallback: T,
): T;
function ensureValidEmoji<T extends APIMessageComponentEmoji | APIPartialEmoji>(
  emoji: T | undefined,
  emojis: APIEmoji[],
  fallback?: T | undefined,
): T | undefined;
function ensureValidEmoji<T extends APIMessageComponentEmoji | APIPartialEmoji>(
  emoji: T | undefined,
  emojis: APIEmoji[],
  fallback?: T,
): T | undefined {
  return emoji?.id
    ? emojis.find((e) => e.id === emoji?.id)
      ? emoji
      : fallback
    : emoji?.name
      ? emoji
      : fallback;
}

/** Don't use this for all message components unless it's CV1 */
const getComponentsAsOptions = (
  components: APIMessageTopLevelComponent[],
  emojis: APIEmoji[],
  dbComponents?: { id: bigint; data: StorableComponent }[],
  /**
   * If we're processing data individually (not as part of the whole message),
   * we can elect to modify the paths with otherwise unknown parent data.
   * This ensures components aren't given incorrect top-level paths.
   */
  arrayConfig?: {
    padStart?: number;
    topLevelIndex?: number;
  },
): APISelectMenuOption[] => {
  const childToOption = (
    child: APIComponentInMessageActionRow,
    /** Array of indexes */
    parents: number[],
  ): APISelectMenuOption | undefined => {
    const id = getComponentId(child, dbComponents);

    // try to naturally describe where the component is
    let location = "";
    let column = -1;
    if (parents.length === 3) {
      location = `container ${parents[0] + 1}, row ${parents[1] + 1}`;
      column = parents[2] + 1;
    } else if (parents.length === 2) {
      location = `stack row ${parents[0] + 1}`;
      column = parents[1] + 1;
    }
    const path = parents.join(".");
    const value = id
      ? `id:${id}:${path}`
      : child.type === ComponentType.Button && isLinkButton(child)
        ? `link:${path}`
        : `unknown:${path}`;

    switch (child.type) {
      case ComponentType.Button: {
        if (child.style === ButtonStyle.Premium) {
          return undefined;
        }
        const styleEmoji: Record<typeof child.style, string> = {
          [ButtonStyle.Danger]: "🟥",
          [ButtonStyle.Link]: "🌐",
          [ButtonStyle.Primary]: "🟦",
          [ButtonStyle.Secondary]: "⬜",
          [ButtonStyle.Success]: "🟩",
        };
        const emoji = ensureValidEmoji(child.emoji, emojis, {
          name: styleEmoji[child.style],
        });

        return {
          label: child.label ?? "Emoji-only",
          value,
          description: `${
            child.style === ButtonStyle.Link ? "Link" : "Button"
          }, ${location}, column ${column}`,
          emoji,
        };
      }
      case ComponentType.StringSelect:
        return {
          label: (child.placeholder ?? `${child.options.length} options`).slice(
            0,
            100,
          ),
          value,
          description: `Select, ${location}`,
          emoji: { name: "🔽" },
        };
      case ComponentType.ChannelSelect:
      case ComponentType.MentionableSelect:
      case ComponentType.RoleSelect:
      case ComponentType.UserSelect:
        return {
          label: (
            child.placeholder ?? `${child.default_values?.length ?? 0} defaults`
          ).slice(0, 100),
          value,
          description: `Select, ${location}`,
          emoji: {
            name:
              child.type === ComponentType.ChannelSelect
                ? "#️⃣"
                : child.type === ComponentType.MentionableSelect
                  ? "*️⃣"
                  : child.type === ComponentType.RoleSelect
                    ? "🏷️"
                    : "👤",
          },
        };
      default:
        break;
    }
  };

  const pad = (array: number[]): number[] => {
    if (arrayConfig?.topLevelIndex !== undefined) {
      array.splice(0, 1, arrayConfig.topLevelIndex + array[0]);
    }
    if (arrayConfig?.padStart !== undefined)
      return [arrayConfig.padStart, ...array];
    return array;
  };

  return components
    .flatMap((component, ri) => {
      if (component.type === ComponentType.Container) {
        return component.components.flatMap((containerChild, cci) => {
          if (isActionRow(containerChild)) {
            return containerChild.components.map((child, ci) =>
              childToOption(child, pad([ri, cci, ci])),
            );
          } else if (
            containerChild.type === ComponentType.Section &&
            containerChild.accessory.type === ComponentType.Button &&
            containerChild.accessory.style !== ButtonStyle.Premium
          ) {
            return [childToOption(containerChild.accessory, pad([ri, cci, 0]))];
          }
          return [];
        });
      } else if (isActionRow(component)) {
        return component.components.map((child, ci) =>
          childToOption(child, pad([ri, ci])),
        );
      } else if (
        component.type === ComponentType.Section &&
        component.accessory.type === ComponentType.Button &&
        component.accessory.style !== ButtonStyle.Premium
      ) {
        return [childToOption(component.accessory, pad([ri, 0]))];
      }
      return [];
    })
    .filter((c): c is APISelectMenuOption => !!c);
};

// Create a menu simulating the real positions in the message
export const getComponentsAsV2Menu = (
  components: APIMessageTopLevelComponent[],
  emojis: APIEmoji[],
  options?: {
    dbComponents?: { id: bigint; data: StorableComponent }[];
    getSelectCustomId?: (index: number) => string;
  },
): APIMessageTopLevelComponent[] => {
  const { dbComponents, getSelectCustomId = () => "" } = options ?? {};

  const recreated: typeof components = [];
  let selectId = 0;
  let totalI = -1;
  for (const component of components) {
    totalI += 1;
    switch (component.type) {
      case ComponentType.Container: {
        const container: typeof component = {
          type: component.type,
          accent_color: component.accent_color,
          components: [],
        };
        const allChildren = getComponentsAsOptions(
          component.components,
          emojis,
          dbComponents,
          { padStart: totalI },
        );
        const chunkedOptions = chunkArray(allChildren, MAX_SELECT_OPTIONS);
        let i = 0;
        for (const options of chunkedOptions) {
          if (options.length === 0) continue;
          const previousCount = i * MAX_SELECT_OPTIONS + 1;
          const select = new StringSelectMenuBuilder()
            .setCustomId(getSelectCustomId(selectId))
            .setPlaceholder(
              `${previousCount}-${
                previousCount + options.length - 1
              } container components`,
            )
            .addOptions(options);
          container.components.push({
            type: ComponentType.ActionRow,
            components: [select.toJSON()],
          });
          i += 1;
          selectId += 1;
        }
        if (container.components.length > 0) recreated.push(container);
        break;
      }
      // 1:1 for top-level component count
      case ComponentType.Section:
      case ComponentType.ActionRow: {
        const options = getComponentsAsOptions(
          [component],
          emojis,
          dbComponents,
          { topLevelIndex: totalI },
        );
        if (options.length === 0) break;

        const typeName =
          component.type === ComponentType.Section ? "Section" : "Row";
        const select = new StringSelectMenuBuilder()
          .setCustomId(getSelectCustomId(selectId))
          .setPlaceholder(
            `${typeName} ${totalI + 1} - ${options.length} component${
              options.length === 1 ? "" : "s"
            }`,
          )
          .addOptions(options);
        recreated.push({
          type: ComponentType.ActionRow,
          components: [select.toJSON()],
        });
        selectId += 1;
        break;
      }
    }
  }

  return recreated;
};

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

  const threadId = message.position === undefined ? "" : message.channel_id;
  const menu = getComponentsAsV2Menu(message.components ?? [], emojis, {
    getSelectCustomId: (index: number) =>
      `a_edit-component-flow-pick_${message.webhook_id}:${message.id}:${threadId}:${index}` satisfies AutoComponentCustomId,
  });
  if (menu.length === 0) {
    return ctx.reply({
      components: [
        textDisplay("That message has no components that can be picked from."),
      ],
      ephemeral: true,
      componentsV2: true,
    });
  }

  const menuContainer = new ContainerBuilder()
    .setAccentColor(color)
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) =>
          td.setContent(
            [
              "### Edit Component",
              "**Message**",
              messageLink(message.channel_id, message.id, guildId),
            ].join("\n"),
          ),
        )
        .setThumbnailAccessory((t) =>
          t
            .setURL(
              webhookAvatarUrl({
                id: message.author.id,
                avatar: message.author.avatar,
              }),
            )
            .setDescription(message.author.username),
        ),
    )
    .toJSON();
  // Due to the reduction taking place to form a menu, at least one of these
  // should almost always be displayed
  const free = getRemainingComponentsCount(menu, true);
  if (free >= 3) {
    menu.splice(0, 0, menuContainer);
  } else if (free >= 2) {
    menu.splice(0, 0, menuContainer.components[0]);
  } else if (free >= 1) {
    menu.splice(
      0,
      0,
      (menuContainer.components[0] as APISectionComponent).components[0],
    );
  }
  return ctx.reply({ components: menu, ephemeral: true, componentsV2: true });
};

const getComponentPickCallbackData = (
  messageId: string,
  componentId: bigint,
  path: number[],
): MessageConstructorData => ({
  componentsV2: true,
  components: [
    textDisplay(
      "What aspect of this component would you like to edit? Surface details are what users can see before clicking on the component.",
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId(
          `a_edit-component-flow-mode_${messageId}:${componentId}:${path.join(
            ".",
          )}` satisfies AutoComponentCustomId,
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
      const path = ctx.interaction.data.values[0]
        .split(":")[2]
        .split(".")
        .map(Number);
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
        (component.messageId !== null &&
          component.messageId?.toString() !== messageId)
      ) {
        return ctx.updateMessage({
          components: [textDisplay("Unknown component")],
        });
      }

      return ctx.updateMessage(
        getComponentPickCallbackData(messageId, component.id, path),
      );
    }
    case "link": {
      const path = key.split(".").map(Number);
      const { message } = await getWebhookMessage(
        ctx.env,
        webhookId,
        messageId,
        threadId,
        ctx.rest,
      );
      const foundComponent = extractComponentByPath(message, path);
      if (
        !foundComponent ||
        foundComponent.type !== ComponentType.Button ||
        foundComponent.style !== ButtonStyle.Link
      ) {
        return ctx.updateMessage({
          components: [
            textDisplay("The button could not be located in the message."),
          ],
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

      const modal = getComponentEditModal(dbComponent, messageId, path);
      return [
        ctx.modal(modal.toJSON()),
        async () => {
          await ctx.followup.editOriginalMessage({
            components: [
              textDisplay("Click the button to resume editing."),
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId(
                    `a_edit-component-flow-modal-resend_${messageId}:${
                      dbComponent.id
                    }:${path.join(".")}` satisfies AutoComponentCustomId,
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
        components: [
          textDisplay("Cannot resolve that component from the database."),
        ],
        ephemeral: true,
        componentsV2: true,
      });
  }
};

const getComponentEditModal = (
  component: {
    id: bigint;
    data: StorableComponent;
  },
  messageId: string,
  path: number[],
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_edit-component-flow-modal_${messageId}:${component.id}:${path.join(
        ".",
      )}` satisfies AutoModalCustomId,
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
  const {
    messageId,
    componentId,
    path: path_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
    "path",
  );
  const path = path_.split(".").map(Number);
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
    (component.messageId !== null &&
      component.messageId?.toString() !== messageId)
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({
      components: [textDisplay("Unknown component")],
    });
  }

  if (mode === "internal") {
    const modal = getComponentEditModal(component, messageId, path);
    // TODO: also allow changing button style in this mode
    return [
      ctx.modal(modal.toJSON()),
      async () => {
        await ctx.followup.editOriginalMessage({
          components: [
            textDisplay("Click the button to continue editing the component."),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `a_edit-component-flow-modal-resend_${messageId}:${componentId}:${path_}` satisfies AutoComponentCustomId,
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
    components: [
      textDisplay(
        "Click the button to open your browser and edit the component.",
      ),
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
  path: number[],
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

  const foundComponent = extractComponentByPath(message, path, {
    operation: "replace",
    replacement: built,
  });
  if (!foundComponent) {
    throw new Error(
      `Couldn't find the row that this component is on. Try editing via the site instead (choose "Everything")`,
    );
  }

  const editedMsg = await db.transaction(
    autoRollbackTx(async (tx) => {
      await tx
        .insert(discordMessageComponents)
        .values({
          id,
          guildId: webhook.guild_id
            ? makeSnowflake(webhook.guild_id)
            : undefined,
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
          body: { components: message.components },
          query:
            message.position !== undefined
              ? new URLSearchParams({ thread_id: message.channel_id })
              : undefined,
        },
      )) as APIMessage;
    }),
  );

  if (customId !== undefined) {
    await launchComponentDurableObject(ctx.env, {
      messageId: editedMsg.id,
      componentId: id,
      customId,
    });
  }
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
    path: path_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
    "path",
  );
  const path = path_.split(".").map(Number);

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
    (component.messageId !== null &&
      component.messageId?.toString() !== messageId)
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({
      components: [textDisplay("Unknown component")],
    });
  }
  // biome-ignore lint/style/noNonNullAssertion: Only a guild-only command should get us here
  const guildId = (component.guildId?.toString() ?? ctx.interaction.guild_id)!;

  const channelId =
    component.channelId?.toString() ?? ctx.interaction.channel?.id;
  if (!channelId) {
    return ctx.updateMessage({
      components: [textDisplay("Channel context was unavailable")],
    });
  }

  let message: APIMessage | undefined;
  try {
    message = (await ctx.rest.get(
      Routes.channelMessage(channelId, messageId),
    )) as APIMessage;
  } catch {
    return ctx.updateMessage({
      components: [
        textDisplay(
          `Failed to fetch the message (${messageId}). Make sure I am able to view <#${channelId}>.`,
        ),
      ],
    });
  }
  const webhookId = message.webhook_id;
  if (!webhookId) {
    return ctx.updateMessage({
      components: [
        textDisplay(
          `Apparently, the message (${messageId}) was not sent by a webhook. This shouldn't happen.`,
        ),
      ],
    });
  }
  const webhook = await getWebhook(webhookId, ctx.env, message.application_id);
  if (!webhook.token) {
    return ctx.updateMessage({
      components: [
        textDisplay(
          `The webhook's token (ID ${webhookId}) is not accessible, so I cannot edit the message.`,
        ),
      ],
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
              components: [
                textDisplay("Invalid emoji: Contains invalid characters."),
              ],
              ephemeral: true,
              componentsV2: true,
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
              components: [
                textDisplay(
                  "Could not find an emoji that matches the input. For a custom emoji, try using the numeric ID, and make sure Discohook has access to it.",
                ),
              ],
              ephemeral: true,
              componentsV2: true,
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
            components: [textDisplay("Invalid URL")],
            ephemeral: true,
            componentsV2: true,
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
        components: [
          textDisplay("Disabled field must be either `true` or `false`."),
        ],
        ephemeral: true,
        componentsV2: true,
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
    path,
  );

  return ctx.updateMessage({
    components: [
      textDisplay(
        `Message edited successfully: ${messageLink(
          edited.channel_id,
          edited.id,
          guildId,
        )}`,
      ),
    ],
  });
};

export const editComponentFlowModalResendCallback: ButtonCallback = async (
  ctx,
) => {
  const {
    messageId,
    componentId,
    path: path_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
    "path",
  );
  const path = path_.split(".").map(Number);

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
    (component.messageId !== null &&
      component.messageId?.toString() !== messageId)
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({
      components: [textDisplay("Unknown component")],
    });
  }

  return ctx.modal(getComponentEditModal(component, messageId, path).toJSON());
};
