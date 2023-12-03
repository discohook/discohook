import { DiscordApiClient } from "discord-api-methods";
import { Env } from "../types/env.js";
import { APIGuild, Routes } from "discord-api-types/v10";

export interface PartialKVGuild {
  id: string;
  name: string;
  icon: string | null;
}

export const getchGuild = async (client: DiscordApiClient, kv: Env['KV'], guildId: string): Promise<PartialKVGuild> => {
  const cached: string | null = await kv.get(`cache-guild-${guildId}`);
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
  return JSON.parse(cached) as PartialKVGuild;
}
