import { REST } from "@discordjs/rest";
import {
  APIWebhook,
  GatewayWebhooksUpdateDispatchData,
  Routes,
} from "discord-api-types/v10";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { getDb } from "store";
import { makeSnowflake, webhooks } from "store/src/schema";
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

  const db = getDb(env.HYPERDRIVE.connectionString);
  if (channelWebhooks.length === 0) {
    await db
      .delete(webhooks)
      .where(
        and(
          eq(webhooks.platform, "discord"),
          eq(webhooks.channelId, event.channel_id),
        ),
      );
  } else {
    await db.transaction(async (tx) => {
      // We retrieve tokens first in case we have tokens from a different bot;
      // we don't want to lose that data in the upsert event.
      const tokens = await tx.query.webhooks.findMany({
        where: and(
          eq(webhooks.platform, "discord"),
          inArray(
            webhooks.id,
            channelWebhooks.map((w) => w.id),
          ),
        ),
        columns: {
          id: true,
          token: true,
        },
      });

      await tx
        .insert(webhooks)
        .values(
          channelWebhooks.map((webhook) => ({
            platform: "discord" as const,
            id: webhook.id,
            name: webhook.name ?? "",
            avatar: webhook.avatar,
            channelId: webhook.channel_id,
            discordGuildId: makeSnowflake(event.guild_id),
            token:
              webhook.token ?? tokens.find((w) => w.id === webhook.id)?.token,
            applicationId: webhook.application_id,
          })),
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
            channelWebhooks.map((w) => w.id),
          ),
        ),
      );
    });
  }
};
