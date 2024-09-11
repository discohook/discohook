import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getBucket } from "~/durable/rate-limits";
import { getUserId } from "~/session.server";
import { getDb, shareLinks } from "~/store.server";
import { ZodQueryData } from "~/types/QueryData";
import { ActionArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { zxParseJson } from "~/util/zod";

const ALLOWED_EXTERNAL_ORIGINS = ["https://discohook.org"] as const;

export interface ShortenedData {
  data: string;
  origin?: string;
  userId?: string;
}

export const generateUniqueShortenKey = async (
  kv: KVNamespace,
  length: number,
  tries = 10,
): Promise<{ id: string; key: string }> => {
  for (const _ of Array(tries)) {
    const id = randomString(length);
    const key = `share-${id}`;
    if (!(await kv.get(key))) {
      return { id, key };
    }
  }
  return await generateUniqueShortenKey(kv, length + 1);
};

export const action = async ({ request, context }: ActionArgs) => {
  const contentLength = Number(request.headers.get("Content-Length"));
  if (!contentLength || Number.isNaN(contentLength)) {
    throw json({ message: "Must provide Content-Length header." }, 400);
  }
  if (contentLength > 25690112) {
    // Just under 24.5 MiB. KV limit for values is 25 MiB
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
  const shortened: ShortenedData = {
    data: JSON.stringify(data),
    origin,
    userId: userId?.toString(),
  };

  const db = getDb(context.env.HYPERDRIVE);
  const kv = context.env.KV;
  const { id, key } = await generateUniqueShortenKey(kv, 8);
  await kv.put(key, JSON.stringify(shortened), {
    expirationTtl: ttl,
    // KV doesn't seem to provide a way to read `expirationTtl`
    metadata: {
      expiresAt: new Date(new Date().valueOf() + ttl * 1000).toISOString(),
    },
  });
  if (userId) {
    await db.insert(shareLinks).values({
      userId,
      shareId: id,
      expiresAt: expires,
      origin: origin_,
    });
  }

  return json(
    {
      id,
      origin,
      url: `${new URL(request.url).origin}/?share=${id}`,
      expires,
      userId: userId ?? undefined,
    },
    { headers },
  );
};
