import { json } from "@remix-run/cloudflare";
import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { getDb, shareLinks } from "~/store.server";
import { QueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { ShortenedData } from "./share";

export const loader = async ({ params, context }: LoaderArgs) => {
  const { shareId: id } = zx.parseParams(params, { shareId: z.string() });

  const key = `share-${id}`;
  const { value: shortened, metadata } =
    await context.env.KV.getWithMetadata<ShortenedData>(key, {
      type: "json",
      // 15 minutes
      cacheTtl: 900,
    });
  if (!shortened) {
    let expiredAt: Date | undefined;
    try {
      const db = getDb(context.env.DATABASE_URL);
      const link = await db.query.shareLinks.findFirst({
        where: and(
          eq(shareLinks.shareId, id),
          lt(shareLinks.expiresAt, new Date()),
        ),
        columns: { expiresAt: true },
      });
      if (link) expiredAt = link.expiresAt;
    } catch {}

    throw json(
      {
        message: "No shortened data with that ID. It may have expired.",
        expiredAt,
      },
      404,
    );
  }

  const { expiresAt } = metadata as { expiresAt?: string };
  return {
    data: JSON.parse(shortened.data) as QueryData,
    origin: shortened.origin,
    expires: expiresAt ? new Date(expiresAt) : new Date(),
  };
};
