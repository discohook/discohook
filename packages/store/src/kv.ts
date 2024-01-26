import type { REST } from "@discordjs/rest";
import { APIGuild, GuildPremiumTier, Routes } from "discord-api-types/v10";
import { PartialKVGuild, TriggerKVGuild } from "./types/guild.js";

export const getchGuild = async (
  rest: REST,
  kv: KVNamespace,
  guildId: string,
): Promise<PartialKVGuild> => {
  const cached = await kv.get<PartialKVGuild>(`cache-guild-${guildId}`, "json");
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

export const getchTriggerGuild = async (
  rest: REST,
  kv: KVNamespace,
  guildId: string,
): Promise<TriggerKVGuild> => {
  const cached = await kv.get<TriggerKVGuild>(
    `cache-triggerGuild-${guildId}`,
    "json",
  );
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId))) as APIGuild;
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
    await kv.put(
      `cache-triggerGuild-${guildId}`,
      JSON.stringify(reduced),
      { expirationTtl: 10800 }, // 3 hours
    );
    return reduced;
  }
  return cached;
};
