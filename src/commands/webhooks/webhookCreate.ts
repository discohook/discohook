import { APIGuild, APIInteraction, APIWebhook, ButtonStyle, ChannelType, MessageFlags, RESTJSONErrorCodes, Routes } from "discord-api-types/v10";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { readAttachment } from "../../util/cdn.js";
import { getWebhookUrlEmbed } from "./webhookInfo.js";
import { getDb, upsertGuild } from "../../db/index.js";
import { webhooks } from "../../db/db-schema.js";
import { isDiscordError } from "../../util/error.js";
import dedent from "dedent-js";
import { color } from "../../util/meta.js";
import { sleep } from "../../util/sleep.js";
import { eq } from "drizzle-orm";
import { APIPartialResolvedChannel } from "../../types/api.js";
import { getchGuild } from "../../util/kv.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";

export const extractWebhookableChannel = (
  channel: APIPartialResolvedChannel | null,
  ctxChannel: APIInteraction["channel"],
): [string | undefined, ChannelType | undefined] => {
  let channelId: string | undefined = undefined;
  let channelType: ChannelType | undefined = ctxChannel?.type;
  if (channel) {
    channelType = channel.type;
    if (
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread
      ].includes(channel.type) &&
      'parent_id' in channel
    ) {
      // All threadable channels should also be webhook-compatible
      channelId = channel.parent_id ?? undefined;
    } else {
      channelId = channel.id;
    }
  } else if (ctxChannel) {
    if ([
      ChannelType.GuildAnnouncement,
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildForum,
    ].includes(ctxChannel.type)) {
      channelId = ctxChannel.id
    } else if (
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread
      ].includes(ctxChannel.type) &&
      'parent_id' in ctxChannel
    ) {
      channelId = ctxChannel.parent_id ?? undefined;
    }
  }

  return [channelId, channelType];
}

export const webhookCreateEntry: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption('name').value,
    avatar = ctx.getAttachmentOption('avatar'),
    channel = ctx.getChannelOption('channel'),
    showUrl = ctx.getBooleanOption('show-url').value;

  const [channelId, channelType] = extractWebhookableChannel(channel, ctx.interaction.channel);
  if (!channelId) {
    return ctx.reply({
      content: "Invalid channel type." + (!channel ? " To specify a channel, use the `channel` argument." : ""),
      flags: MessageFlags.Ephemeral,
    });
  }

  let avatarData: string | undefined = undefined;
  if (avatar) {
    if (
      !avatar.content_type ||
      ![
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ].includes(avatar.content_type)
    ) {
      return ctx.reply({
        content: "Invalid attachment type. Must be a PNG, JPEG/JPG, GIF, or WebP image.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      avatarData = await readAttachment(avatar.url);
    } catch (e) {
      if (e instanceof RangeError) {
        console.error(e);
        return ctx.reply({
          content: "Failed to handle the file, it may be too large or it may be malformed.",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        console.error(e);
        return ctx.reply({
          content: "Failed to handle the file. Try creating a webhook without an avatar and uploading it later.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }

  let webhook: APIWebhook;
  try {
    webhook = await ctx.client.post(
      Routes.channelWebhooks(channelId),
      { body: { name, avatar: avatarData }}
    ) as APIWebhook;
  } catch {
    return ctx.reply({
      content: "Failed to create the webhook. It may have an invalid name or avatar, or I may be missing permissions.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const embed = getWebhookUrlEmbed(
    webhook,
    "Webhook Created",
    ctx.followup.applicationId,
    channelType ?? ctx.interaction.channel.type,
    showUrl,
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({
      style: ButtonStyle.Link,
      url: `${ctx.env.BOOGIEHOOK_ORIGIN}/?data=${btoa(JSON.stringify({
        messages: [{ data: {} }],
        targets: [{ url: webhook.url }],
      }))}`,
      label: "Open in Boogiehook",
    }),
  );

  const db = getDb(ctx.env.DB);
  const guild = await getchGuild(ctx.client, ctx.env.KV, ctx.interaction.guild_id!);
  await upsertGuild(db, guild);
  await db
    .insert(webhooks)
    .values({
      platform: "discord",
      id: webhook.id,
      token: webhook.token,
      name: webhook.name ?? name,
      discordGuildId: BigInt(webhook.guild_id!),
      channelId: webhook.channel_id,
      avatar: webhook.avatar,
    })
    .onConflictDoNothing();

  return [
    ctx.reply({
      embeds: [embed.toJSON()],
      components: [row.toJSON()],
      flags: MessageFlags.Ephemeral,
    }),
    async () => {
      await sleep(2000);
      try {
        await ctx.client.get(Routes.webhook(webhook.id, webhook.token));
      } catch (e) {
        if (isDiscordError(e) && e.code === RESTJSONErrorCodes.UnknownWebhook) {
          await ctx.followup.editOriginalMessage({
            embeds: [{
              title: "Webhook was deleted",
              description: dedent`
                Your webhook was created successfully, but it seems like a
                moderation bot may have deleted it automatically. Some bots
                detect new webhooks as spam activity. Check your server audit
                log for more details.
              `,
              color,
            }],
          });
          await db.delete(webhooks).where(
            eq(webhooks.id, webhook.id)
            .append(eq(webhooks.platform, "discord"))
          );
        }
      }
    },
  ];
}
