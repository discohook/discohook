import { ContainerBuilder, messageLink } from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIGuildMember,
  type APIGuildTextChannel,
  type APIMessage,
  type APIMessageApplicationCommandGuildInteraction,
  type APIWebhook,
  type ChannelType,
  OverwriteType,
  type RESTGetAPIGuildMemberResult,
  type RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import type { MessageAppCommandCallback } from "../commands.js";
import type { InteractionContext } from "../interactions.js";
import { textDisplay } from "../util/components.js";
import { boolEmoji, color } from "../util/meta.js";

interface LogEntry {
  id: bigint;
  type: string | null;
  user: { discordId: bigint | null } | null;
}

const getMessageDebugContainer = async (
  ctx: InteractionContext<APIMessageApplicationCommandGuildInteraction>,
  message: APIMessage,
) => {
  let webhook: APIWebhook | undefined;
  if (message.webhook_id) {
    try {
      webhook = (await ctx.rest.get(
        Routes.webhook(message.webhook_id),
      )) as APIWebhook;
    } catch {}
  }

  const guildId = ctx.interaction.guild_id;
  const container = new ContainerBuilder()
    .setAccentColor(color)
    // .setAuthor({
    //   name: message.author.global_name ?? message.author.username,
    //   iconURL: message.webhook_id
    //     ? webhookAvatarUrl(message.author, { size: 64 })
    //     : userAvatarUrl(message.author, { size: 64 }),
    // })
    .addTextDisplayComponents(
      textDisplay(
        `### Message Debug for ${messageLink(
          message.channel_id,
          message.id,
          guildId,
        )}`,
      ),
    );

  const [roles, channel] = await Promise.all([
    (async () => {
      try {
        return (await ctx.rest.get(
          Routes.guildRoles(guildId),
        )) as RESTGetAPIGuildRolesResult;
      } catch {}
    })(),
    ctx.rest.get(
      Routes.channel(webhook?.channel_id ?? ctx.interaction.channel.id),
    ) as Promise<
      APIGuildTextChannel<
        | ChannelType.GuildText
        | ChannelType.GuildVoice
        | ChannelType.GuildAnnouncement
        | ChannelType.GuildForum
        | ChannelType.GuildMedia
      >
    >,
  ]);

  let guildPerm = new PermissionsBitField();
  let channelPerm = new PermissionsBitField();

  // calculate for user (webhook owner if bot, else direct author)
  if (webhook?.user?.bot || !message.webhook_id) {
    const userId = webhook?.user?.bot ? webhook.user.id : message.author.id;

    let member: APIGuildMember | undefined;
    if (
      webhook?.user?.bot &&
      webhook.application_id === ctx.interaction.application_id
    ) {
      member = ctx.interaction.member;
      channelPerm = ctx.appPermissons;
    } else if (userId === ctx.user.id) {
      member = ctx.interaction.member;
      channelPerm = ctx.userPermissons;
    }
    if (!member) {
      // must exist because webhooks are removed if the bot is removed, and
      // oauth webhooks have the `user` of the user who authorized.
      // TODO: what permissions do oauth webhooks inherit?
      member = (await ctx.rest.get(
        Routes.guildMember(guildId, userId),
      )) as RESTGetAPIGuildMemberResult;
    }
    if (roles) {
      for (const roleId of member.roles) {
        const role = roles.find((r) => r.id === roleId);
        if (!role) continue;

        guildPerm.add(BigInt(role.permissions));
      }
    }
    if (channelPerm.value !== 0n) {
      for (const override of channel.permission_overwrites ?? []) {
        switch (override.type) {
          case OverwriteType.Member:
            if (override.id === userId) {
              channelPerm.add(BigInt(override.allow));
              channelPerm.remove(BigInt(override.deny));
            }
            break;
          case OverwriteType.Role:
            if (member.roles.includes(override.id)) {
              channelPerm.add(BigInt(override.allow));
              channelPerm.remove(BigInt(override.deny));
            }
            break;
          default:
            break;
        }
      }
    }
  }
  // calculate for @everyone (if webhook)
  if (message.webhook_id) {
    // Disregard the webhook owner in favor of @everyone if they are a human,
    // but not if they are a bot
    const everyoneRole = roles?.find((r) => r.id === guildId);
    if (everyoneRole) {
      if (webhook?.user?.bot) {
        guildPerm.add(BigInt(everyoneRole.permissions));
      } else {
        guildPerm = new PermissionsBitField(BigInt(everyoneRole.permissions));
      }
    }
    for (const override of channel.permission_overwrites ?? []) {
      if (override.type === OverwriteType.Role && override.id === guildId) {
        channelPerm.add(BigInt(override.allow));
        channelPerm.remove(BigInt(override.deny));
      }
    }
  }
  const hasChannelExtEmoji = channelPerm.has(PermissionFlags.UseExternalEmojis);

  container
    .addTextDisplayComponents(
      textDisplay(dedent`
        **Emojis**
        Permissions for this message inherit from ${
          webhook?.user?.bot
            ? `<@${webhook.user.id}> and @everyone`
            : message.webhook_id
              ? "@everyone"
              : `<@${message.author.id}>`
        }`),
    )
    .addSeparatorComponents((s) => s.setDivider())
    .addTextDisplayComponents(
      textDisplay(dedent`
        ${boolEmoji(true)} Use this server's emojis
        ${boolEmoji(guildPerm.has(PermissionFlags.UseExternalEmojis))} Use external emojis (server)
        ${boolEmoji(hasChannelExtEmoji)} Use external emojis (channel)
        ${hasChannelExtEmoji ? "Looks good! If you just updated permissions, try sending the message again." : ""}
      `),
    )
    .addSeparatorComponents((s) => s.setDivider());

  container.addTextDisplayComponents(
    textDisplay(
      `-# ID: ${message.id}\n-# Flags: ${message.flags?.toString() ?? 0}`,
    ),
  );
  return container;
};

export const debugMessageCallback: MessageAppCommandCallback<
  APIMessageApplicationCommandGuildInteraction
> = async (ctx) => {
  const message = ctx.getMessage();
  return ctx.reply({
    components: [await getMessageDebugContainer(ctx, message)],
    ephemeral: true,
    componentsV2: true,
    allowedMentions: { parse: [] },
  });
};
