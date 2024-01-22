import { messageLink } from "@discordjs/formatters";
import dedent from "dedent-js";
import {
  APIMessage,
  ApplicationCommandOptionType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { Snowflake, getDate } from "discord-snowflake";
import {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
  MessageAppCommandCallback,
} from "../../commands.js";
import { startComponentFlow } from "./add.js";

const MESSAGE_LINK_RE =
  /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/;

export const addComponentChatEntry: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const messageLink = ctx.getStringOption("message").value;
  const match = messageLink.match(MESSAGE_LINK_RE);
  if (!match) {
    return ctx.reply({
      content: dedent`
        Invalid message link. Select an option from the autocomplete menu, or
        right click or long-press a message, then use "Copy Message Link".
      `,
      flags: MessageFlags.Ephemeral,
    });
  }

  const message = (await ctx.rest.get(
    Routes.channelMessage(match[2], match[3]),
  )) as APIMessage;
  return await startComponentFlow(ctx, message);
};

export const addComponentChatAutocomplete: AppCommandAutocompleteCallback =
  async (ctx) => {
    const channelOption = ctx._getOption("channel");
    const query = ctx.getStringOption("message").value;

    const channelId =
      channelOption?.type === ApplicationCommandOptionType.Channel
        ? channelOption.value
        : ctx.interaction.channel?.id;
    if (!channelId) return [];

    interface CompactCompatibleMessage {
      id: string;
      webhookName: string;
      label: string;
    }

    const kvKey = `cache-autocompleteChannelWebhookMessages-${channelId}`;
    const cached = await ctx.env.KV.get<CompactCompatibleMessage[]>(kvKey);
    let messages = cached;
    if (!messages) {
      const channelMessages = (await ctx.rest.get(
        Routes.channelMessages(channelId),
        { query: new URLSearchParams({ limit: "20" }) },
      )) as APIMessage[];

      messages = channelMessages
        .filter(
          (m) =>
            !!m.webhook_id &&
            !m.interaction &&
            // dapi-types says application_id is only for interaction responses,
            // but it appears for application-owned webhooks as well:
            // https://discord.dev/resources/channel#message-object
            m.application_id === ctx.followup.applicationId &&
            m.application_id !== m.webhook_id,
        )
        .map((m) => {
          const createdAt = getDate(m.id as Snowflake);
          const sentToday =
            new Date().toDateString() === createdAt.toDateString();

          return {
            id: m.id,
            webhookName: m.author.username,
            label: `${
              sentToday
                ? `Today at ${createdAt.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : createdAt.toDateString()
            } | ${m.author.username} | ${m.embeds.length} embed${
              m.embeds.length === 1 ? "" : "s"
            }`,
          } as CompactCompatibleMessage;
        });

      await ctx.env.KV.put(kvKey, JSON.stringify(messages), {
        expirationTtl: 60,
      });
    }

    return messages
      .filter((m) => m.webhookName.toLowerCase().includes(query.toLowerCase()))
      .map((message) => {
        return {
          name: message.label.slice(0, 100),
          // biome-ignore lint/style/noNonNullAssertion:
          value: messageLink(channelId, message.id, ctx.interaction.guild_id!),
        };
      });
  };

export const addComponentMessageEntry: MessageAppCommandCallback = async (
  ctx,
) => {
  const message = ctx.getMessage();
  return await startComponentFlow(ctx, message);
};
