import { json } from "@remix-run/cloudflare";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { verifyAuthToken } from "~/routes/s.$guildId";
import { getDb, messageLogEntries, webhooks } from "~/store.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zx.parseParams(params, {
    guildId: z.string().refine((v) => !Number.isNaN(Number(v))),
  });
  const { page, limit } = zx.parseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    page: zx.IntAsString.refine((v) => v >= 0).default("0"),
  });
  const { owner, permissions } = await verifyAuthToken(request, context);
  if (
    !owner &&
    !new PermissionsBitField(BigInt(permissions)).has(
      PermissionFlags.ViewAuditLog,
      PermissionFlags.ManageGuild,
    )
  ) {
    throw json({ message: "Missing permissions" }, 403);
  }

  const db = getDb(context.env.DATABASE_URL);
  const entries = await db.query.messageLogEntries.findMany({
    where: eq(messageLogEntries.discordGuildId, BigInt(guildId)),
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

  return { entries, webhooks: entryWebhooks };
};
