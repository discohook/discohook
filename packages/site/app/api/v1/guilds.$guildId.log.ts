import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import z from "zod/v3";
import { zx } from "zodix";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { getDb, webhooks } from "~/store.server";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const {
    page,
    limit,
    action: filterAction,
    channelId,
    webhookId,
    userId,
  } = zxParseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    page: zx.IntAsString.refine((v) => v >= 0).default("0"),
    action: z.enum(["send", "edit", "delete"]).optional(),
    channelId: snowflakeAsString().optional(),
    webhookId: snowflakeAsString().optional(),
    userId: snowflakeAsString().optional(),
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

  const db = getDb(context.env.HYPERDRIVE);
  const entries = await db.query.messageLogEntries.findMany({
    where: (table, { eq, and }) => {
      const queries = [];
      if (channelId !== undefined) {
        queries.push(eq(table.channelId, String(channelId)));
      }
      if (webhookId !== undefined) {
        queries.push(eq(table.webhookId, String(webhookId)));
      }
      if (userId !== undefined) {
        queries.push(eq(table.userId, userId));
      }
      if (filterAction !== undefined) {
        queries.push(eq(table.type, filterAction));
      }

      return and(eq(table.discordGuildId, guildId), ...queries);
    },
    columns: {
      type: true,
      id: true,
      channelId: true,
      messageId: true,
      webhookId: true,
      threadId: true,
    },
    with: {
      user: {
        columns: {},
        with: {
          discordUser: {
            columns: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    limit,
    offset: page * limit,
    orderBy: (table, { desc }) => desc(table.id),
  });

  const webhookIds = entries
    .map((e) => e.webhookId)
    .filter((w, i, a) => a.indexOf(w) === i);
  const entryWebhooks =
    webhookIds.length === 0
      ? []
      : await db.query.webhooks.findMany({
          where: (table, { and, eq, inArray }) =>
            and(
              eq(table.platform, "discord"),
              inArray(webhooks.id, webhookIds),
            ),
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        });

  return respond(
    json({
      entries,
      webhooks: entryWebhooks,
      query: {
        limit,
        page,
        action: filterAction,
        webhookId: webhookId?.toString(),
        channelId: channelId?.toString(),
        userId: userId?.toString(),
      },
    }),
  );
};
