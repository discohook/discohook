import { EmbedBuilder } from "@discordjs/builders";
import { DiscordAPIError } from "@discordjs/rest";
import {
  type APIInteraction,
  type RESTError,
  RESTJSONErrorCodes,
} from "discord-api-types/v10";
import type { InteractionContext } from "./interactions.js";

const xNotFound = (x: string) =>
  `Could not find the ${x}. There may be a permissions issue.`;

const tooManyX = (x: string, limit?: number) =>
  limit !== undefined
    ? `Cannot have more than ${limit} ${x}.`
    : `There are too many ${x}.`;

const invalidX = (x: string, reason?: string) =>
  `Failed to fetch ${x}. ${reason ?? ""}`.trim();

export const sendErrorMessage = async (
  ctx: InteractionContext<APIInteraction>,
  error: RESTError,
) => {
  const message = (() => {
    switch (error.code) {
      case 10003:
        return xNotFound("channel");
      case 10004:
        return xNotFound("server");
      case 10005:
        return xNotFound("app or bot");
      case 10006:
        return xNotFound("invite");
      case 10007:
        return xNotFound("member");
      case 10008:
        return xNotFound("message");
      case 10009:
        return xNotFound("permission overwrite");
      case 10011:
        return xNotFound("role");
      case 10013:
        return xNotFound("user");
      case 10014:
        return xNotFound("emoji");
      case 10015:
        return xNotFound("webhook");
      case 10016:
        return xNotFound("webhook service");
      case 10026:
        return xNotFound("ban");
      case 10057:
        return xNotFound("server template");
      case 10060:
        return xNotFound("sticker");
      case 10062:
        return xNotFound("interaction");
      case 10063:
        return xNotFound("command");
      case 30003:
        return tooManyX("pins", 50);
      case 30005:
        return tooManyX("roles", 250);
      case 30007:
        return tooManyX("webhooks in a channel", 15);
      case 30008:
        return tooManyX("emojis");
      case 30010:
        return tooManyX("reactions", 20);
      case 30013:
        return tooManyX("channels", 500);
      case 30016:
        return tooManyX("invites", 1000);
      case 30018:
        return tooManyX("animated emojis");
      case 30039:
        return tooManyX("stickers");
      case 30056:
        return tooManyX("premium emojis", 25);
      case 40001:
        return "Bot is unauthorized. This shouldn't happen.";
      case 40004:
        return "Sending messages is disabled in this channel.";
      case 40005:
        return "File(s) are too large.";
      case 40006:
        return "This feature is disabled on this server.";
      case 40062:
        return "Resource is being rate limited.";
      case 50001:
      case 50013:
        return `I am not allowed to do something that I need to do here (${error.message}).`;
      case 50021:
        return "Cannot execute action on a system message.";
      case 50024:
        return "Cannot execute action on this channel type.";
      case 50027:
        return invalidX("a webhook", "Its token was invalid.");
      case 50028:
        return invalidX("a role");
      case 50034:
        return "One of the messages is too old to bulk delete.";
      default:
        break;
    }
  })();

  if (message) {
    return await ctx.reply({ content: message, ephemeral: true });
  }
  if ([RESTJSONErrorCodes.InvalidFormBodyOrContentType].includes(error.code)) {
    return await ctx.reply({ embeds: [getErrorEmbed(error)], ephemeral: true });
  }
};

export const getErrorEmbed = (error: RESTError) => {
  const embed = new EmbedBuilder().setColor(0xff587b).setTitle("Discord Error");
  if (
    error.errors &&
    [RESTJSONErrorCodes.InvalidFormBodyOrContentType].includes(error.code)
  ) {
    const djsError = new DiscordAPIError(
      error,
      error.code,
      // doesn't matter
      400,
      "GET",
      "/",
      {},
    );
    // remove unnecessary "invalid form body", which confuses some people
    embed.setDescription(
      djsError.message.replace(error.message, "").trim().slice(0, 4096) ||
        "No message",
    );
  } else {
    embed.setDescription(
      `[${error.code}] ${error.message?.trim().slice(0, 4096) || "No message"}`,
    );
  }

  return embed;
};
