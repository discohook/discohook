import { serverOnly$ } from "vite-env-only/macros";
import { getRedis } from "~/store.server";
import type { QueryData } from "~/types/QueryData";

// biome-ignore lint/style/noNonNullAssertion:
export const putShareLink = serverOnly$(
  async (
    env: Env,
    shareId: string,
    data: QueryData,
    expiresAt: Date,
    origin?: string,
  ): Promise<void> => {
    const redis = env.KV ?? getRedis(env);
    const key = `share-${shareId}`;
    await redis.put(key, JSON.stringify({ data, origin }), {
      expiration: Math.floor(expiresAt.getTime() / 1000),
      metadata: { expiresAt: expiresAt.getTime() },
    });
  },
)!;

// biome-ignore lint/style/noNonNullAssertion:
export const getShareLinkExists = serverOnly$(
  async (env: Env, shareId: string): Promise<boolean> => {
    const redis = env.KV ?? getRedis(env);
    const key = `share-${shareId}`;
    const exists = await redis.send("EXISTS", key);
    if (exists === 1) return true;

    // deprecated fallback behavior
    const id = env.SHARE_LINKS.idFromName(shareId);
    const stub = env.SHARE_LINKS.get(id);
    const response = await stub.fetch("http://do/", { method: "HEAD" });
    return response.ok;
  },
)!;

// biome-ignore lint/style/noNonNullAssertion:
export const getShareLink = serverOnly$(
  async (
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
    const redis = env.KV ?? getRedis(env);
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

    // deprecated fallback behavior
    const id = env.SHARE_LINKS.idFromName(shareId);
    const stub = env.SHARE_LINKS.get(id);
    const response = await stub.fetch(`http://do/?shareId=${shareId}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw response;
    }
    const raw = (await response.json()) as {
      data: QueryData;
      alarm: number;
      origin?: string;
    };
    return raw;
  },
)!;

// biome-ignore lint/style/noNonNullAssertion:
export const deleteShareLink = serverOnly$(
  async (env: Env, shareId: string): Promise<void> => {
    const redis = env.KV ?? getRedis(env);
    await redis.delete(`share-${shareId}`);

    const id = env.SHARE_LINKS.idFromName(shareId);
    const stub = env.SHARE_LINKS.get(id);
    const response = await stub.fetch(`http://do/?shareId=${shareId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw response;
    }
  },
)!;
