import { APIInteraction, APIMessage, Routes } from "discord-api-types/v10";
import { ChatInputAppCommandCallback, MessageAppCommandCallback } from "../../commands.js";
import { InteractionContext } from "../../interactions.js";

const MESSAGE_LINK_RE = /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/

export const addComponent = async (ctx: InteractionContext<APIInteraction>, message: APIMessage) => {
  return ctx.reply(message.channel_id);
}

export const addComponentChatEntry: ChatInputAppCommandCallback = async (ctx) => {
  const messageLink = ctx.getStringOption("message-link").value;
  console.log(ctx.interaction.data.options[0])
  const match = messageLink.match(MESSAGE_LINK_RE);
  console.log(match, messageLink)
  if (!match) {
    return ctx.reply("Invalid message link. Right click or long-press a message, then use \"Copy Message Link\"");
  }

  const message = await ctx.client.get(Routes.channelMessage(match[2], match[3])) as APIMessage;
  return await addComponent(ctx, message);
}

export const addComponentMessageEntry: MessageAppCommandCallback = async (ctx) => {
  const message = ctx.getMessage();
  return await addComponent(ctx, message);
}
