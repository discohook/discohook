import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  messageLink,
} from "@discordjs/builders";
import {
  APIActionRowComponent,
  APIComponentInMessageActionRow,
  APIEmoji,
  APIInteraction,
  APIMessage,
  ButtonStyle,
  ComponentType,
  Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { discordMessageComponents, getDb } from "store";
import { ChatInputAppCommandCallback } from "../../commands.js";
import {
  AutoComponentCustomId,
  ButtonCallback,
  SelectMenuCallback,
} from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import {
  getComponentId,
  parseAutoComponentId,
  storeComponents,
} from "../../util/components.js";
import { getComponentsAsOptions } from "./edit.js";
import { getWebhookMessage, resolveMessageLink } from "./entry.js";

export const deleteComponentChatEntry: ChatInputAppCommandCallback<true> =
  async (ctx) => {
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
      `a_delete-component-pick_${message.webhook_id}:${message.id}:${threadId}` satisfies AutoComponentCustomId,
    )
    .setPlaceholder("Select a component to delete")
    .addOptions(options);

  return ctx.reply({
    embeds: [
      new EmbedBuilder({
        title: "Delete Component",
        color: 0xed4245,
      })
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
      const position = ctx.interaction.data.values[0]
        .split(":")[2]
        .split("-")
        .map(Number) as [number, number];

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
          content: "Unknown component",
          components: [],
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
        const rows = message.components ?? [];
        let column: number;
        let row: number;
        if (position) {
          column = position[1];
          row = position[0];
        } else {
          column = -1;
          row = rows.findIndex((r) => {
            column = r.components.findIndex((c) => getComponentId(c) === id);
            return column !== -1;
          });
          if (!row || column === -1) {
            return ctx.updateMessage({
              content: "Unable to locate the component in the message by ID.",
              embeds: [],
              components: [],
            });
          }
        }

        rows[row]?.components.splice(column, 1);
        const components = rows.filter((r) => r.components.length !== 0);
        await ctx.rest.patch(
          Routes.webhookMessage(webhook.id, webhook.token, message.id),
          {
            body: { components },
            auth: false,
            query: threadId
              ? new URLSearchParams({ thread_id: threadId })
              : undefined,
          },
        );
        return ctx.updateMessage({
          content:
            "The component was already missing from the database, so it has been removed from the message.",
          embeds: [],
          components: [],
        });
      }

      return ctx.updateMessage({
        content:
          "Are you sure you want to delete this component? This cannot be undone.",
        components: [
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
      const [row, column] = key.split("-").map(Number);
      const { webhook, message } = await getWebhookMessage(
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
      const matchId = getComponentId(foundComponent, dbComponents);
      if (matchId === undefined) {
        rows[row].components.splice(column, 1);
        const components = rows.filter((row) => row.components.length !== 0);
        await ctx.rest.patch(
          Routes.webhookMessage(webhook.id, webhook.token, message.id),
          {
            body: { components },
            auth: false,
            query: threadId
              ? new URLSearchParams({ thread_id: threadId })
              : undefined,
          },
        );
        return ctx.updateMessage({
          content:
            "The button was already missing from the database, so it has been removed from the message.",
          embeds: [],
          components: [],
        });
      }

      return ctx.updateMessage({
        content:
          "Are you sure you want to delete this component? This cannot be undone.",
        components: [
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
                position: [row, column],
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
        content:
          "Cannot resolve that component from the database. Try editing another component to remove it.",
        ephemeral: true,
      });
  }
};

const registerComponentDelete = async (
  ctx: InteractionContext<APIInteraction>,
  id: bigint,
  type: ComponentType,
  webhook: { id: string; token: string; guild_id?: string },
  message: APIMessage,
  position?: [y: number, x: number],
  shouldKeepRecord?: boolean,
) => {
  const db = getDb(ctx.env.HYPERDRIVE);
  const customId = `p_${id}`;

  const components = message.components ?? [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().toJSON(),
  ];
  let row: APIActionRowComponent<APIComponentInMessageActionRow> | undefined;
  let current: APIComponentInMessageActionRow | undefined;
  if (position) {
    row = components[position[0]];
    current = row?.components?.[position[1]];
  } else {
    row = components.find((c) =>
      c.components
        .filter((c) => c.type === type)
        .map((c) => getComponentId(c))
        .includes(id),
    );
    current = row?.components.find(
      (c) => c.type === type && getComponentId(c) === id,
    );
  }
  if (!row || !current) {
    throw new Error(
      `Couldn't find the row that this component is on. Try editing via the site instead (choose "Everything")`,
    );
  }
  row.components.splice(row.components.indexOf(current), 1);
  if (row.components.length === 0) {
    const ri = components.indexOf(row);
    components.splice(ri, 1);
  }

  const editedMsg = await db.transaction(async (tx) => {
    if (!shouldKeepRecord) {
      await tx
        .delete(discordMessageComponents)
        .where(eq(discordMessageComponents.id, id));
    }

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

  if (!shouldKeepRecord) {
    const doId = ctx.env.COMPONENTS.idFromName(`${editedMsg.id}-${customId}`);
    const stub = ctx.env.COMPONENTS.get(doId);
    await stub.fetch(`http://do/?id=${id}`, { method: "DELETE" });
  }

  return editedMsg;
};

export const deleteComponentConfirm: ButtonCallback = async (ctx) => {
  const { webhookId, messageId, threadId, componentId, position } =
    ctx.state as {
      webhookId: string;
      messageId: string;
      threadId?: string;
      componentId: string;
      position?: [number, number];
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
      content: "That component does not belong to this server.",
      embeds: [],
      components: [],
    });
  }

  if (!component) {
    if (!position) {
      return ctx.updateMessage({
        content:
          "An ID and position were both unavailable, so the component could not be located in the message.",
        components: [],
      });
    }

    const rows = message.components ?? [];
    rows[position[0]].components.splice(position[1], 1);
    const components = rows.filter((row) => row.components.length !== 0);
    await ctx.rest.patch(
      Routes.webhookMessage(webhook.id, webhook.token, message.id),
      {
        body: { components },
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
      position,
      shouldKeepRecord,
    );
  }
  return ctx.updateMessage({
    content: `Component deleted successfully: ${messageLink(
      message.channel_id,
      message.id,
      // biome-ignore lint/style/noNonNullAssertion:
      (webhook.guild_id ?? ctx.interaction.guild_id)!,
    )}`,
    embeds: [],
    components: [],
  });
};

export const deleteComponentCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    content: "The component is safe and sound.",
    embeds: [],
    components: [],
  });
};
