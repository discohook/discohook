import { APIWebhook, MessageFlags, Routes } from "discord-api-types/v10";
import { MessageAppCommandCallback } from "../../commands.js";
import { getWebhookInfoEmbed } from "./webhookInfo.js";

export const webhookInfoMsgCallback: MessageAppCommandCallback = async (ctx) => {
  const msg = ctx.getMessage();
  if (!msg.webhook_id) {
    return ctx.reply({
      content: "This is not a webhook message.",
      flags: MessageFlags.Ephemeral,
    })
  }

  const webhook = await ctx.client.get(Routes.webhook(msg.webhook_id)) as APIWebhook;
  return ctx.reply({
    embeds: [ getWebhookInfoEmbed(webhook).toJSON() ],
    flags: MessageFlags.Ephemeral,
  });
}
