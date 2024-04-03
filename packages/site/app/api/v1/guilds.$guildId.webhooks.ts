import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { RESTGetAPIGuildWebhooksResult, Routes } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, webhooks } from "store";
import { zx } from "zodix";
import { verifyAuthToken } from "~/routes/s.$guildId";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const { page, limit } = zxParseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    page: zx.IntAsString.refine((v) => v >= 0).default("0"),
  });
  const { owner, permissions } = await verifyAuthToken(request, context);
  if (
    !owner &&
    !new PermissionsBitField(BigInt(permissions)).has(
      PermissionFlags.ManageWebhooks,
    )
  ) {
    throw json({ message: "Missing permissions" }, 403);
  }

  const db = getDb(context.env.DATABASE_URL);
  let guildWebhooks = await db.query.webhooks.findMany({
    where: and(
      eq(webhooks.discordGuildId, guildId),
      eq(webhooks.platform, "discord"),
    ),
    columns: {
      id: true,
      name: true,
      avatar: true,
      channelId: true,
    },
    with: {
      user: {
        columns: {
          name: true,
        },
      },
    },
    limit,
    offset: page * limit,
    orderBy: desc(webhooks.name),
  });

  if (guildWebhooks.length === 0) {
    const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
    let freshWebhooks: RESTGetAPIGuildWebhooksResult | undefined;
    try {
      freshWebhooks = (await rest.get(
        Routes.guildWebhooks(String(guildId)),
      )) as RESTGetAPIGuildWebhooksResult;
    } catch {}
    if (freshWebhooks) {
      guildWebhooks = (
        await db
          .insert(webhooks)
          .values(
            freshWebhooks.map((webhook) => ({
              platform: "discord" as const,
              id: webhook.id,
              discordGuildId: guildId,
              channelId: webhook.channel_id,
              name: webhook.name ?? "",
              avatar: webhook.avatar,
              applicationId: webhook.application_id,
            })),
          )
          .onConflictDoUpdate({
            target: [webhooks.platform, webhooks.id],
            set: {
              name: sql`excluded.name`,
              avatar: sql`excluded.avatar`,
              channelId: sql`excluded."channelId"`,
              discordGuildId: sql`excluded."discordGuildId"`,
              applicationId: sql`excluded."applicationId"`,
            },
          })
          .returning({
            id: webhooks.id,
            name: webhooks.name,
            avatar: webhooks.avatar,
            channelId: webhooks.channelId,
          })
      ).map((d) => ({ ...d, user: null }));
    }
  }

  return guildWebhooks;
};
