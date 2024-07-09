import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  ChannelType,
  RESTGetAPIGuildChannelsResult,
  Routes
} from "discord-api-types/v10";
import { sql } from "drizzle-orm";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
} from "~/session.server";
import { discordRoles, getDb, makeSnowflake } from "~/store.server";
import {
  ResolvableAPIChannel,
  ResolvableAPIEmoji,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";
import { getChannelIconType } from "./channels.$channelId";

// export type GuildMe = Pick<APIGuildMember, "roles" | "avatar"> & {
//   /** Whether the member owns the guild */
//   owner: boolean;
//   /** Calculated server-level permissions */
//   permissions: string;
// };

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  let { guild } = await getTokenGuildPermissions(token, guildId, context.env);

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  if (!guild) {
    guild = await getGuild(guildId, rest, context.env);
    // owner = guild.owner_id === String(token.user.discordUser?.id);
  }
  // if (!member) {
  //   member = (await rest.get(
  //     Routes.guildMember(String(guildId), String(token.user.discordUser?.id)),
  //   )) as APIGuildMember;
  //   owner = guild.owner_id === member.user?.id;
  // }

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  await db
    .insert(discordRoles)
    .values(
      guild.roles.map((role) => ({
        guildId,
        id: makeSnowflake(role.id),
        color: role.color,
        hoist: role.hoist,
        icon: role.icon,
        managed: role.managed,
        mentionable: role.mentionable,
        name: role.name,
        permissions: role.permissions,
        position: role.position,
        unicodeEmoji: role.unicode_emoji,
      })),
    )
    .onConflictDoUpdate({
      target: [discordRoles.id],
      set: {
        name: sql`excluded.name`,
        color: sql`excluded.color`,
        hoist: sql`excluded.hoist`,
        icon: sql`excluded.icon`,
        unicodeEmoji: sql`excluded."unicodeEmoji"`,
        managed: sql`excluded.managed`,
        mentionable: sql`excluded.mentionable`,
        permissions: sql`excluded.permissions`,
        position: sql`excluded.position`,
      },
    });

  const channels = (await rest.get(
    Routes.guildChannels(guild.id),
  )) as RESTGetAPIGuildChannelsResult;

  return respond(
    json({
      // Unsure what to do about members since they aren't capped as low as
      // roles and channels. I suppose the client could paginate through the
      // server in the future
      // me: {
      //   avatar: member.avatar,
      //   roles: member.roles,
      //   owner,
      //   permissions: permissions.toString(),
      // } as GuildMe,
      roles: guild.roles
        .filter((r) => r.id !== guild.id)
        .map((role) => ({
          id: role.id,
          color: role.color,
          icon: role.icon,
          managed: role.managed,
          mentionable: role.mentionable,
          name: role.name,
          position: role.position,
          unicode_emoji: role.unicode_emoji,
        })) satisfies ResolvableAPIRole[] as ResolvableAPIRole[],
      channels: channels
        .filter(
          (c) =>
            ![ChannelType.GuildCategory, ChannelType.GuildDirectory].includes(
              c.type,
            ),
        )
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: getChannelIconType(channel),
        })) satisfies ResolvableAPIChannel[] as ResolvableAPIChannel[],
      emojis: guild.emojis.map((emoji) => ({
        id: emoji.id ?? undefined,
        // biome-ignore lint/style/noNonNullAssertion: Only nullable in reactions
        name: emoji.name!,
        animated: emoji.animated ? emoji.animated : undefined,
        available: !emoji.available ? emoji.available : undefined,
      })) satisfies ResolvableAPIEmoji[] as ResolvableAPIEmoji[],
    }),
  );
};
