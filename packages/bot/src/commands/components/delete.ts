import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  messageLink,
} from "@discordjs/builders";
import {
  type APIComponentInContainer,
  type APIComponentInMessageActionRow,
  type APIContainerComponent,
  type APIEmoji,
  type APIInteraction,
  type APIMessage,
  type APIMessageTopLevelComponent,
  type APISectionComponent,
  ButtonStyle,
  ComponentType,
  type RESTPatchAPIWebhookWithTokenMessageJSONBody,
  Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import {
  autoRollbackTx,
  destroyComponentDurableObject,
  discordMessageComponents,
  getDb,
} from "store";
import type { ChatInputAppCommandCallback } from "../../commands.js";
import type {
  AutoComponentCustomId,
  ButtonCallback,
  SelectMenuCallback,
} from "../../components.js";
import type { InteractionContext } from "../../interactions.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import {
  getComponentId,
  getRemainingComponentsCount,
  isComponentsV2,
  isStorableComponent,
  parseAutoComponentId,
  storeComponents,
  textDisplay,
} from "../../util/components.js";
import { getComponentsAsV2Menu } from "./edit.js";
import { getWebhookMessage, resolveMessageLink } from "./entry.js";

export const deleteComponentChatEntry: ChatInputAppCommandCallback<
  true
> = async (ctx) => {
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

  return await pickWebhookMessageComponentToDelete(ctx, message);
};

const pickWebhookMessageComponentToDelete = async (
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
    getSelectCustomId: (index) =>
      `a_delete-component-pick_${message.webhook_id}:${message.id}:${threadId}:${index}` satisfies AutoComponentCustomId,
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
    .setAccentColor(0xed4245)
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) =>
          td.setContent(
            [
              "### Delete Component",
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

export const deleteComponentButtonEntry: ButtonCallback = async (ctx) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) {
    return ctx.reply("Guild-only");
  }

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
  const { message } = await getWebhookMessage(
    ctx.env,
    webhookId,
    messageId,
    threadId,
    ctx.rest,
  );

  const response = await pickWebhookMessageComponentToDelete(ctx, message);
  return ctx.updateMessage(response.data);
};

export const extractComponentByPath = (
  message: APIMessage,
  path: number[],
  options?: {
    operation: "remove" | "replace";
    replacement?:
      | APIComponentInMessageActionRow
      | (() => APIComponentInMessageActionRow);
  },
): APIComponentInMessageActionRow | null => {
  let parent: APIContainerComponent | undefined;
  let siblings: (
    | APIMessageTopLevelComponent
    | APIComponentInMessageActionRow
    | APIComponentInContainer
  )[] = message.components ?? [];
  let indexIndex = -1; // where we are in the path; the index of indexes
  for (const index of path) {
    indexIndex += 1;
    const atIndex = siblings[index];
    if (!atIndex) break;

    if (
      atIndex.type === ComponentType.Section &&
      // Sections cannot be navigated into further so we have to get it
      // in the second-to-last path position (the last value for section
      // accessories is always 0)
      indexIndex === path.length - 2
    ) {
      if (atIndex.accessory.type !== ComponentType.Button) return null;
      if (options?.operation === "remove") {
        siblings.splice(
          index,
          1,
          new TextDisplayBuilder({ id: atIndex.id })
            .setContent(
              atIndex.components
                .map((td) => td.content)
                .join("\n")
                .slice(0, 4000),
            )
            .toJSON(),
        );
      } else if (options?.operation === "replace" && options.replacement) {
        const replacement =
          typeof options.replacement === "function"
            ? options.replacement()
            : options.replacement;
        if (replacement.type !== atIndex.accessory.type) {
          throw Error(
            `Conflicting type for accessory component replacement (${atIndex.accessory.type} to ${replacement.type})`,
          );
        }
        atIndex.accessory = replacement;
      }
      return atIndex.accessory;
    }
    if (atIndex.type === ComponentType.Container) {
      siblings = atIndex.components;
      parent = atIndex;
      continue;
    }
    if (atIndex.type === ComponentType.ActionRow) {
      siblings = atIndex.components;
      continue;
    }
    if (isStorableComponent(atIndex)) {
      if (options?.operation === "remove") {
        siblings.splice(index, 1);
        if (siblings.length === 0) {
          // Remove the empty action row, which should be the second-to-last path index
          ((parent ?? message).components ?? []).splice(path.slice(-2)[0], 1);
        }
      } else if (options?.operation === "replace" && options.replacement) {
        const replacement =
          typeof options.replacement === "function"
            ? options.replacement()
            : options.replacement;
        if (replacement.type !== atIndex.type) {
          throw Error(
            `Conflicting type for component replacement (${atIndex.type} to ${replacement.type})`,
          );
        }
        siblings.splice(index, 1, replacement);
      }
      return atIndex;
    }
  }
  return null;
};

const componentsOrEmptyBody = (
  message: Pick<APIMessage, "components" | "flags">,
): RESTPatchAPIWebhookWithTokenMessageJSONBody => {
  return message.components?.length !== 0
    ? { components: message.components }
    : isComponentsV2(message)
      ? {
          components: [textDisplay("Empty message").toJSON()],
        }
      : {
          content: "Empty message",
        };
};

export const deleteComponentFlowPickCallback: SelectMenuCallback = async (
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
      const path = ctx.interaction.data.values[0]
        .split(":")[2]
        .split(".")
        .map(Number);

      const component = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          id: true,
          guildId: true,
          messageId: true,
        },
      });
      if (
        component?.guildId &&
        component.messageId &&
        (component.guildId?.toString() !== ctx.interaction.guild_id ||
          component.messageId?.toString() !== messageId)
      ) {
        return ctx.updateMessage({
          components: [textDisplay("Unknown component")],
        });
      }
      if (!component) {
        const { webhook, message } = await getWebhookMessage(
          ctx.env,
          webhookId,
          messageId,
          threadId,
          ctx.rest,
        );
        const removed = extractComponentByPath(message, path, {
          operation: "remove",
        });
        if (removed === null) {
          return ctx.updateMessage({
            components: [
              textDisplay("Unable to locate the component in the message."),
            ],
          });
        }

        await ctx.rest.patch(
          Routes.webhookMessage(webhook.id, webhook.token, message.id),
          {
            body: componentsOrEmptyBody(message),
            auth: false,
            query: threadId
              ? new URLSearchParams({ thread_id: threadId })
              : undefined,
          },
        );
        return ctx.updateMessage({
          components: [
            textDisplay(
              "The component was already missing from the database, so it has been removed from the message.",
            ),
          ],
        });
      }

      return ctx.updateMessage({
        components: [
          textDisplay(
            "Are you sure you want to delete this component? This cannot be undone.",
          ),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(await storeComponents(ctx.env.KV, [
              new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel("Delete"),
              {
                componentRoutingId: "delete-component-confirm",
                componentTimeout: 600,
                componentOnce: true,
                webhookId,
                messageId,
                threadId,
                componentId: component.id,
                path,
              },
            ])),
            new ButtonBuilder()
              .setCustomId(
                "a_delete-component-cancel_" satisfies AutoComponentCustomId,
              )
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Cancel"),
          ),
        ],
      });
    }
    case "link": {
      const path = key.split(".").map(Number);
      const { webhook, message } = await getWebhookMessage(
        ctx.env,
        webhookId,
        messageId,
        threadId,
        ctx.rest,
      );
      const removed = extractComponentByPath(message, path, {
        operation: "remove",
      });
      if (removed === null) {
        return ctx.updateMessage({
          components: [
            textDisplay(
              `The button could not be located in the message (${key}).`,
            ),
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
      const matchId = getComponentId(removed, dbComponents);
      if (matchId === undefined) {
        await ctx.rest.patch(
          Routes.webhookMessage(webhook.id, webhook.token, message.id),
          {
            body: componentsOrEmptyBody(message),
            auth: false,
            query: threadId
              ? new URLSearchParams({ thread_id: threadId })
              : undefined,
          },
        );
        return ctx.updateMessage({
          components: [
            textDisplay(
              "The button was already missing from the database, so it has been removed from the message.",
            ),
          ],
        });
      }

      return ctx.updateMessage({
        components: [
          textDisplay(
            "Are you sure you want to delete this component? This cannot be undone.",
          ),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...(await storeComponents(ctx.env.KV, [
              new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel("Delete"),
              {
                componentRoutingId: "delete-component-confirm",
                componentTimeout: 600,
                componentOnce: true,
                webhookId,
                messageId,
                threadId,
                componentId: matchId,
                path,
              },
            ])),
            new ButtonBuilder()
              .setCustomId(
                "a_delete-component-cancel_" satisfies AutoComponentCustomId,
              )
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Cancel"),
          ),
        ],
      });
    }
    default:
      return ctx.reply({
        components: [
          textDisplay(
            "Cannot resolve that component from the database. Try editing another component to remove it.",
          ),
        ],
        ephemeral: true,
        componentsV2: true,
      });
  }
};

const registerComponentDelete = async (
  ctx: InteractionContext<APIInteraction>,
  id: bigint,
  type: ComponentType,
  webhook: { id: string; token: string; guild_id?: string },
  message: APIMessage,
  path: number[],
  shouldKeepRecord?: boolean,
) => {
  const db = getDb(ctx.env.HYPERDRIVE);
  const customId = `p_${id}`;

  const removed = extractComponentByPath(message, path, {
    operation: "remove",
  });
  if (removed === null) {
    throw new Error(
      `Couldn't find the row that this component is on. Try editing via the site instead (choose "Everything")`,
    );
  }

  const editedMsg = await db.transaction(
    autoRollbackTx(async (tx) => {
      if (!shouldKeepRecord) {
        await tx
          .delete(discordMessageComponents)
          .where(eq(discordMessageComponents.id, id));
      }

      // An error thrown here triggers a rollback
      return (await ctx.rest.patch(
        Routes.webhookMessage(webhook.id, webhook.token, message.id),
        {
          body: componentsOrEmptyBody(message),
          query:
            message.position !== undefined
              ? new URLSearchParams({ thread_id: message.channel_id })
              : undefined,
        },
      )) as APIMessage;
    }),
  );

  if (!shouldKeepRecord) {
    await destroyComponentDurableObject(ctx.env, {
      messageId: editedMsg.id,
      customId,
      componentId: id,
    });
  }

  return editedMsg;
};

export const deleteComponentConfirm: ButtonCallback = async (ctx) => {
  const { webhookId, messageId, threadId, componentId, path } = ctx.state as {
    webhookId: string;
    messageId: string;
    threadId?: string;
    componentId: string;
    path: number[];
  };

  const { webhook, message } = await getWebhookMessage(
    ctx.env,
    webhookId,
    messageId,
    threadId,
    ctx.rest,
  );

  const db = getDb(ctx.env.HYPERDRIVE);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      type: true,
      guildId: true,
      messageId: true,
    },
  });
  // Allow removal from the message, but not record deletion, if the
  // component's messageId/guildId hasn't been stored for whatever
  // reason
  const shouldKeepRecord = !component?.guildId || !component?.messageId;
  if (
    component &&
    ((component.guildId &&
      component.guildId.toString() !== ctx.interaction.guild_id) ||
      (component.messageId && component.messageId.toString() !== messageId))
  ) {
    return ctx.updateMessage({
      components: [
        textDisplay("That component does not belong to this server."),
      ],
    });
  }

  if (!component) {
    const removed = extractComponentByPath(message, path, {
      operation: "remove",
    });
    if (removed === null) {
      return ctx.updateMessage({
        components: [
          textDisplay("The component could not be located in the message."),
        ],
      });
    }
    await ctx.rest.patch(
      Routes.webhookMessage(webhook.id, webhook.token, message.id),
      {
        body: componentsOrEmptyBody(message),
        query:
          message.position !== undefined
            ? new URLSearchParams({ thread_id: message.channel_id })
            : undefined,
      },
    );
  } else {
    await registerComponentDelete(
      ctx,
      component.id,
      component.type,
      webhook,
      message,
      path,
      shouldKeepRecord,
    );
  }
  return ctx.updateMessage({
    components: [
      textDisplay(
        `Component deleted successfully: ${messageLink(
          message.channel_id,
          message.id,
          // biome-ignore lint/style/noNonNullAssertion:
          (webhook.guild_id ?? ctx.interaction.guild_id)!,
        )}`,
      ),
    ],
  });
};

export const deleteComponentCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    components: [textDisplay("The component is safe and sound.")],
  });
};
