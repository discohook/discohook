import { REST } from "@discordjs/rest";
import {
  APIWebhook,
  GatewayWebhooksUpdateDispatchData,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { autoRollbackTx, getDb, makeSnowflake, webhooks } from "store";
import { GatewayEventCallback } from "../events.js";

export const webhooksUpdateCallback: GatewayEventCallback = async (
  env,
  event: GatewayWebhooksUpdateDispatchData,
) => {
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  let channelWebhooks: APIWebhook[];
  try {
    channelWebhooks = (await rest.get(
      Routes.channelWebhooks(event.channel_id),
    )) as APIWebhook[];
  } catch (e) {
    // if (isDiscordError(e)) {
    //   console.error(e.rawError);
    // }
    return;
  }
  const incoming = channelWebhooks.filter(
    (w) => w.type === WebhookType.Incoming,
  );

  const db = getDb(env.HYPERDRIVE);
  if (incoming.length === 0) {
    await db
      .delete(webhooks)
      .where(
        and(
          eq(webhooks.platform, "discord"),
          eq(webhooks.channelId, event.channel_id),
        ),
      );
  } else {
    await db.transaction(
      autoRollbackTx(async (tx) => {
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

        await tx
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
                discordGuildId: makeSnowflake(event.guild_id),
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
          });

        // Delete stale records
        await tx.delete(webhooks).where(
          and(
            eq(webhooks.platform, "discord"),
            eq(webhooks.channelId, event.channel_id),
            notInArray(
              webhooks.id,
              incoming.map((w) => w.id),
            ),
          ),
        );
      }),
    );
  }
};
