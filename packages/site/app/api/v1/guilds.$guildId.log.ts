import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { and, desc, eq, inArray } from "drizzle-orm";
import { zx } from "zodix";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { getDb, messageLogEntries, webhooks } from "~/store.server";
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

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (
    !owner &&
    !permissions.has(PermissionFlags.ViewAuditLog, PermissionFlags.ManageGuild)
  ) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const db = getDb(context.env.DATABASE_URL);
  const entries = await db.query.messageLogEntries.findMany({
    where: eq(messageLogEntries.discordGuildId, guildId),
    columns: {
      type: true,
      channelId: true,
      messageId: true,
      webhookId: true,
      threadId: true,
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
    orderBy: desc(messageLogEntries.messageId),
  });

  const webhookIds = entries
    .map((e) => e.webhookId)
    .filter((w, i, a) => a.indexOf(w) === i);
  const entryWebhooks =
    webhookIds.length === 0
      ? []
      : await db.query.webhooks.findMany({
          where: and(
            eq(webhooks.platform, "discord"),
            inArray(webhooks.id, webhookIds),
          ),
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        });

  return respond(json({ entries, webhooks: entryWebhooks }));
};
