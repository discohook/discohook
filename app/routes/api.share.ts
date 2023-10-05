import { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { redis } from "~/redis.server";
import { getUser } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { randomString } from "~/util/text";
import { jsonAsString } from "~/util/zod";

const ALLOWED_EXTERNAL_ORIGINS = ["https://discohook.org"] as const;

export interface ShortenedData {
  data: string;
  origin?: string;
  userId?: number;
}

export const generateUniqueShortenKey = async (
  defaultLength: number,
  tries = 10
): Promise<{ id: string; key: string }> => {
  for (const _ of Array(tries)) {
    const id = randomString(defaultLength);
    const key = `boogiehook-shorten-${id}`;
    if (!(await redis.exists(key))) {
      return { id, key };
    }
  }
  return await generateUniqueShortenKey(defaultLength + 1);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    data,
    ttl: ttl_,
    origin: origin_,
  } = await zx.parseForm(request, {
    data: jsonAsString(ZodQueryData),
    // Max 4 weeks, min 5 minutes
    ttl: z.optional(
      zx.IntAsString.refine((val) => val >= 300000 && val <= 2419200000)
    ),
    origin: z.optional(z.enum(ALLOWED_EXTERNAL_ORIGINS)),
  });

  const user = await getUser(request);

  const ttl = ttl_ ?? 604800000;
  const expires = new Date(new Date().getTime() + ttl);

  const origin = origin_ ?? new URL(request.url).origin;

  delete data.backup_id;
  const shortened: ShortenedData = {
    data: JSON.stringify(data),
    origin,
    userId: user?.id,
  };

  const { id, key } = await generateUniqueShortenKey(8);
  await redis.set(key, JSON.stringify(shortened), {
    EX: ttl / 1000,
  });
  if (user) {
    await prisma.shareLink.create({
      data: {
        userId: user.id,
        shareId: id,
        expiresAt: expires,
        origin: origin_,
      },
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
