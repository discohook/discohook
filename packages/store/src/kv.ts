import type { REST } from "@discordjs/rest";
import type { SetCommandOptions } from "@upstash/redis/cloudflare";
import { Redis } from "@upstash/redis/cloudflare";
import { APIGuild, GuildPremiumTier, Routes } from "discord-api-types/v10";
import { PartialKVGuild, TriggerKVGuild } from "./types/guild.js";

export class RedisKV<Key extends string = string> {
  constructor(public redis: Redis) {}

  get(key: Key, type: "text"): Promise<string | null>;
  get<ExpectedValue = unknown>(
    key: Key,
    type: "json",
  ): Promise<ExpectedValue | null>;
  get(
    key: Key,
    options?: KVNamespaceGetOptions<"text">,
  ): Promise<string | null>;
  get<ExpectedValue = unknown>(
    key: Key,
    options?: KVNamespaceGetOptions<"json">,
  ): Promise<ExpectedValue | null>;
  async get<ExpectedValue = unknown>(
    key: Key,
    options?: "text" | "json" | KVNamespaceGetOptions<"text" | "json">,
  ): Promise<ExpectedValue | string | null> {
    const value = await this.redis.get<{
      value: ExpectedValue;
      metadata: any | null;
    }>(key);
    if (value === null) {
      console.log(`[REDIS] GET ${key.slice(0, 100)} (nil)`);
      return null;
    }

    console.log(`[REDIS] GET ${key.slice(0, 100)} (present)`);
    if (
      typeof value.value === "string" &&
      (options === "json" ||
        (typeof options !== "string" && options?.type === "json"))
    ) {
      return JSON.parse(value.value);
    }
    return value.value as string;
  }

  getWithMetadata<Metadata = unknown>(
    key: Key,
    options?: Partial<KVNamespaceGetOptions<undefined>>,
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  getWithMetadata<Metadata = unknown>(
    key: Key,
    type: "text",
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
    key: Key,
    type: "json",
  ): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
  getWithMetadata<Metadata = unknown>(
    key: Key,
    options: KVNamespaceGetOptions<"text">,
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
    key: Key,
    options: KVNamespaceGetOptions<"json">,
  ): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
  async getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
    key: Key,
    options?: "text" | "json" | KVNamespaceGetOptions<"text" | "json">,
  ): Promise<
    KVNamespaceGetWithMetadataResult<ExpectedValue | string, Metadata>
  > {
    const value = await this.redis.get<{
      value: ExpectedValue;
      metadata: any | null;
    }>(key);
    if (value === null) {
      console.log(`[REDIS] GET ${key.slice(0, 100)} (nil)`);
      return { value: null, metadata: null, cacheStatus: null };
    }
    const metadata = value.metadata
      ? (JSON.parse(value.metadata) as Metadata)
      : null;

    console.log(`[REDIS] GET ${key.slice(0, 100)} (present)`);
    if (
      typeof value.value === "string" &&
      (options === "json" ||
        (typeof options !== "string" && options?.type === "json"))
    ) {
      return {
        value: JSON.parse(value.value) as ExpectedValue,
        metadata,
        cacheStatus: null,
      };
    }
    return {
      value: value.value,
      metadata,
      cacheStatus: null,
    };
  }

  async put(key: string, value: string, options?: KVNamespacePutOptions) {
    const opts: SetCommandOptions = options?.expirationTtl
      ? { ex: Math.floor(options.expirationTtl) }
      : options?.expiration
        ? { exat: Math.floor(options.expiration) }
        : {};

    console.log(`[REDIS] SET ${key.slice(0, 100)}`);
    await this.redis.set(
      key,
      JSON.stringify({ value, metadata: options?.metadata ?? null }),
      opts,
    );
  }

  async delete(key: string) {
    await this.redis.del(key);
  }

  async list<Metadata = unknown>(
    options?: KVNamespaceListOptions,
  ): Promise<KVNamespaceListResult<Metadata, Key>> {
    // We don't use this anyway
    // const results = await this.redis.keys(options?.prefix ?? "");
    return { keys: [], cacheStatus: null, list_complete: true };
  }
}

type Env = {
  SESSIONS: DurableObjectNamespace;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};

export const getKv = (env: Env): RedisKV => {
  const redis = Redis.fromEnv(env);
  return new RedisKV(redis);
};

export const getSessionManagerStub = (env: Env, sessionId: string) => {
  const id = env.SESSIONS.idFromName(sessionId);
  const stub = env.SESSIONS.get(id);
  return stub;
};

// No good way to `has()` with this unfortunately
export const getGeneric = async <T>(
  env: Env,
  key: string,
): Promise<T | null> => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", { method: "GET" });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as { data: T };
  return raw.data;
};

export const putGeneric = async <T>(
  env: Env,
  key: string,
  data: any,
  options?: { expirationTtl?: number; expiration?: number },
) => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", {
    method: "PUT",
    body: JSON.stringify({
      data,
      expires: options?.expiration
        ? new Date(options.expiration)
        : options?.expirationTtl
          ? new Date(new Date().getTime() + options.expirationTtl * 1000)
          : undefined,
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as T;
  return raw;
};

export const getchGuild = async (
  rest: REST,
  env: Env,
  guildId: string,
): Promise<PartialKVGuild> => {
  const key = `cache-guild-${guildId}`;
  const cached = await getGeneric<PartialKVGuild>(env, key);
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId))) as APIGuild;
    const reduced: PartialKVGuild = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    };
    await putGeneric(
      env,
      key,
      reduced,
      { expirationTtl: 43_200 }, // 12 hours
    );
    return reduced;
  }
  return cached;
};

export const getchTriggerGuild = async (
  rest: REST,
  env: Env,
  guildId: string,
): Promise<TriggerKVGuild> => {
  const key = `cache-triggerGuild-${guildId}`;
  const cached = await getGeneric<TriggerKVGuild>(env, key);
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId), {
      query: new URLSearchParams({ with_counts: "true" }),
    })) as APIGuild;
    const reduced: TriggerKVGuild = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner_id: guild.owner_id,
      members: guild.approximate_member_count ?? 0,
      online_members: guild.approximate_presence_count ?? 0,
      roles: guild.roles.length,
      boosts: guild.premium_subscription_count ?? 0,
      boost_level: guild.premium_tier,
      vanity_code: guild.vanity_url_code,
      // emojis: guild.emojis.length,
      emoji_limit:
        guild.premium_tier === GuildPremiumTier.Tier3
          ? 250
          : guild.premium_tier === GuildPremiumTier.Tier2
            ? 150
            : guild.premium_tier === GuildPremiumTier.Tier1
              ? 100
              : 50,
      sticker_limit:
        guild.premium_tier === GuildPremiumTier.Tier3
          ? 60
          : guild.premium_tier === GuildPremiumTier.Tier2
            ? 30
            : guild.premium_tier === GuildPremiumTier.Tier1
              ? 15
              : 5,
    };
    await putGeneric(
      env,
      key,
      reduced,
      { expirationTtl: 43_200 }, // 12 hours
    );
    return reduced;
  }
  return cached;
};
