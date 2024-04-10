import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { APIWebhook, Routes, WebhookType } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { and, eq, sql } from "drizzle-orm";
import { getDb, webhooks } from "store";
import { z } from "zod";
import { refreshAuthToken, verifyAuthToken } from "~/routes/s.$guildId";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId, webhookId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    webhookId: snowflakeAsString(),
  });
  const { token: userToken } = zxParseQuery(request, {
    token: z.ostring(),
  });
  let owner: boolean;
  let permissions: string;
  if (userToken) {
    ({ owner, permissions } = await verifyAuthToken(request, context));
  } else {
    const {
      guild,
      member,
      permissions: p,
    } = await refreshAuthToken(String(guildId), request, context, true);
    owner = guild.owner_id === member.user?.id;
    permissions = String(p.value);
  }
  if (
    !owner &&
    !new PermissionsBitField(BigInt(permissions)).has(
      PermissionFlags.ManageWebhooks,
    )
  ) {
    throw json({ message: "Missing permissions" }, 403);
  }

  const db = getDb(context.env.DATABASE_URL);
  const dbWebhook = await db.query.webhooks.findFirst({
    where: and(
      eq(webhooks.platform, "discord"),
      eq(webhooks.id, String(webhookId)),
    ),
    columns: {
      token: true,
      applicationId: true,
    },
  });
  if (dbWebhook) {
    if (dbWebhook.token) {
      return { id: String(webhookId), token: dbWebhook.token };
    }
    if (
      dbWebhook.applicationId &&
      dbWebhook.applicationId !== context.env.DISCORD_CLIENT_ID
    ) {
      throw json(
        {
          message:
            "Discohook cannot access this webhook's token because it is owned by a different bot.",
        },
        404,
      );
    }
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let webhook: APIWebhook;
  try {
    webhook = (await rest.get(Routes.webhook(String(webhookId)))) as APIWebhook;
  } catch {
    throw json({ message: "No such webhook or it is inaccesible." }, 404);
  }
  if (webhook.type !== WebhookType.Incoming) {
    throw json(
      {
        message:
          "This is not an incoming webhook, so Discohook cannot access its token.",
      },
      400,
    );
  }

  await db
    .insert(webhooks)
    .values({
      platform: "discord",
      id: webhook.id,
      discordGuildId: guildId,
      channelId: webhook.channel_id,
      name: webhook.name ?? "",
      avatar: webhook.avatar,
      applicationId: webhook.application_id,
      token: webhook.token,
    })
    .onConflictDoUpdate({
      target: [webhooks.platform, webhooks.id],
      set: {
        name: sql`excluded.name`,
        avatar: sql`excluded.avatar`,
        channelId: sql`excluded."channelId"`,
        discordGuildId: sql`excluded."discordGuildId"`,
        applicationId: sql`excluded."applicationId"`,
        token: sql`excluded.token`,
      },
    });

  if (!webhook.token) {
    throw json(
      { message: "Discohook cannot access this webhook's token." },
      404,
    );
  }

  return {
    id: webhook.id,
    token: webhook.token,
  };
};
