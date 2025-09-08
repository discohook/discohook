import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { type APIWebhook, ButtonStyle, Routes } from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { and, count, eq } from "drizzle-orm";
import { getDb, messageLogEntries, webhooks } from "store";
import type { ChatInputAppCommandCallback } from "../../commands.js";
import type {
  AutoComponentCustomId,
  ButtonCallback,
} from "../../components.js";
import { parseAutoComponentId } from "../../util/components.js";
import { getWebhookInfoEmbed } from "./webhookInfo.js";

export const webhookDeleteEntryCallback: ChatInputAppCommandCallback<
  true
> = async (ctx) => {
  const webhookId = ctx.getStringOption("webhook").value;
  const webhook = (await ctx.rest.get(Routes.webhook(webhookId))) as APIWebhook;
  const embed = getWebhookInfoEmbed(webhook);

  // Originally delegated this to a followup but it sometimes happened so
  // quickly that it completed before Discord had downloaded the initial
  // response. This will definitely change in production, but I think it
  // should be fine to keep in the response.
  const db = getDb(ctx.env.HYPERDRIVE);
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

  // This currently doesn't work because no results are returned when querying
  // `author_id` with a webhook ID, despite `author_type` being an acceptable
  // way to search for webhook messages.
  // const data = (await ctx.rest.get(
  //   `/guilds/${ctx.interaction.guild_id}/messages/search`,
  //   {
  //     query: new URLSearchParams({
  //       // I think "latest message sent" would be a useful diagnostic
  //       sort_by: "timestamp",
  //       author_id: webhookId,
  //       author_type: "webhook",
  //       limit: "1",
  //     }),
  //   },
  // )) as { total_results: number };

  return ctx.reply({
    content: ctx.t("webhookDelete.confirm"),
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
    return ctx.updateMessage({
      content: ctx.t("webhookDelete.forbidden"),
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
      content: ctx.t("webhookDelete.wrongServer"),
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
    content: ctx.t("webhookDelete.success"),
    embeds: [],
    components: [],
  });
};

export const webhookDeleteCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    content: ctx.t("webhookDelete.cancel"),
    embeds: [],
    components: [],
  });
};
