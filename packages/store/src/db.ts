import {
  ButtonStyle,
  ComponentType,
  type APIUser,
} from "discord-api-types/v10";
import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { JSONParse, JSONStringify } from "json-with-bigint";
import postgres from "postgres";
import * as schemaV1 from "./schema/schema-v1.js";
import * as schema from "./schema/schema.js";
import type { DraftFlow } from "./types/components.js";
import type { PartialKVGuild } from "./types/guild.js";

const getDbWithClient = (
  client: postgres.Sql,
  options?: { logger?: boolean },
) => drizzle(client, { schema: { ...schema, ...schemaV1 }, ...options });

export const getDb = ({
  connectionString,
  logger,
}: Pick<Hyperdrive, "connectionString"> & { logger?: boolean }) => {
  const client = postgres(connectionString, {
    // https://developers.cloudflare.com/hyperdrive/observability/troubleshooting/#driver-errors
    prepare: true,
    // Thanks https://github.com/drizzle-team/drizzle-orm/issues/989#issuecomment-1936564267
    types: {
      bigint: postgres.BigInt,
      json: {
        // "json" in pg_catalog.pg_type
        from: [114],
        to: 114,
        parse: JSONParse,
        serialize: JSONStringify,
      },
    },
  });
  return getDbWithClient(client, { logger });
};

export type DBWithSchema = ReturnType<typeof getDbWithClient>;

export type DBTransaction = Parameters<
  Parameters<DBWithSchema["transaction"]>[0]
>[0];

// Apparently, the postgres-js driver does not automatically rollback on
// exception, which may be causing unwanted elevated session persistence!
// db.transaction: https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/postgres-js/session.ts
// Thanks AJR: https://discord.com/channels/595317990191398933/1368650532075339936/1368954068298498168
export const autoRollbackTx = <T>(
  transaction: (tx: DBTransaction) => Promise<T>,
): ((tx: DBTransaction) => Promise<T>) => {
  return async (tx: DBTransaction) => {
    try {
      // We're not quite as deep as the session class so we don't need to
      // manually commit
      return await transaction(tx);
    } catch (error) {
      await tx.execute(sql`rollback`);
      throw error;
    }
  };
};

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
    },
    with: {
      discordUser: true,
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

const firstComponentFunc = (d: DBWithSchema) =>
  d.query.discordMessageComponents.findFirst({
    with: {
      componentsToFlows: {
        columns: {},
        with: { flow: { with: { actions: { columns: { data: true } } } } },
      },
    },
  });
export type DiscordMessageComponentColumnsWithFlowRelations = NonNullable<
  Awaited<ReturnType<typeof firstComponentFunc>>
>;

// Can't use the relation here because of naming overlap, and the query API is
// not smart enough to assign a different name for one of them
const firstTriggerFunc = (d: DBWithSchema) => d.query.triggers.findFirst();
export type TriggerColumns = NonNullable<
  Awaited<ReturnType<typeof firstTriggerFunc>>
>;

/**
 * Smooth migration helper for the 2026 flow decentralization. I found it
 * unfeasible to migrate every component at once so we're instead going to
 * assume new data by default, then fall back to relational data as required.
 *
 * Runs no queries unless a migration is possible. Therefore for already
 * migrated components, this should have minimal impact on performance.
 */
export const ensureComponentFlows = async <
  C extends Pick<
    DiscordMessageComponentColumnsWithFlowRelations,
    "id" | "data" | "componentsToFlows"
  >,
>(
  component: C,
  db?: DBWithSchema | DBTransaction,
): Promise<C> => {
  const deleteRelations = async () => {
    if (!db) return;
    try {
      const flowIds = component.componentsToFlows.map((ctf) => ctf.flow.id);
      if (flowIds.length !== 0) {
        await db.delete(schema.flows).where(inArray(schema.flows.id, flowIds));
      }
    } catch (e) {
      console.error(e);
    }
  };

  switch (component.data.type) {
    case ComponentType.Button:
    case ComponentType.RoleSelect:
    case ComponentType.UserSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.MentionableSelect: {
      if (
        component.data.type === ComponentType.Button &&
        (component.data.style === ButtonStyle.Link ||
          component.data.style === ButtonStyle.Premium)
      ) {
        return component;
      }
      if (component.data.flow) {
        // await deleteRelations();
        component.componentsToFlows = [];
        return component;
      }
      if (component.componentsToFlows.length !== 0) {
        const dbFlow = component.componentsToFlows[0].flow;
        const flow = {
          name: dbFlow.name ?? undefined,
          actions: dbFlow.actions.map((a) => a.data),
        };

        component.data.flow = flow;
        // @ts-expect-error residue
        component.data.flowId = undefined;
        if (db) {
          await db
            .update(schema.discordMessageComponents)
            .set({ data: component.data })
            .where(eq(schema.discordMessageComponents.id, component.id));
          await deleteRelations();
        }

        component.componentsToFlows = [];
        return component;
      }
      // Return valid type despite missing data
      component.data.flow = { actions: [] };
      return component;
    }
    case ComponentType.StringSelect: {
      if (component.data.flows) {
        // await deleteRelations();
        component.componentsToFlows = [];
        return component;
      }
      if (component.componentsToFlows.length !== 0) {
        const flowIds =
          "flowIds" in component.data
            ? (component.data.flowIds as Record<string, string>)
            : {};

        const flowMap: (typeof component.data)["flows"] = {};
        for (const [optionValue, flowId] of Object.entries(flowIds)) {
          const ctf = component.componentsToFlows.find(
            (ctf) => String(ctf.flow.id) === flowId,
          );
          if (ctf) {
            flowMap[optionValue] = {
              name: ctf.flow.name ?? undefined,
              actions: ctf.flow.actions.map((a) => a.data),
            };
          }
        }

        component.data.flows = flowMap;
        // @ts-expect-error residue
        component.data.flowIds = undefined;
        if (db) {
          await db
            .update(schema.discordMessageComponents)
            .set({ data: component.data })
            .where(eq(schema.discordMessageComponents.id, component.id));
          await deleteRelations();
        }

        component.componentsToFlows = [];
        return component;
      }
      // Return valid type despite missing data
      component.data.flows = {};
      return component;
    }
    default:
      break;
  }

  return component;
};

/**
 * Smooth migration helper for the 2026 flow decentralization. I found it
 * unfeasible to migrate every trigger at once so we're instead going to
 * assume new data by default, then fall back to relational data as required.
 *
 * This is (practically) a no-op if `trigger.flow` is populated, minimizing
 * performance impact on already-migrated triggers.
 */
export const ensureTriggerFlow = async <
  C extends Pick<TriggerColumns, "id" | "flow" | "flowId">,
>(
  trigger: C,
  db: DBWithSchema | DBTransaction,
): Promise<C> => {
  if (trigger.flow) return trigger;

  if (trigger.flowId === null) {
    trigger.flow = { actions: [] };
    return trigger;
  }

  const flow = await db.query.flows.findFirst({
    where: eq(schema.flows.id, BigInt(trigger.flowId)),
    with: { actions: { columns: { data: true } } },
  });
  if (flow) {
    const newFlow: DraftFlow = {
      name: flow.name ?? undefined,
      actions: flow.actions.map((a) => a.data),
    };
    await db.transaction(
      autoRollbackTx(async (tx) => {
        await tx
          .update(schema.triggers)
          .set({ flow: newFlow, flowId: null })
          .where(eq(schema.triggers.id, BigInt(trigger.id)));
        await tx
          .delete(schema.flows)
          // biome-ignore lint/style/noNonNullAssertion: if flowId was null, we'd have returned by now
          .where(eq(schema.flows.id, BigInt(trigger.flowId!)));
      }),
    );

    trigger.flow = newFlow;
    trigger.flowId = null;
  }

  return trigger;
};
