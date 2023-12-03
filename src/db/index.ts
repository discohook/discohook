import * as schema from "./db-schema.js";
import { drizzle } from "drizzle-orm/d1";
import { Env } from "../types/env.js";
import { PartialKVGuild } from "../util/kv.js";

export const getDb = (db: Env['DB']) => drizzle(db, { schema });

type DB = ReturnType<typeof getDb>

export const upsertGuild = async (db: DB, guild: PartialKVGuild) => {
  await db
    .insert(schema.discordGuilds)
    .values({
      id: BigInt(guild.id),
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
