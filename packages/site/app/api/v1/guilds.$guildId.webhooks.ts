import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  APIChannel,
  APIWebhook,
  RESTGetAPIGuildWebhooksResult,
  RESTJSONErrorCodes,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { DBWithSchema, getDb, webhooks } from "store";
import { zx } from "zodix";
import { getBucket } from "~/durable/rate-limits";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { isDiscordError } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

const upsertGuildWebhooks = async (
  db: DBWithSchema,
  allWebhooks: APIWebhook[],
  guildId: bigint,
) => {
  const incoming = allWebhooks.filter((w) => w.type === WebhookType.Incoming);

  return (
    await db.transaction(async (tx) => {
      if (incoming.length === 0) {
        await tx
          .delete(webhooks)
          .where(
            and(
              eq(webhooks.discordGuildId, guildId),
              eq(webhooks.platform, "discord"),
            ),
          );
        return [];
      }

      // We retrieve tokens first in case we have tokens from a different bot;
      // we don't want to lose that data in the upsert event.
      const residual = await tx.query.webhooks.findMany({
        where: and(
          eq(webhooks.platform, "discord"),
          inArray(
            webhooks.id,
            incoming.map((w) => w.id),
          ),
        ),
        columns: { id: true, token: true },
      });

      const upserted = await tx
        .insert(webhooks)
        .values(
          incoming.map((webhook) => {
            const extant = residual.find((w) => w.id === webhook.id);
            return {
              platform: "discord" as const,
              id: webhook.id,
              name: webhook.name ?? "",
              avatar: webhook.avatar,
              channelId: webhook.channel_id,
              discordGuildId: guildId,
              token: webhook.token ?? extant?.token ?? undefined,
              applicationId: webhook.application_id,
            } satisfies typeof webhooks.$inferInsert;
          }),
        )
        .onConflictDoUpdate({
          target: [webhooks.platform, webhooks.id],
          set: {
            name: sql`excluded.name`,
            avatar: sql`excluded.avatar`,
            channelId: sql`excluded."channelId"`,
            token: sql`excluded.token`,
            applicationId: sql`excluded."applicationId"`,
          },
        })
        .returning({
          id: webhooks.id,
          name: webhooks.name,
          avatar: webhooks.avatar,
          channelId: webhooks.channelId,
          applicationId: webhooks.applicationId,
        });

      // Delete stale records
      await tx.delete(webhooks).where(
        and(
          eq(webhooks.platform, "discord"),
          eq(webhooks.discordGuildId, guildId),
          notInArray(
            webhooks.id,
            incoming.map((w) => w.id),
          ),
        ),
      );

      return upserted;
    })
  ).map((d) => ({ ...d, user: null }));
};

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const { page, limit, force } = zxParseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    page: zx.IntAsString.refine((v) => v >= 0).default("0"),
    force: zx.BoolAsString.default("false"),
  });
  const headers = await getBucket(
    request,
    context,
    force ? "guildWebhooksForce" : "guildWebhooks",
  );

  const [token, respond] = await authorizeRequest(request, context, {
    headers,
  });
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.ManageWebhooks)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);

  let guildWebhooks: {
    id: string;
    name: string;
    channelId: string;
    avatar: string | null;
    applicationId: string | null;
    user: { name: string } | null;
  }[] = [];
  try {
    const db = getDb(context.env.HYPERDRIVE);
    if (force) {
      const freshWebhooks = (await rest.get(
        Routes.guildWebhooks(String(guildId)),
      )) as RESTGetAPIGuildWebhooksResult;
      guildWebhooks = await upsertGuildWebhooks(db, freshWebhooks, guildId);
    } else {
      guildWebhooks = await db.query.webhooks.findMany({
        where: (webhooks, { and, eq }) =>
          and(
            eq(webhooks.discordGuildId, guildId),
            eq(webhooks.platform, "discord"),
          ),
        columns: {
          id: true,
          name: true,
          avatar: true,
          channelId: true,
          applicationId: true,
        },
        with: {
          user: {
            columns: { name: true },
          },
        },
        limit,
        offset: page * limit,
        orderBy: (webhooks, { desc }) => desc(webhooks.name),
      });

      if (guildWebhooks.length === 0) {
        const freshWebhooks = (await rest.get(
          Routes.guildWebhooks(String(guildId)),
        )) as RESTGetAPIGuildWebhooksResult;
        guildWebhooks = await upsertGuildWebhooks(db, freshWebhooks, guildId);
      }
    }
  } catch (e) {
    if (isDiscordError(e)) {
      const err = e.rawError;
      let msg = err.message;
      switch (err.code) {
        case RESTJSONErrorCodes.UnknownGuild:
          msg = `Discohook Utils is not in this server (${err.message})`;
          break;
        case RESTJSONErrorCodes.MissingAccess:
          msg = `Discohook Utils cannot access this server (${err.message})`;
          break;
        default:
          break;
      }
      throw respond(json({ ...err, message: msg }, e.status));
    }
    throw e;
  }

  let channels: APIChannel[];
  try {
    channels = (await rest.get(
      Routes.guildChannels(String(guildId)),
    )) as APIChannel[];
  } catch (e) {
    channels = [];
  }

  return respond(
    json(
      guildWebhooks.map((gw) => {
        const channel = channels.find((c) => c.id === gw.channelId);
        return {
          ...gw,
          canAccessToken:
            gw.applicationId === context.env.DISCORD_CLIENT_ID ||
            !gw.applicationId,
          channel: channel
            ? {
                name: channel.name,
                // type: channel.type,
              }
            : undefined,
        };
      }),
    ),
  );
};
