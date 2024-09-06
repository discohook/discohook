import { APIUser } from "discord-api-types/v10";
import { drizzle } from "drizzle-orm/postgres-js";
import JSONbig_ from "json-bigint";
import postgres from "postgres";
import * as schemaV1 from "./schema/schema-v1.js";
import * as schema from "./schema/schema.js";
import { PartialKVGuild } from "./types/guild.js";

const JSONbig = JSONbig_({ useNativeBigInt: true, alwaysParseAsBig: true });

const getDbWithClient = (client: postgres.Sql) =>
  drizzle(client, { schema: { ...schema, ...schemaV1 } });

export const getDb = ({ connectionString }: Hyperdrive) => {
  const client = postgres(connectionString, {
    prepare: false,
    // Thanks https://github.com/drizzle-team/drizzle-orm/issues/989#issuecomment-1936564267
    types: {
      bigint: postgres.BigInt,
      json: {
        // "json" in pg_catalog.pg_type
        from: [114],
        to: 114,
        parse: JSONbig.parse,
        serialize: JSONbig.stringify,
      },
    },
  });
  return getDbWithClient(client);
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

export const upsertDiscordUser = async (
  db: DBWithSchema,
  user: APIUser,
  oauth?: {
    accessToken: string;
    refreshToken?: string;
    scope: string[];
    expiresAt: Date;
  },
) => {
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

  const { id } = (
    await db
      .insert(schema.users)
      .values({
        discordId: schema.makeSnowflake(user.id),
        name: user.global_name ?? user.username,
      })
      .onConflictDoUpdate({
        target: schema.users.discordId,
        set: { name: user.global_name ?? user.username },
      })
      .returning({ id: schema.users.id })
  )[0];

  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
    columns: {
      id: true,
      name: true,
      firstSubscribed: true,
      subscribedSince: true,
      subscriptionExpiresAt: true,
      lifetime: true,
      discordId: true,
      guildedId: true,
    },
    with: {
      discordUser: true,
      guildedUser: true,
    },
  });
  if (!dbUser) {
    throw Error(`Upserted user with ID ${user.id} was mysteriously not found.`);
  }

  if (oauth) {
    await db
      .insert(schema.oauthInfo)
      .values({
        discordId: dbUser.discordId,
        accessToken: oauth.accessToken,
        refreshToken: oauth.refreshToken,
        expiresAt: oauth.expiresAt,
        scope: oauth.scope,
      })
      .onConflictDoUpdate({
        target: schema.oauthInfo.discordId,
        set: {
          accessToken: oauth.accessToken,
          refreshToken: oauth.refreshToken,
          expiresAt: oauth.expiresAt,
          /*
            This could technically be not accurate.
            When you authorize an application, all scopes are added to those
            that you have already granted, but this implementation resets the
            array with only the new scopes. This shouldn't actually be an
            issue in most normal cases.
          */
          scope: oauth.scope,
        },
      });
  }

  return dbUser;
};

export const upsertGuildedUser = async (
  db: DBWithSchema,
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  },
  oauth?: {
    accessToken: string;
    refreshToken?: string;
    scope: string[];
    expiresAt: Date;
  },
) => {
  await db
    .insert(schema.guildedUsers)
    .values({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatar,
    })
    .onConflictDoUpdate({
      target: schema.guildedUsers.id,
      set: {
        name: user.name,
        avatarUrl: user.avatar,
      },
    });

  const { id } = (
    await db
      .insert(schema.users)
      .values({
        guildedId: user.id,
        name: user.name,
      })
      .onConflictDoUpdate({
        target: schema.users.guildedId,
        set: { name: user.name },
      })
      .returning({ id: schema.users.id })
  )[0];

  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
    columns: {
      id: true,
      name: true,
      firstSubscribed: true,
      subscribedSince: true,
      subscriptionExpiresAt: true,
      lifetime: true,
      discordId: true,
      guildedId: true,
    },
    with: {
      discordUser: true,
      guildedUser: true,
    },
  });
  if (!dbUser) {
    throw Error(`Upserted user with ID ${user.id} was mysteriously not found.`);
  }

  if (oauth) {
    await db
      .insert(schema.oauthInfo)
      .values({
        guildedId: dbUser.guildedId,
        accessToken: oauth.accessToken,
        refreshToken: oauth.refreshToken,
        expiresAt: oauth.expiresAt,
        scope: oauth.scope,
      })
      .onConflictDoUpdate({
        target: schema.oauthInfo.guildedId,
        set: {
          accessToken: oauth.accessToken,
          refreshToken: oauth.refreshToken,
          expiresAt: oauth.expiresAt,
          /*
            This could technically be not accurate.
            When you authorize an application, all scopes are added to those
            that you have already granted, but this implementation resets the
            array with only the new scopes. This shouldn't actually be an
            issue in most normal cases.
          */
          scope: oauth.scope,
        },
      });
  }

  return dbUser;
};
