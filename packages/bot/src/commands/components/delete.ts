import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  messageLink,
} from "@discordjs/builders";
import {
  APIEmoji,
  APIInteraction,
  APIMessage,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb } from "store";
import { discordMessageComponents } from "store/src/schema/schema.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import {
  AutoComponentCustomId,
  ButtonCallback,
  SelectMenuCallback,
} from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { getComponentId, parseAutoComponentId } from "../../util/components.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import { getComponentsAsOptions } from "./edit.js";
import { resolveMessageLink } from "./entry.js";

export const deleteComponentChatEntry: ChatInputAppCommandCallback<true> =
  async (ctx) => {
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
      flags: MessageFlags.Ephemeral,
    });
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(
      `a_delete-component-pick_${message.id}` satisfies AutoComponentCustomId,
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
        )
        .toJSON(),
    ],
    components: [
      new ActionRowBuilder<typeof select>().addComponents(select).toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const deleteComponentButtonEntry: ButtonCallback = async (ctx) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) {
    return ctx.reply("Guild-only");
  }

  const { channelId, messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
  );
  const message = await resolveMessageLink(
    ctx.rest,
    messageLink(channelId, messageId, guildId),
  );
  if (typeof message === "string") {
    return ctx.reply({
      content: message,
      flags: MessageFlags.Ephemeral,
    });
  }

  const response = await pickWebhookMessageComponentToDelete(ctx, message);
  return ctx.updateMessage(response.data);
};

export const deleteComponentFlowPickCallback: SelectMenuCallback = async (
  ctx,
) => {
  const { messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
  );

  const db = getDb(ctx.env.HYPERDRIVE);

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
          "Are you sure you want to delete this component? This cannot be undone.",
        embeds: [],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `a_delete-component-confirm_${messageId}:${component.id}` satisfies AutoComponentCustomId,
                )
                .setStyle(ButtonStyle.Danger)
                .setLabel("Delete"),
              new ButtonBuilder()
                .setCustomId(
                  "a_delete-component-cancel_" satisfies AutoComponentCustomId,
                )
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Cancel"),
            )
            .toJSON(),
        ],
      });
    }
    default:
      return ctx.reply({
        content:
          "Cannot resolve that component from the database. Try editing another component to remove it.",
        flags: MessageFlags.Ephemeral,
      });
  }
};

const registerComponentDelete = async (
  ctx: InteractionContext<APIInteraction>,
  id: bigint,
  type: ComponentType,
  webhook: { id: string; token: string; guild_id?: string },
  message: APIMessage,
) => {
  const db = getDb(ctx.env.HYPERDRIVE);
  const customId = `p_${id}`;

  const components = message.components ?? [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().toJSON(),
  ];
  const row = components.find((c) =>
    c.components
      .filter((c) => c.type === type)
      .map(getComponentId)
      .includes(id),
  );
  const current = row?.components.find(
    (c) => c.type === type && getComponentId(c) === id,
  );
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
    await tx
      .delete(discordMessageComponents)
      .where(eq(discordMessageComponents.id, id));

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

  const doId = ctx.env.COMPONENTS.idFromName(`${editedMsg.id}-${customId}`);
  const stub = ctx.env.COMPONENTS.get(doId);
  await stub.fetch(`http://do/?id=${id}`, { method: "DELETE" });

  return editedMsg;
};

export const deleteComponentConfirm: ButtonCallback = async (ctx) => {
  const { messageId, componentId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
  );

  const db = getDb(ctx.env.HYPERDRIVE);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      type: true,
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

  const edited = await registerComponentDelete(
    ctx,
    component.id,
    component.type,
    {
      id: webhookId,
      token: webhook.token,
      guild_id: guildId,
    },
    message,
  );

  return ctx.updateMessage({
    content: `Component deleted successfully: ${messageLink(
      edited.channel_id,
      edited.id,
      guildId,
    )}`,
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
