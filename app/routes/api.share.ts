import { ActionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { redis } from "~/redis.server";
import { ZodQueryData } from "~/types/QueryData";
import { randomString } from "~/util/text";

const ALLOWED_EXTERNAL_ORIGINS = ["https://discohook.org"] as const;

export interface ShortenedData {
  id: string;
  data: string;
  origin?: string;
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

export const action = async ({ request }: ActionArgs) => {
  const {
    data: data_,
    ttl: ttl_,
    origin: origin_,
  } = await zx.parseForm(request, {
    data: z
      .string()
      .refine((val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      })
      .transform((val) => JSON.parse(val)),
    // Max 4 weeks, min 5 minutes
    ttl: z.optional(
      zx.IntAsString.refine(
        (val) => val >= 300000 && val <= 2419200000
      )
    ),
    origin: z.optional(z.enum(ALLOWED_EXTERNAL_ORIGINS)),
  });
  let data;
  try {
    data = ZodQueryData.parse(data_);
  } catch {
    throw json({ message: "Invalid payload" }, 400);
  }

  const ttl = ttl_ ?? 604800000;
  const expires = new Date(new Date().getTime() + ttl);

  const origin = origin_ ?? new URL(request.url).origin;

  const { id, key } = await generateUniqueShortenKey(8);
  const shortened: ShortenedData = {
    id,
    data: JSON.stringify(data),
    origin,
  };
  await redis.set(key, JSON.stringify(shortened), {
    EX: ttl / 1000,
  });

  return {
    id,
    origin,
    url: `${new URL(request.url).origin}/go/${id}`,
    expires,
  };
};
