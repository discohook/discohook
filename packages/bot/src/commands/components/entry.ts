import { messageLink } from "@discordjs/formatters";
import { REST } from "@discordjs/rest";
import dedent from "dedent-js";
import {
  APIApplicationCommandAutocompleteInteraction,
  APIMessage,
  ApplicationCommandOptionType,
  MessageFlags,
  Routes
} from "discord-api-types/v10";
import { Snowflake, getDate } from "discord-snowflake";
import {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
  MessageAppCommandCallback,
} from "../../commands.js";
import { InteractionContext } from "../../interactions.js";
import { startComponentFlow } from "./add.js";

const MESSAGE_LINK_RE =
  /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/;

export const resolveMessageLink = async (
  rest: REST,
  messageLink: string,
): Promise<APIMessage | string> => {
  const match = messageLink.match(MESSAGE_LINK_RE);
  if (!match) {
    return dedent`
      Invalid message link. Select an option from the autocomplete menu, or
      right click or long-press a message, then use "Copy Message Link".
    `;
  }

  try {
    return (await rest.get(
      Routes.channelMessage(match[2], match[3]),
    )) as APIMessage;
  } catch (e) {
    return "Unable to resolve that message. Make sure you are pasting a valid message link in a channel that I can access.";
  }
};

export const addComponentChatEntry: ChatInputAppCommandCallback = async (
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
  return await startComponentFlow(ctx, message);
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
  const cached = await ctx.env.KV.get<CompactCompatibleMessage[]>(
    kvKey,
    "json",
  );
  let messages = cached;
  if (!messages) {
    const channelMessages = (await ctx.rest.get(
      Routes.channelMessages(channelId),
      { query: new URLSearchParams({ limit: "20" }) },
    )) as APIMessage[];

    messages = channelMessages.filter(filter ?? (() => true)).map((m) => {
      const createdAt = getDate(m.id as Snowflake);
      const sentToday = new Date().toDateString() === createdAt.toDateString();

      return {
        id: m.id,
        authorName: m.author.username,
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

    // We don't want all message autocompletions to accidentally receive
    // filtered results. There are surely better ways to do this, but
    // hopefully I never forget to simply provide both parameters.
    if (!filter || (!!filter && !filterKey)) {
      await ctx.env.KV.put(kvKey, JSON.stringify(messages), {
        expirationTtl: 60,
      });
    }
  }

  return messages
    .filter((m) => m.authorName.toLowerCase().includes(query.toLowerCase()))
    .map((message) => {
      return {
        name: message.label.slice(0, 100),
        // biome-ignore lint/style/noNonNullAssertion:
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
      !m.interaction &&
      // dapi-types says application_id is only for interaction responses,
      // but it appears for application-owned webhooks as well:
      // https://discord.dev/resources/channel#message-object
      m.application_id === ctx.followup.applicationId &&
      m.application_id !== m.webhook_id,
    "autocompleteChannelWebhookMessages",
  );

export const addComponentMessageEntry: MessageAppCommandCallback = (ctx) => {
  const message = ctx.getMessage();
  return startComponentFlow(
    ctx,
    message,
  ) as ReturnType<MessageAppCommandCallback>;
};
