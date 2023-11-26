import { APIWebhook, ChannelType, MessageFlags, Routes } from "discord-api-types/v10";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { readAttachment, webhookAvatarUrl } from "../../util/cdn.js";
import { getWebhookEmbed } from "./webhookInfo.js";
import { color } from "../../util/meta.js";
import { EmbedBuilder, spoiler } from "@discordjs/builders";

export const webhookCreateEntry: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption('name').value,
    avatar = ctx.getAttachmentOption('avatar'),
    channel = ctx.getChannelOption('channel');

  let channelId: string | null | undefined = undefined;
  if (channel) {
    if (
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread
      ].includes(channel.type) &&
      'parent_id' in channel
    ) {
      // All threadable channels should also be webhook-compatible
      channelId = channel.parent_id;
    } else {
      channelId = channel.id;
    }
  } else {
    if ([
      ChannelType.GuildAnnouncement,
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildForum,
    ].includes(ctx.interaction.channel.type)) {
      channelId = ctx.interaction.channel.id
    } else if (
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread
      ].includes(ctx.interaction.channel.type) &&
      'parent_id' in ctx.interaction.channel
    ) {
      channelId = ctx.interaction.channel.parent_id
    }
  }

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

  const url = `https://discord.com/api/v10/${webhook.id}/${webhook.token}`;
  const embed = new EmbedBuilder({
    title: "Webhook Created",
    description: spoiler(url),
    color,
  });

  return ctx.reply({
    embeds: [embed.toJSON()],
    flags: MessageFlags.Ephemeral,
  });
}
