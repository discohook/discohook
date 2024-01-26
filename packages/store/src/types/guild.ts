import { APIGuild, GuildPremiumTier } from "discord-api-types/v10";

export type PartialKVGuild = Pick<APIGuild, "id" | "name" | "icon">;

export type TriggerKVGuild = PartialKVGuild & {
  owner_id: string;
  members: number;
  online_members: number;
  roles: number;
  boosts: number;
  boost_level: GuildPremiumTier;
  vanity_code: string | null;
};
