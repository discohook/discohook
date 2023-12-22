import * as schema from "./schema.js";
import { drizzle } from "drizzle-orm/d1";
import { Env } from "../types/env.js";
import { PartialKVGuild } from "../util/kv.js";
import { APIUser } from "discord-api-types/v10";

export const getDb = (db: Env['DB']) => drizzle(db, { schema });

type DB = ReturnType<typeof getDb>

export const upsertGuild = async (db: DB, guild: PartialKVGuild) => {
  await db
    .insert(schema.discordGuilds)
    .values({
      id: schema.makeSnowflake(guild.id),
      name: guild.name,
      icon: guild.icon,
    })
    .onConflictDoUpdate({
      target: schema.discordGuilds.id,
      set: {
        name: guild.name,
        icon: guild.icon,
      },
    });
}

export const upsertDiscordUser = async (db: DB, user: APIUser) => {
  await db
    .insert(schema.discordUsers)
    .values({
      id: schema.makeSnowflake(user.id),
      name: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
      discriminator: user.discriminator,
    })
    .onConflictDoUpdate({
      target: schema.discordUsers.id,
      set: {
        name: user.username,
        globalName: user.global_name,
        avatar: user.avatar,
        discriminator: user.discriminator,
      },
    });

  const dbUser = await db
    .insert(schema.users)
    .values({
      discordId: schema.makeSnowflake(user.id),
      name: user.global_name ?? user.username,
    })
    .onConflictDoUpdate({
      target: schema.users.discordId,
      set: { name: user.global_name ?? user.username },
    })
    .returning();

  return dbUser[0];
}
