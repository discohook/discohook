import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  type APIInteraction,
  type APIWebhook,
  ButtonStyle,
  ChannelType,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import {
  getDb,
  getchGuild,
  makeSnowflake,
  upsertDiscordUser,
  upsertGuild,
  webhooks,
} from "store";
import type { ChatInputAppCommandCallback } from "../../commands.js";
import { getErrorEmbed } from "../../errors.js";
import type { APIPartialResolvedChannel } from "../../types/api.js";
import { readAttachment } from "../../util/cdn.js";
import { isDiscordError } from "../../util/error.js";
import { color } from "../../util/meta.js";
import { sleep } from "../../util/sleep.js";
import { getWebhookUrlEmbed } from "./webhookInfo.js";

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
        ChannelType.AnnouncementThread,
      ].includes(channel.type) &&
      "parent_id" in channel
    ) {
      // All threadable channels should also be webhook-compatible
      channelId = channel.parent_id ?? undefined;
    } else {
      channelId = channel.id;
    }
  } else if (ctxChannel) {
    if (
      [
        ChannelType.GuildAnnouncement,
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.GuildForum,
      ].includes(ctxChannel.type)
    ) {
      channelId = ctxChannel.id;
    } else if (
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
      ].includes(ctxChannel.type) &&
      "parent_id" in ctxChannel
    ) {
      channelId = ctxChannel.parent_id ?? undefined;
    }
  }

  return [channelId, channelType];
};

export const webhookCreateEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const name = ctx.getStringOption("name").value;
  const avatar = ctx.getAttachmentOption("avatar");
  const channel = ctx.getChannelOption("channel");
  const showUrl = ctx.getBooleanOption("show-url").value;

  const [channelId, channelType] = extractWebhookableChannel(
    channel,
    ctx.interaction.channel,
  );
  if (!channelId) {
    return ctx.reply({
      content: `Invalid channel type.${
        !channel ? " To specify a channel, use the `channel` argument." : ""
      }`,
      ephemeral: true,
    });
  }

  return [
    // Defer because attachment handling takes so long
    ctx.defer({ ephemeral: true }),
    async () => {
      let avatarData: string | undefined = undefined;
      if (avatar) {
        if (
          !avatar.content_type ||
          !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
            avatar.content_type,
          )
        ) {
          await ctx.followup.editOriginalMessage({
            content:
              "Invalid attachment type. Must be a PNG, JPEG/JPG, GIF, or WebP image.",
          });
          return;
        }

        try {
          avatarData = await readAttachment(avatar.url);
        } catch (e) {
          if (e instanceof RangeError) {
            console.error(e);
            await ctx.followup.editOriginalMessage({
              content:
                "Failed to handle the file, it may be too large or it may be malformed.",
            });
            return;
          } else {
            console.error(e);
            await ctx.followup.editOriginalMessage({
              content:
                "Failed to handle the file. Try creating a webhook without an avatar and uploading it later.",
            });
            return;
          }
        }
      }

      let webhook: APIWebhook;
      try {
        webhook = (await ctx.rest.post(Routes.channelWebhooks(channelId), {
          body: { name, avatar: avatarData },
        })) as APIWebhook;
      } catch (e) {
        if (isDiscordError(e)) {
          if (
            [
              RESTJSONErrorCodes.MaximumNumberOfWebhooksReached,
              RESTJSONErrorCodes.MaximumNumberOfWebhooksPerGuildReached,
            ].includes(e.code)
          ) {
            await ctx.followup.editOriginalMessage({
              content: e.rawError.message,
            });
            return;
          }
          await ctx.followup.editOriginalMessage({
            content:
              "Failed to create the webhook. It is likely that some information was invalid or I am missing permissions. A description of the error is below:",
            embeds: [getErrorEmbed(e.rawError)],
          });
          return;
        }
        await ctx.followup.editOriginalMessage({
          content: "Failed to create the webhook.",
        });
        return;
      }

      const embed = getWebhookUrlEmbed(
        webhook,
        "Webhook Created",
        ctx.followup.applicationId,
        channelType ?? ctx.interaction.channel.type,
        showUrl,
      );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Use in Discohook")
          .setURL(
            `${ctx.env.DISCOHOOK_ORIGIN}/?data=${Buffer.from(
              JSON.stringify({
                messages: [{ data: {} }],
                targets: [{ url: webhook.url }],
              }),
              "utf8",
            ).toString("base64")}`,
          ),
        // new ButtonBuilder()
        //   .setCustomId(`a_webhook-info-show-url_${webhook.id}`)
        //   .setLabel("Show URL (advanced)")
        //   .setStyle(ButtonStyle.Secondary),
      );

      const db = getDb(ctx.env.HYPERDRIVE);
      const guild = await getchGuild(
        ctx.rest,
        ctx.env,
        ctx.interaction.guild_id,
      );
      await upsertGuild(db, guild);
      const dbUser = await upsertDiscordUser(db, ctx.user);
      await db
        .insert(webhooks)
        .values({
          platform: "discord",
          id: webhook.id,
          token: webhook.token,
          name: webhook.name ?? name,
          // biome-ignore lint/style/noNonNullAssertion:
          discordGuildId: makeSnowflake(webhook.guild_id!),
          channelId: webhook.channel_id,
          avatar: webhook.avatar,
          applicationId: webhook.application_id,
          userId: dbUser.id,
        })
        .onConflictDoNothing();

      await ctx.followup.editOriginalMessage({
        embeds: [embed],
        components: [row],
      });

      await sleep(2000);
      try {
        await ctx.rest.get(Routes.webhook(webhook.id, webhook.token));
      } catch (e) {
        if (isDiscordError(e) && e.code === RESTJSONErrorCodes.UnknownWebhook) {
          await ctx.followup.editOriginalMessage({
            embeds: [
              new EmbedBuilder()
                .setTitle("Webhook was deleted")
                .setColor(color)
                .setDescription(dedent`
                  Your webhook was created successfully, but it seems like a
                  moderation bot may have deleted it automatically. Some bots
                  detect new webhooks as spam activity. Check your server audit
                  log for more details.
                `),
            ],
            components: [],
          });
          await db
            .delete(webhooks)
            .where(
              and(
                eq(webhooks.id, webhook.id),
                eq(webhooks.platform, "discord"),
              ),
            );
        }
      }
    },
  ];
};
