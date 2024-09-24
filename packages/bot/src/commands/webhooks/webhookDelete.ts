import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import {
  APIWebhook,
  ButtonStyle,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { and, count, eq } from "drizzle-orm";
import { t } from "i18next";
import { getDb } from "store";
import { messageLogEntries, webhooks } from "store/src/schema/schema.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { AutoComponentCustomId, ButtonCallback } from "../../components.js";
import { parseAutoComponentId } from "../../util/components.js";
import { getWebhookInfoEmbed } from "./webhookInfo.js";

export const webhookDeleteEntryCallback: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const webhookId = ctx.getStringOption("webhook").value;
  const webhook = (await ctx.rest.get(Routes.webhook(webhookId))) as APIWebhook;
  const embed = getWebhookInfoEmbed(webhook);

  // Originally delegated this to a followup but it sometimes happened so
  // quickly that it completed before Discord had downloaded the initial
  // response. This will definitely change in production, but I think it
  // should be fine to keep in the response.
  const db = getDb(ctx.env.HYPERDRIVE);
  const { logs } = (
    await db
      .select({ logs: count() })
      .from(messageLogEntries)
      .where(
        and(
          eq(messageLogEntries.type, "send"),
          eq(messageLogEntries.webhookId, webhookId),
        ),
      )
  )[0];
  if (logs !== 0) {
    embed.addFields({
      name: "Logs",
      value: t("gteNMessagesSent", { count: logs }),
      inline: true,
    });
  }

  return ctx.reply({
    content:
      "Are you sure you want to delete this webhook? This will make it impossible to edit any messages it has sent.",
    embeds: [embed.toJSON()],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder()
            .setCustomId(
              `a_webhook-delete-confirm_${webhookId}` satisfies AutoComponentCustomId,
            )
            .setLabel("Delete")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(
              "a_webhook-delete-cancel_" satisfies AutoComponentCustomId,
            )
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary),
        )
        .toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const webhookDeleteConfirm: ButtonCallback = async (ctx) => {
  if (!ctx.userPermissons.has(PermissionFlags.ManageWebhooks)) {
    return ctx.updateMessage({
      content: "You don't have permissions to manage webhooks.",
      embeds: [],
      components: [],
    });
  }
  const { webhookId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
  );
  const webhook = (await ctx.rest.get(Routes.webhook(webhookId))) as APIWebhook;
  if (!webhook.guild_id || webhook.guild_id !== ctx.interaction.guild_id) {
    return ctx.updateMessage({
      content: "Webhook does not exist or it is not in this server.",
      embeds: [],
      components: [],
    });
  }

  await ctx.rest.delete(Routes.webhook(webhookId));

  const db = getDb(ctx.env.HYPERDRIVE);
  await db
    .delete(webhooks)
    .where(and(eq(webhooks.platform, "discord"), eq(webhooks.id, webhookId)));

  return ctx.updateMessage({
    content: "Deleted the webhook successfully.",
    embeds: [],
    components: [],
  });
};

export const webhookDeleteCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    content: "The webhook is safe and sound.",
    embeds: [],
    components: [],
  });
};
