import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getDb } from "~/store.server";
import { QueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";
import { ShortenedData } from "./share";

export interface InvalidShareIdData {
  message: string;
  expiredAt: string | undefined;
}

export const loader = async ({ params, context }: LoaderArgs) => {
  const { shareId: id } = zxParseParams(params, { shareId: z.string() });

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
      const db = getDb(context.env.HYPERDRIVE.connectionString);
      const link = await db.query.shareLinks.findFirst({
        where: (shareLinks, { and, eq, lt }) =>
          and(eq(shareLinks.shareId, id), lt(shareLinks.expiresAt, new Date())),
        columns: { expiresAt: true },
      });
      if (link) expiredAt = link.expiresAt;
    } catch {}

    throw json(
      {
        message: "No shortened data with that ID. It may have expired.",
        expiredAt: expiredAt?.toISOString(),
      } satisfies InvalidShareIdData,
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
