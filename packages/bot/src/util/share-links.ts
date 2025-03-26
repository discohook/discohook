import type { QueryData } from "store/src/types";
import type { Env } from "../types/env.js";

export const putShareLink = async (
  env: Env,
  shareId: string,
  data: QueryData,
  expiresAt: Date,
  origin?: string,
): Promise<void> => {
  const redis = env.KV;
  const key = `share-${shareId}`;
  await redis.put(key, JSON.stringify({ data, origin }), {
    expiration: Math.floor(expiresAt.getTime() / 1000),
    metadata: { expiresAt: expiresAt.getTime() },
  });
};

export const getShareLinkExists = async (
  env: Env,
  shareId: string,
): Promise<boolean> => {
  const redis = env.KV;
  const key = `share-${shareId}`;
  const exists = await redis.send("EXISTS", key);
  return exists === 1;
};

export const getShareLink = async (
  env: Env,
  shareId: string,
): Promise<{
  /** data to load */
  data: QueryData;
  /** ms */
  alarm?: number;
  /** external verified origin */
  origin?: string;
}> => {
  const redis = env.KV;
  const key = `share-${shareId}`;
  const data = await redis.getWithMetadata<
    { data: QueryData; origin?: string },
    { expiresAt: number }
  >(key, "json");
  if (data?.value !== null)
    return {
      ...data.value,
      alarm: data.metadata?.expiresAt,
    };

  throw Error("Could not find a share link with that ID");
};
