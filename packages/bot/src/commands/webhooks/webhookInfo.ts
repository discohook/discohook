import {
  EmbedBuilder,
  TimestampStyles,
  inlineCode,
  spoiler,
  time,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIWebhook,
  ChannelType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { Snowflake, getDate } from "discord-snowflake";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { color } from "../../util/meta.js";

export const getWebhookInfoEmbed = (webhook: APIWebhook) => {
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
        value: webhook.user ? `<@${webhook.user.id}>` : "Unknown",
        inline: true,
      },
      {
        name: "Created at",
        value: `${time(createdAt, TimestampStyles.ShortDate)} (${time(
          createdAt,
          TimestampStyles.RelativeTime,
        )})`,
        inline: true,
      },
    ],
  });
};

export const getWebhookUrlEmbed = (
  webhook: APIWebhook,
  header?: string,
  applicationId?: string,
  channelType?: ChannelType,
  showUrl?: boolean,
) => {
  const title = header ?? "Webhook URL";

  if (!webhook.token) {
    return new EmbedBuilder({
      title,
      description: dedent`
        This webhook\'s token is not available. It may have been created by a
        different bot or it may be a news webhook (from a different server).
      `,
      color,
    });
  }

  const url = `https://discord.com/api/v10/${Routes.webhook(
    webhook.id,
    webhook.token,
  )}`;
  const embed = new EmbedBuilder({
    title,
    description: showUrl
      ? spoiler(inlineCode(url))
      : `**${webhook.name}** in <#${webhook.channel_id}>`,
    color,
  });

  if (!showUrl) {
    embed.setThumbnail(webhookAvatarUrl(webhook, { size: 1024 }));
  }

  if (webhook.application_id && applicationId === webhook.application_id) {
    embed.addFields({
      name: ":information_source: Usage",
      value: dedent`
        You can use this webhook to send messages like normal,
        but since it was created by me, I can attach components
        (buttons) to it afterwards.
      `,
      inline: false,
    });
  }

  if (channelType === ChannelType.GuildForum) {
    embed.addFields({
      name: "<:forum:1074458133407211562> Forum channels",
      value: dedent`
          <#${webhook.channel_id}> is a forum channel. In order to create a new forum
          post using Discohook, click "Thread" and fill in the "Forum Thread Name" box.
          If you want to send to an existing thread, add \`?thread_id=xxx\` to the end of
          the above webhook URL, where \`xxx\` is the ID of the thread.
          [Read how to get a thread ID](https://support.discord.com/hc/en-us/articles/206346498)
        `,
      inline: false,
    });
  }

  if (showUrl) {
    embed.addFields({
      name: ":warning: Keep this secret!",
      value: dedent`
      Someone with this URL can send any message they want to
      <#${webhook.channel_id}>, including \`@everyone\` mentions.
      `,
      inline: false,
    });
  }

  return embed;
};

export const webhookInfoCallback: ChatInputAppCommandCallback = async (ctx) => {
  const webhookId = ctx.getStringOption("webhook").value;
  const showUrl = ctx.getBooleanOption("show-url")?.value ?? false;
  const webhook = (await ctx.rest.get(Routes.webhook(webhookId))) as APIWebhook;

  const embeds = [getWebhookInfoEmbed(webhook).toJSON()];
  if (showUrl) {
    embeds.push(
      getWebhookUrlEmbed(
        webhook,
        undefined,
        ctx.interaction.application_id,
        ctx.interaction.channel.type,
        showUrl,
      ).toJSON(),
    );
  }

  return ctx.reply({
    embeds,
    flags: showUrl ? MessageFlags.Ephemeral : undefined,
  });
};
