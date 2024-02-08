import { z } from "zod";
import { zx } from "zodix";
import { getUser } from "~/session.server";
import { getDb, shareLinks } from "~/store.server";
import { ZodQueryData } from "~/types/QueryData";
import { ActionArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { jsonAsString } from "~/util/zod";

const ALLOWED_EXTERNAL_ORIGINS = ["https://discohook.org"] as const;

export interface ShortenedData {
  data: string;
  origin?: string;
  userId?: number;
}

export const generateUniqueShortenKey = async (
  kv: KVNamespace,
  defaultLength: number,
  tries = 10,
): Promise<{ id: string; key: string }> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of Array(tries)) {
    const id = randomString(defaultLength);
    const key = `boogiehook-shorten-${id}`;
    if (!(await kv.get(key))) {
      return { id, key };
    }
  }
  return await generateUniqueShortenKey(kv, defaultLength + 1);
};

export const action = async ({ request, context }: ActionArgs) => {
  const {
    data,
    ttl: ttl_,
    origin: origin_,
  } = await zx.parseForm(request, {
    data: jsonAsString(ZodQueryData),
    // Max 4 weeks, min 5 minutes
    ttl: z.optional(
      zx.IntAsString.refine((val) => val >= 300000 && val <= 2419200000),
    ),
    origin: z.optional(z.enum(ALLOWED_EXTERNAL_ORIGINS)),
  });

  const user = await getUser(request, context);

  const ttl = ttl_ ?? 604800000;
  const expires = new Date(new Date().getTime() + ttl);

  const origin = origin_ ?? new URL(request.url).origin;

  // biome-ignore lint/performance/noDelete: We don't want to store this property at all
  delete data.backup_id;
  const shortened: ShortenedData = {
    data: JSON.stringify(data),
    origin,
    userId: user?.id,
  };

  const db = getDb(context.env.DATABASE_URL);
  const kv = context.env.KV;
  const { id, key } = await generateUniqueShortenKey(kv, 8);
  await kv.put(key, JSON.stringify(shortened), { expirationTtl: ttl / 1000 });
  if (user) {
    await db.insert(shareLinks).values({
      userId: user.id,
      shareId: id,
      expiresAt: expires,
      origin: origin_,
    });
  }

  return {
    id,
    origin,
    url: `${new URL(request.url).origin}/?share=${id}`,
    expires,
    userId: user?.id,
  };
};
