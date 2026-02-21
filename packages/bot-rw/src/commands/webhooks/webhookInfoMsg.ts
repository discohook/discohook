import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, WebhookType } from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { parseApplicationsValue } from "../../client.js";
import type { MessageAppCommandCallback } from "../handler.js";
import { createLongDiscohookUrl } from "../restore.js";
import { getWebhookInfoEmbed, getWebhookUrl } from "./webhookInfo.js";

export const webhookInfoMsgCallback: MessageAppCommandCallback = async (
  ctx,
) => {
  const msg = ctx.getMessage();
  if (!msg.webhook_id) {
    await ctx.reply({
      content: "This is not a webhook message.",
      ephemeral: true,
    });
    return;
  }

  const webhook = await ctx.client.api.webhooks.get(msg.webhook_id);
  const tokenAccessible = webhook.application_id
    ? !!parseApplicationsValue()[webhook.application_id]
    : webhook.type === WebhookType.Incoming;

  const url = webhook.token
    ? createLongDiscohookUrl({
        version: "d2",
        messages: [{ data: {} }],
        targets: [{ url: getWebhookUrl(webhook) }],
      })
    : Bun.env.DISCOHOOK_ORIGIN;

  const components = ctx.userPermissons.has(PermissionFlags.ManageWebhooks)
    ? [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Use Webhook")
            .setDisabled(!webhook.token && !tokenAccessible)
            .setURL(url)
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setCustomId(`a_webhook-info-show-url_${webhook.id}`)
            .setLabel("Show URL (advanced)")
            .setDisabled(!webhook.token && !tokenAccessible)
            .setStyle(ButtonStyle.Secondary),
        ),
      ]
    : undefined;

  await ctx.reply({
    embeds: [getWebhookInfoEmbed(webhook)],
    components,
    ephemeral: true,
  });
};
