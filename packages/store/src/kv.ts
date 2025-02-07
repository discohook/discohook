import type { REST } from "@discordjs/rest";
import { APIGuild, GuildPremiumTier, Routes } from "discord-api-types/v10";
import { RedisKV } from "./redis.js";
import { PartialKVGuild, TriggerKVGuild } from "./types/guild.js";

export type Env = {
  ENVIRONMENT: "dev" | "preview" | "production";
  SESSIONS: DurableObjectNamespace;
  REDIS_URL: string;
  KV: RedisKV;
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
  const cached = await env.KV.get<PartialKVGuild>(key, "json");
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId))) as APIGuild;
    const reduced: PartialKVGuild = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    };
    await env.KV.put(
      key,
      JSON.stringify(reduced),
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
  const cached = await env.KV.get<TriggerKVGuild>(key, "json");
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
    await env.KV.put(
      key,
      JSON.stringify(reduced),
      { expirationTtl: 43_200 }, // 12 hours
    );
    return reduced;
  }
  return cached;
};
