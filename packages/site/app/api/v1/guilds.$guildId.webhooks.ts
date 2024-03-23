import { json } from "@remix-run/cloudflare";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { and, desc, eq } from "drizzle-orm";
import { getDb, webhooks } from "store";
import { z } from "zod";
import { zx } from "zodix";
import { verifyAuthToken } from "~/routes/s.$guildId";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: z.string().refine((v) => !Number.isNaN(Number(v))),
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
  const guildWebhooks = await db.query.webhooks.findMany({
    where: and(
      eq(webhooks.discordGuildId, BigInt(guildId)),
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
  return guildWebhooks;
};
