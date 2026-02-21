import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { and, count, eq } from "drizzle-orm";
import { messageLogEntries, webhooks } from "store";
import type {
  AutoComponentCustomId,
  ButtonCallback,
} from "../../components.js";
import { parseAutoComponentId } from "../../util/components.js";
import { getUserTag } from "../../util/user.js";
import type { ChatInputAppCommandCallback } from "../handler.js";
import { getWebhookInfoEmbed } from "./webhookInfo.js";

export const webhookDeleteEntryCallback: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const webhookId = ctx.getStringOption("webhook").value;
  const webhook = await ctx.client.api.webhooks.get(webhookId);
  const embed = getWebhookInfoEmbed(webhook);

  // Originally delegated this to a followup but it sometimes happened so
  // quickly that it completed before Discord had downloaded the initial
  // response. This will definitely change in production, but I think it
  // should be fine to keep in the response.
  const db = ctx.client.getDb();
  const [{ logs }] = await db
    .select({ logs: count() })
    .from(messageLogEntries)
    .where(
      and(
        eq(messageLogEntries.type, "send"),
        eq(messageLogEntries.webhookId, webhookId),
      ),
    );
  if (logs !== 0) {
    embed.addFields({
      name: "Logs",
      value: ctx.t("gteNMessagesSent", { count: logs }),
      inline: true,
    });
  }

  await ctx.reply({
    content:
      "Are you sure you want to delete this webhook? This will make it impossible to edit any messages it has sent.",
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().setComponents(
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
      ),
    ],
    ephemeral: true,
  });
};

export const webhookDeleteConfirm: ButtonCallback = async (ctx) => {
  if (!ctx.userPermissons.has(PermissionFlags.ManageWebhooks)) {
    await ctx.updateMessage({
      content: "You don't have permissions to manage webhooks.",
      embeds: [],
      components: [],
    });
    return;
  }
  const { webhookId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
  );
  const webhook = await ctx.client.api.webhooks.get(webhookId);
  if (!webhook.guild_id || webhook.guild_id !== ctx.interaction.guild_id) {
    await ctx.updateMessage({
      content: "Webhook does not exist or it is not in this server.",
      embeds: [],
      components: [],
    });
    return;
  }

  // Not sure if it's faster to use the webhook token but we would rather
  // have the bot attribution and audit log reason
  await ctx.client.api.webhooks.delete(webhookId, {
    reason:
      `User ${getUserTag(ctx.user)} (${ctx.user.id}) used /webhook delete`.slice(
        0,
        512,
      ),
  });

  const db = ctx.client.getDb();
  await db
    .delete(webhooks)
    .where(and(eq(webhooks.platform, "discord"), eq(webhooks.id, webhookId)));

  await ctx.updateMessage({
    content: "Deleted the webhook successfully.",
    embeds: [],
    components: [],
  });
};

export const webhookDeleteCancel: ButtonCallback = async (ctx) => {
  await ctx.updateMessage({
    content: "The webhook is safe and sound.",
    embeds: [],
    components: [],
  });
};
