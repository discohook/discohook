import { APIInteraction, APIMessage, ApplicationCommandOptionType, MessageFlags, Routes } from "discord-api-types/v10";
import { AppCommandAutocompleteCallback, ChatInputAppCommandCallback, MessageAppCommandCallback } from "../../commands.js";
import { InteractionContext } from "../../interactions.js";
import dedent from "dedent-js";
import { messageLink } from "@discordjs/formatters";
import { getDate, Snowflake } from "discord-snowflake";

const MESSAGE_LINK_RE = /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/

const addComponentCallback = async (ctx: InteractionContext<APIInteraction>, message: APIMessage) => {
  return ctx.reply(message.channel_id);
}

export const addComponentChatEntry: ChatInputAppCommandCallback = async (ctx) => {
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

  const message = await ctx.client.get(Routes.channelMessage(match[2], match[3])) as APIMessage;
  return await addComponentCallback(ctx, message);
}

export const addComponentChatAutocomplete: AppCommandAutocompleteCallback = async (ctx) => {
  const channelOption = ctx._getOption('channel');
  const channelId = channelOption?.type === ApplicationCommandOptionType.Channel
    ? channelOption.value
    : ctx.interaction.channel?.id;
  if (!channelId) return [];

  const channelMessages = await ctx.client.get(
    Routes.channelMessages(channelId),
    {
      query: new URLSearchParams({ limit: '20' }),
    },
  ) as APIMessage[];
  return channelMessages
    .filter(m => !!m.webhook_id && !m.interaction && m.application_id === ctx.followup.applicationId)
    .map(message => {
      const createdAt = getDate(message.id as Snowflake);
      const sentToday = new Date().toDateString() === createdAt.toDateString();

      return {
        name: `${
          sentToday ? `Today at ${createdAt.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}` : createdAt.toDateString()
        } | ${
          message.author.username
        } | ${message.embeds.length} embed${message.embeds.length === 1 ? '' : 's'}`.slice(0, 100),
        value: messageLink(message.channel_id, message.id, ctx.interaction.guild_id!),
      };
    });
}

export const addComponentMessageEntry: MessageAppCommandCallback = async (ctx) => {
  const message = ctx.getMessage();
  return await addComponentCallback(ctx, message);
}
