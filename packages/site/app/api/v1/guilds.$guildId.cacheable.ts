import { REST } from "@discordjs/rest";
import {
  ChannelType,
  RESTGetAPIGuildChannelsResult,
  Routes,
} from "discord-api-types/v10";
import { sql } from "drizzle-orm";
import { refreshAuthToken } from "~/routes/s.$guildId";
import { discordRoles, getDb, makeSnowflake } from "~/store.server";
import {
  ResolvableAPIChannel,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";
import { getChannelIconType } from "./channels.$channelId";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  // You only need to be a member for this route
  const { guild, permissions } = await refreshAuthToken(
    String(guildId),
    request,
    context,
    true,
  );

  const db = getDb(context.env.DATABASE_URL);
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

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const channels = (await rest.get(
    Routes.guildChannels(guild.id),
  )) as RESTGetAPIGuildChannelsResult;

  return {
    // Unsure what to do about members since they aren't capped as low as
    // roles and channels. I suppose the client could paginate through the
    // server in the future
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
  };
};
