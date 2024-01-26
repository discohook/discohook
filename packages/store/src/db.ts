import { APIUser } from "discord-api-types/v10";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import * as schemaV1 from "./schema/schema-v1.js";
import * as schema from "./schema/schema.js";
import { PartialKVGuild } from "./types/guild.js";

const getDbWithClient = (client: Client | Pool) =>
  drizzle(client, { schema: { ...schema, ...schemaV1 } });

export const getDb = (connectionString: string) => {
  // const client = new Client({ connectionString });
  // await client.connect();
  const pool = new Pool({ connectionString });
  return getDbWithClient(pool);
  // return [
  //   getDbWithClient(client),
  //   (ctx: ExecutionContext) => ctx.waitUntil(client.end()),
  // ] as [DBWithSchema, (ctx: ExecutionContext) => void];
};

export type DBWithSchema = ReturnType<typeof getDbWithClient>;

export const upsertGuild = async (db: DBWithSchema, guild: PartialKVGuild) => {
  return (
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
      })
      .returning()
  )[0];
};

export const upsertDiscordUser = async (db: DBWithSchema, user: APIUser) => {
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
};
