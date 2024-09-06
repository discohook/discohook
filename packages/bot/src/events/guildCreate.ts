import { REST } from "@discordjs/rest";
import { GatewayGuildCreateDispatchData, Routes } from "discord-api-types/v10";
import { eq, sql } from "drizzle-orm";
import { getDb } from "store";
import { discordGuilds, discordRoles, makeSnowflake } from "store/src/schema";
import { GatewayEventCallback } from "../events.js";

export const guildCreateCallback: GatewayEventCallback = async (
  env,
  guild: GatewayGuildCreateDispatchData,
) => {
  if (guild.unavailable) return;
  const now = new Date();

  const db = getDb(env.HYPERDRIVE);
  const moderated = await env.KV.get<{ state: "banned"; reason?: string }>(
    `moderation-guild-${guild.id}`,
    "json",
  );
  if (moderated?.state === "banned") {
    const rest = new REST().setToken(env.DISCORD_TOKEN);
    await rest.delete(Routes.userGuild(guild.id));
    return;
  }

  await db
    .insert(discordGuilds)
    .values({
      id: makeSnowflake(guild.id),
      name: guild.name,
      icon: guild.icon,
      ownerDiscordId: makeSnowflake(guild.owner_id),
      botJoinedAt: now,
    })
    .onConflictDoUpdate({
      target: discordGuilds.id,
      set: {
        name: guild.name,
        icon: guild.icon,
        ownerDiscordId: makeSnowflake(guild.owner_id),
        botJoinedAt: sql`CASE WHEN ${discordGuilds.botJoinedAt} IS NULL THEN ${now} ELSE excluded."botJoinedAt" END`,
      },
    });

  await db
    .delete(discordRoles)
    .where(eq(discordRoles.guildId, makeSnowflake(guild.id)));
  await db
    .insert(discordRoles)
    .values(
      guild.roles.map((role) => ({
        id: makeSnowflake(role.id),
        guildId: makeSnowflake(guild.id),
        name: role.name,
        position: role.position,
        color: role.color,
        hoist: role.hoist,
        icon: role.icon,
        unicodeEmoji: role.unicode_emoji,
        managed: role.managed,
        mentionable: role.mentionable,
        permissions: role.permissions,
      })),
    )
    .onConflictDoUpdate({
      target: discordRoles.id,
      set: {
        name: sql`excluded.name`,
        position: sql`excluded.position`,
        color: sql`excluded.color`,
        hoist: sql`excluded.hoist`,
        icon: sql`excluded.icon`,
        unicodeEmoji: sql`excluded."unicodeEmoji"`,
        managed: sql`excluded.managed`,
        mentionable: sql`excluded.mentionable`,
        permissions: sql`excluded.permissions`,
      },
    });
};
