import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getBucket } from "~/durable/rate-limits";
import { getShareLinkExists, putShareLink } from "~/durable/share-links";
import { getUserId } from "~/session.server";
import { getDb, shareLinks } from "~/store.server";
import { ZodQueryData } from "~/types/QueryData";
import type { Env } from "~/types/env";
import type { ActionArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { zxParseJson } from "~/util/zod";

const ALLOWED_EXTERNAL_ORIGINS = ["https://discohook.org"] as const;

export interface ShortenedData {
  data: string;
  origin?: string;
  userId?: string;
}

export const generateUniqueShortenKey = async (
  env: Env,
  length: number,
  tries = 10,
): Promise<string> => {
  for (const _ of Array(tries)) {
    const shareId = randomString(length);
    const exists = await getShareLinkExists(env, shareId);
    if (!exists) {
      return shareId;
    }
  }
  return await generateUniqueShortenKey(env, length + 1, tries);
};

export const action = async ({ request, context }: ActionArgs) => {
  const contentLength = Number(request.headers.get("Content-Length"));
  if (!contentLength || Number.isNaN(contentLength)) {
    throw json({ message: "Must provide Content-Length header." }, 400);
  }
  if (contentLength > 25690112) {
    // Just under 24.5 MiB. This is what it is because the KV limit for values
    // was 25 MiB, but we no longer use KV. In theory we could make this larger
    // but there is little reason to.
    throw json({ message: "Data is too large (max. ~24 MiB)." });
  }

  const {
    data,
    ttl,
    origin: origin_,
  } = await zxParseJson(request, {
    data: ZodQueryData,
    ttl: z
      .number()
      .int()
      .default(604800)
      // (in seconds) max 4 weeks, min 5 minutes
      .refine((val) => val >= 300 && val <= 2419200),
    origin: z.enum(ALLOWED_EXTERNAL_ORIGINS).optional(),
  });

  const headers = await getBucket(request, context, "share");
  const userId = await getUserId(request, context);
  const expires = new Date(new Date().getTime() + ttl * 1000);
  const origin = origin_ ?? new URL(request.url).origin;
  // biome-ignore lint/performance/noDelete: We don't want to store this property at all
  delete data.backup_id;

  const shareId = await generateUniqueShortenKey(context.env, 8);
  await putShareLink(context.env, shareId, data, expires, origin_);

  const db = getDb(context.env.HYPERDRIVE);
  if (userId) {
    await db.insert(shareLinks).values({
      userId,
      shareId,
      expiresAt: expires,
      origin: origin_,
    });
  }

  return json(
    {
      id: shareId,
      origin,
      url: `${new URL(request.url).origin}/?share=${shareId}`,
      expires,
      userId: userId ?? undefined,
    },
    { headers },
  );
};
