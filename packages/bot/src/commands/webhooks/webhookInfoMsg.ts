import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import {
  APIWebhook,
  ButtonStyle,
  MessageFlags,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { MessageAppCommandCallback } from "../../commands.js";
import { createLongDiscohookUrl } from "../restore.js";
import { getWebhookInfoEmbed, getWebhookUrl } from "./webhookInfo.js";

export const webhookInfoMsgCallback: MessageAppCommandCallback = async (
  ctx,
) => {
  const msg = ctx.getMessage();
  if (!msg.webhook_id) {
    return ctx.reply({
      content: "This is not a webhook message.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const webhook = (await ctx.rest.get(
    Routes.webhook(msg.webhook_id),
  )) as APIWebhook;
  const tokenAccessible = webhook.application_id
    ? !!ctx.env.APPLICATIONS[webhook.application_id]
    : webhook.type === WebhookType.Incoming;

  const url = webhook.token
    ? createLongDiscohookUrl(ctx.env.DISCOHOOK_ORIGIN, {
        version: "d2",
        messages: [{ data: {} }],
        targets: [{ url: getWebhookUrl(webhook) }],
      })
    : ctx.env.DISCOHOOK_ORIGIN;

  const components = ctx.userPermissons.has(PermissionFlags.ManageWebhooks)
    ? [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
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
          )
          .toJSON(),
      ]
    : undefined;

  return ctx.reply({
    embeds: [getWebhookInfoEmbed(webhook).toJSON()],
    components,
    flags: MessageFlags.Ephemeral,
  });
};
