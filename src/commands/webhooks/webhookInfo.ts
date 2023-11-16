import { EmbedBuilder, TimestampStyles, time } from "@discordjs/builders";
import { APIWebhook } from "discord-api-types/v10";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { getUserTag } from "../../util/user.js";
import { color } from "../../util/meta.js";
import {getDate, Snowflake} from "discord-snowflake";

export const getWebhookEmbed = (webhook: APIWebhook) => {
  const createdAt = getDate(webhook.id as Snowflake);

  return new EmbedBuilder({
    title: "Webhook Info",
    color,
    thumbnail: {
      url: webhookAvatarUrl(webhook, { size: 1024 }),
    },
    fields: [
      {
        name: "Name",
        value: (webhook.name || "...").slice(0, 1024),
        inline: true,
      },
      {
        name: "Channel",
        value: `<#${webhook.channel_id}>`,
        inline: true,
      },
      {
        name: "ID",
        value: webhook.id,
        inline: true,
      },
      {
        name: "Created by",
        value: webhook.user ? `<@${webhook.user.id}>\n${getUserTag(webhook.user)}` : "Unknown",
        inline: true,
      },
      {
        name: "Created at",
        value: `${time(createdAt, TimestampStyles.ShortDate)} (${time(createdAt, TimestampStyles.RelativeTime)})`,
        inline: true,
      }
    ]
  })
}
