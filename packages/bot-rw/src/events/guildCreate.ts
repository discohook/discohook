import { GatewayDispatchEvents } from "discord-api-types/v10";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.GuildCreate,
  async ({ client, data: guild }) => {
    if (!client.ready) return;

    // For some reason in dev I was receiving these events only after the
    // client was ready, in which scenario I don't think it would be possible
    // to determine if this is a new authorization or just an event to fill
    // cache. Maybe we could implement a timeout per shard before we start
    // accepting these as new guilds?
    console.log("GUILD_CREATE", guild.id, { ready: client.ready });

    // const db = client.getDb();
    // const moderated = await client.KV.get<{ state: "banned"; reason?: string }>(
    //   `moderation-guild-${guild.id}`,
    //   "json",
    // );
    // if (moderated?.state === "banned") {
    //   await client.api.users.leaveGuild(guild.id);
    //   return;
    // }

    // const now = sql`NOW()`;
    // await db
    //   .insert(discordGuilds)
    //   .values({
    //     id: makeSnowflake(guild.id),
    //     name: guild.name,
    //     icon: guild.icon,
    //     ownerDiscordId: makeSnowflake(guild.owner_id),
    //     botJoinedAt: now,
    //   })
    //   .onConflictDoUpdate({
    //     target: discordGuilds.id,
    //     set: {
    //       name: guild.name,
    //       icon: guild.icon,
    //       ownerDiscordId: makeSnowflake(guild.owner_id),
    //       botJoinedAt: sql`CASE WHEN ${discordGuilds.botJoinedAt} IS NULL THEN ${now} ELSE excluded."botJoinedAt" END`,
    //     },
    //   });

    // await db
    //   .delete(discordRoles)
    //   .where(eq(discordRoles.guildId, makeSnowflake(guild.id)));
    // await db
    //   .insert(discordRoles)
    //   .values(
    //     guild.roles.map((role) => ({
    //       id: makeSnowflake(role.id),
    //       guildId: makeSnowflake(guild.id),
    //       name: role.name,
    //       position: role.position,
    //       color: role.color,
    //       hoist: role.hoist,
    //       icon: role.icon,
    //       unicodeEmoji: role.unicode_emoji,
    //       managed: role.managed,
    //       mentionable: role.mentionable,
    //       permissions: role.permissions,
    //     })),
    //   )
    //   .onConflictDoUpdate({
    //     target: discordRoles.id,
    //     set: {
    //       name: sql`excluded.name`,
    //       position: sql`excluded.position`,
    //       color: sql`excluded.color`,
    //       hoist: sql`excluded.hoist`,
    //       icon: sql`excluded.icon`,
    //       unicodeEmoji: sql`excluded."unicodeEmoji"`,
    //       managed: sql`excluded.managed`,
    //       mentionable: sql`excluded.mentionable`,
    //       permissions: sql`excluded.permissions`,
    //     },
    //   });
  },
);
