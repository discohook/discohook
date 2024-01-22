import type { REST } from "@discordjs/rest";
import { APIGuild, Routes } from "discord-api-types/v10";
import { PartialKVGuild } from "./types/guild";

export const getchGuild = async (
  rest: REST,
  kv: KVNamespace,
  guildId: string,
): Promise<PartialKVGuild> => {
  const cached = await kv.get<PartialKVGuild>(`cache-guild-${guildId}`);
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId))) as APIGuild;
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
};
