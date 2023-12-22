import { DiscordApiClient } from "discord-api-methods";
import { Env } from "../types/env.js";
import { APIGuild, Routes } from "discord-api-types/v10";

export interface PartialKVGuild {
  id: string;
  name: string;
  icon: string | null;
}

export async function kvGet(kv: Env['KV'], key: string): Promise<string | null>;
export async function kvGet<T>(kv: Env['KV'], key: string): Promise<T | null>;
export async function kvGet<T>(kv: Env['KV'], key: string): Promise<T | string | null> {
  const cached: string | null = await kv.get(key);
  if (cached === null) return null;

  try {
    return JSON.parse(cached) as T;
  } catch {
    return cached;
  }
}

export const getchGuild = async (client: DiscordApiClient, kv: Env['KV'], guildId: string): Promise<PartialKVGuild> => {
  const cached = await kvGet<PartialKVGuild>(kv, `cache-guild-${guildId}`);
  if (!cached) {
    const guild = await client.get(Routes.guild(guildId)) as APIGuild;
    const reduced: PartialKVGuild = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    };
    await kv.put(
      `cache-guild-${guildId}`,
      JSON.stringify(reduced),
      { expirationTtl: 10800 }, // 3 hours
    );
    return reduced;
  }
  return cached;
}
