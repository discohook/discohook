import { EmbedBuilder, messageLink, time } from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIGuildTextChannel,
  APIMessage,
  APIMessageApplicationCommandGuildInteraction,
  APIWebhook,
  ChannelType,
  MessageFlags,
  OverwriteType,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { desc, eq } from "drizzle-orm";
import { getDb } from "store";
import { getId, messageLogEntries } from "store/src/schema/schema.js";
import { MessageAppCommandCallback } from "../commands.js";
import { InteractionContext } from "../interactions.js";
import { userAvatarUrl, webhookAvatarUrl } from "../util/cdn.js";
import { boolEmoji, color } from "../util/meta.js";

interface LogEntry {
  id: bigint;
  type: string | null;
  user: { discordId: bigint | null } | null;
}

const getMessageDebugEmbed = async (
  ctx: InteractionContext<APIMessageApplicationCommandGuildInteraction>,
  message: APIMessage,
) => {
  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  let webhook: APIWebhook | undefined;
  let logEntries: LogEntry[] | undefined;
  if (message.webhook_id) {
    try {
      webhook = (await ctx.rest.get(
        Routes.webhook(message.webhook_id),
      )) as APIWebhook;
    } catch {}
    logEntries = await db.query.messageLogEntries.findMany({
      where: eq(messageLogEntries.messageId, message.id),
      columns: {
        id: true,
        type: true,
      },
      with: {
        user: { columns: { discordId: true } },
      },
      orderBy: desc(messageLogEntries.id),
    });
  }

  const guildId = ctx.interaction.guild_id;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: message.author.global_name ?? message.author.username,
      iconURL: message.webhook_id
        ? webhookAvatarUrl(message.author, { size: 64 })
        : userAvatarUrl(message.author, { size: 64 }),
    })
    .setTitle(
      `Message Debug for ${messageLink(
        message.channel_id,
        message.id,
        guildId,
      )}`,
    )
    .setFooter({
      text: dedent`
        ID: ${message.id}
        Flags: ${message.flags?.toString() ?? 0}
      `,
    });

  let roles: RESTGetAPIGuildRolesResult | undefined;
  try {
    roles = (await ctx.rest.get(
      Routes.guildRoles(guildId),
    )) as RESTGetAPIGuildRolesResult;
  } catch {}
  const channel = ctx.interaction.channel as APIGuildTextChannel<
    | ChannelType.GuildText
    | ChannelType.GuildVoice
    | ChannelType.GuildAnnouncement
    | ChannelType.GuildForum
    | ChannelType.GuildMedia
  >;
  const overwrites =
    ((await ctx.rest.get(Routes.channel(channel.id))) as typeof channel)
      .permission_overwrites ?? [];

  const permissions = {
    everyone: {
      guild: new PermissionsBitField(
        BigInt(roles?.find((r) => r.id === guildId)?.permissions ?? "0"),
      ),
      channel: (() => {
        const ow = channel.permission_overwrites?.find(
          (ow) => ow.id === guildId && ow.type === OverwriteType.Role,
        );
        if (ow) {
          return {
            allow: new PermissionsBitField(BigInt(ow.allow)),
            deny: new PermissionsBitField(BigInt(ow.deny)),
          };
        }
        return {
          allow: new PermissionsBitField(),
          deny: new PermissionsBitField(),
        };
      })(),
    },
    // reg. message author or app webhook owner
    user: {
      guild: new PermissionsBitField(),
      channel: {
        allow: new PermissionsBitField(),
        deny: new PermissionsBitField(),
      },
    },
  };

  if (message.webhook_id) {
    if (webhook?.user?.bot && roles) {
      try {
        // May no longer be a member
        const member = (await ctx.rest.get(
          Routes.guildMember(guildId, webhook.user.id),
        )) as RESTGetAPIGuildMemberResult;
        permissions.user.guild.add(
          member.roles.map((rid) =>
            BigInt(roles.find((role) => role.id === rid)?.permissions ?? "0"),
          ),
        );
        const ows = overwrites.filter(
          (ow) =>
            (ow.id === webhook.user?.id && ow.type === OverwriteType.Member) ||
            (ow.type === OverwriteType.Role && member.roles.includes(ow.id)),
        );
        for (const ow of ows) {
          permissions.user.channel.deny.add(BigInt(ow.deny));
          permissions.user.channel.allow.add(BigInt(ow.allow));
        }
      } catch {}
    }
    embed.addFields({
      name: "Webhook",
      value: webhook
        ? dedent`
          Created by <@${webhook.user?.id}>
          ID: \`${webhook.id}\`
        `
        : `Failed to fetch. The webhook may no longer exist (ID \`${message.webhook_id}\`)`,
    });
  } else {
    try {
      // May no longer be a member
      const member =
        message.author.id === ctx.user.id
          ? ctx.interaction.member
          : ((await ctx.rest.get(
              Routes.guildMember(guildId, message.author.id),
            )) as RESTGetAPIGuildMemberResult);
      permissions.user.guild.add(
        ...(roles
          ?.filter((role) => member.roles.includes(role.id))
          .map((role) => BigInt(role.permissions)) ?? []),
      );

      const ows = overwrites.filter(
        (ow) =>
          (ow.id === message.author.id && ow.type === OverwriteType.Member) ||
          (ow.type === OverwriteType.Role && member.roles.includes(ow.id)),
      );
      for (const ow of ows) {
        permissions.user.channel.deny.add(BigInt(ow.deny));
        permissions.user.channel.allow.add(BigInt(ow.allow));
      }
    } catch {}
    embed.addFields({
      name: "Author",
      value: `${message.author.bot ? "Bot" : "User"} with ID \`${
        message.author.id
      }\` (<@${message.author.id}>)`,
    });
  }

  const permissionScope = webhook?.user?.bot
    ? "user"
    : message.webhook_id
      ? "everyone"
      : "user";
  const guildPerm =
    permissionScope === "user"
      ? new PermissionsBitField(
          permissions.everyone.guild.mask(permissions.user.guild),
        )
      : permissions.everyone.guild;
  const channelPerm =
    permissionScope === "user"
      ? // ?  {
        //       allow: new PermissionsBitField(
        //         permissions.everyone.channel.allow.mask(
        //           permissions.user.channel.allow,
        //         ),
        //       ),
        //       deny: new PermissionsBitField(
        //         permissions.everyone.channel.deny.mask(
        //           permissions.user.channel.deny,
        //         ),
        //       ),
        //     }
        permissions.user.channel
      : permissions.everyone.channel;

  embed.addFields({
    name: "Emojis",
    value: dedent`
      Permissions for this message apply to ${
        webhook?.user?.bot
          ? `<@${webhook.user.id}> (the application that owns the webhook)`
          : message.webhook_id
            ? `@everyone ${
                webhook
                  ? ""
                  : "or the application that may have owned the webhook"
              }`
            : `<@${message.author.id}>`
      }

      **Server**
      ${boolEmoji(true)} Use Discord emojis
      ${boolEmoji(true)} Use this server's emojis
      ${boolEmoji(guildPerm.has(PermissionFlags.UseExternalEmojis))} Use external emojis

      **Channel**
      ${boolEmoji(true)} Use Discord emojis
      ${boolEmoji(true)} Use this server's emojis
      ${boolEmoji(
        channelPerm.deny.has(PermissionFlags.UseExternalEmojis)
          ? false
          : channelPerm.allow.has(PermissionFlags.UseExternalEmojis)
            ? true
            : null,
      )} Use external emojis
    `,
  });

  if (message.webhook_id) {
    embed.addFields({
      name: "Discohook Logs",
      value:
        !logEntries || logEntries.length === 0
          ? "This message may not have been sent with Discohook."
          : logEntries
              .map(
                (entry) =>
                  `${time(new Date(getId(entry).timestamp), "d")} ${
                    entry.type
                  } - ${
                    entry.user?.discordId
                      ? `<@${entry.user.discordId}>`
                      : "anonymous"
                  }`,
              )
              .join("\n")
              .slice(0, 1024),
    });
  }

  return embed;
};

export const debugMessageCallback: MessageAppCommandCallback<
  APIMessageApplicationCommandGuildInteraction
> = async (ctx) => {
  const message = ctx.getMessage();
  return ctx.reply({
    embeds: [(await getMessageDebugEmbed(ctx, message)).toJSON()],
    flags: MessageFlags.Ephemeral,
  });
};
