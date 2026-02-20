import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { messageLink } from "@discordjs/formatters";
import dedent from "dedent-js";
import {
  type APIApplicationCommandAutocompleteInteraction,
  type APIGuildChannel,
  type APIMessage,
  type APIWebhook,
  ApplicationCommandOptionType,
  ButtonStyle,
  type ChannelType,
} from "discord-api-types/v10";
import { getDate, type Snowflake } from "discord-snowflake";
import type { Client } from "../../client.js";
import type { AutoComponentCustomId } from "../../components.js";
import type { InteractionContext } from "../../interactions.js";
import type {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
  MessageAppCommandCallback,
} from "../handler.js";
import { startComponentFlow } from "./add.js";

const MESSAGE_LINK_RE =
  /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/;

export const resolveMessageLink = async (
  client: Client,
  messageLink: string,
  checkGuildId: string | undefined,
): Promise<APIMessage | string> => {
  const match = messageLink.match(MESSAGE_LINK_RE);
  if (!match) {
    return dedent`
      Invalid message link. Select an option from the autocomplete menu, or
      right click or long-press a message, then use "Copy Message Link".
    `;
  }
  if (checkGuildId && checkGuildId !== match[1]) {
    return "That message is not from this server.";
  }

  // biome-ignore lint/style/noNonNullAssertion: required for match array
  const channelId = match[2]!;

  if (checkGuildId) {
    const channel = (await client.api.channels.get(
      channelId,
    )) as APIGuildChannel<ChannelType>;
    if (!channel.guild_id || channel.guild_id !== checkGuildId) {
      return "That message is not from this server.";
    }
  }

  let message: APIMessage;
  try {
    // biome-ignore lint/style/noNonNullAssertion: same as above
    message = await client.api.channels.getMessage(channelId, match[3]!);
  } catch {
    return "Unable to resolve that message. Make sure you are pasting a valid message link in a channel that I can access.";
  }

  return message;
};

type APIWebhookWithToken = APIWebhook & Required<Pick<APIWebhook, "token">>;

export const getWebhookMessage = async (
  client: Client,
  webhookId: string,
  messageId: string,
  threadId?: string,
): Promise<{ webhook: APIWebhookWithToken; message: APIMessage }> => {
  const webhook = await client.getchWebhook(webhookId);
  if (!webhook.token) {
    throw Error("Webhook token is inaccessible.");
  }

  const message = await client.api.webhooks.getMessage(
    webhook.id,
    webhook.token,
    messageId,
    { thread_id: threadId },
  );
  return { webhook: webhook as APIWebhookWithToken, message };
};

export const addComponentChatEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const message = await resolveMessageLink(
    ctx.client,
    ctx.getStringOption("message").value,
    ctx.interaction.guild_id,
  );
  if (typeof message === "string") {
    await ctx.reply({
      content: message,
      ephemeral: true,
    });
    return;
  }
  await startComponentFlow(ctx, message);
};

/** Always use `filterKey` when specifying `filter`, or results will not be cached! */
export const autocompleteMessageCallback = async (
  ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction>,
  filter?: (message: APIMessage) => boolean,
  filterKey?: string,
) => {
  const channelOption = ctx._getOption("channel");
  const query = ctx.getStringOption("message").value;

  const channelId =
    channelOption?.type === ApplicationCommandOptionType.Channel
      ? channelOption.value
      : ctx.interaction.channel?.id;
  if (!channelId) return [];

  interface CompactCompatibleMessage {
    id: string;
    authorName: string;
    label: string;
  }

  const kvKey = `cache-${
    filterKey ?? "autocompleteChannelMessages"
  }-${channelId}`;
  const cached = await ctx.client.KV.get<CompactCompatibleMessage[]>(
    kvKey,
    "json",
  );
  let messages = cached;
  if (!messages) {
    const channelMessages = (await ctx.client.api.channels.getMessages(
      channelId,
      { limit: 20 },
    )) as APIMessage[];

    messages = channelMessages.filter(filter ?? (() => true)).map((m) => {
      const createdAt = getDate(m.id as Snowflake);
      const sentToday = new Date().toDateString() === createdAt.toDateString();

      return {
        id: m.id,
        authorName: m.author.username,
        label: `${
          sentToday
            ? `Today at ${createdAt.toLocaleTimeString(ctx.interaction.locale, {
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              })}`
            : createdAt.toDateString()
        } | ${m.author.username} | ${m.embeds.length} embed${
          m.embeds.length === 1 ? "" : "s"
        }`,
      } as CompactCompatibleMessage;
    });

    // We don't want all message autocompletions to accidentally receive
    // filtered results. There are surely better ways to do this, but
    // hopefully I never forget to simply provide both parameters.
    if (!filter || (!!filter && !filterKey)) {
      await ctx.client.KV.put(kvKey, JSON.stringify(messages), {
        expirationTtl: 60,
      });
    }
  }

  return messages
    .filter((m) => m.authorName.toLowerCase().includes(query.toLowerCase()))
    .map((message) => {
      return {
        name: message.label.slice(0, 100),
        // biome-ignore lint/style/noNonNullAssertion: we are in a guild
        value: messageLink(channelId, message.id, ctx.interaction.guild_id!),
      };
    });
};

export const addComponentMessageAutocomplete: AppCommandAutocompleteCallback = (
  ctx,
) =>
  autocompleteMessageCallback(
    ctx,
    (m) =>
      !!m.webhook_id &&
      !m.interaction_metadata &&
      // dapi-types says application_id is only for interaction responses,
      // but it appears for application-owned webhooks as well:
      // https://discord.dev/resources/channel#message-object
      m.application_id === ctx.followup.applicationId &&
      m.application_id !== m.webhook_id,
    "autocompleteChannelWebhookMessages",
  );

export const addComponentMessageEntry: MessageAppCommandCallback = (ctx) => {
  const message = ctx.getMessage();
  const threadId = message.position === undefined ? "" : message.channel_id;
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(
        `a_edit-component-flow-ctx_${message.webhook_id}:${message.id}:${threadId}` satisfies AutoComponentCustomId,
      )
      .setLabel("Edit mode")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("View all")
      .setStyle(ButtonStyle.Link)
      .setURL(
        `${Bun.env.DISCOHOOK_ORIGIN}/s/${ctx.interaction.guild_id}?t=components`,
      ),
    new ButtonBuilder()
      .setCustomId(
        `a_delete-component-pick-ctx_${message.webhook_id}:${message.id}:${threadId}` satisfies AutoComponentCustomId,
      )
      .setLabel("Delete mode")
      .setStyle(ButtonStyle.Danger),
  );
  return startComponentFlow(ctx, message, [
    row,
  ]) as ReturnType<MessageAppCommandCallback>;
};
