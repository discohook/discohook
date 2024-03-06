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

  // This shouldn't happen every time a websocket bot instance starts, only
  // when joining a new guild. We are assuming that the instance has correctly
  // determined whether we are already a member of this guild. If not, that's
  // not such a huge deal, but it will probably be annoying and this feature
  // will be removed.
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  try {
    await rest.patch(Routes.guildMember(guild.id, "@me"), {
      body: {
        nick: "Boogiehook",
      },
      reason:
        "Discohook Utils is now Boogiehook! Read more: /help tag:boogiehook",
    });
  } catch {}

  const db = getDb(env.DATABASE_URL);
  await db
    .insert(discordGuilds)
    .values({
      id: makeSnowflake(guild.id),
      name: guild.name,
      icon: guild.icon,
    })
    .onConflictDoUpdate({
      target: discordGuilds.id,
      set: {
        name: guild.name,
        icon: guild.icon,
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
