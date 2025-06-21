import type {
  APIUnavailableGuild,
  GatewayGuildDeleteDispatchData,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { discordGuilds, getDb, makeSnowflake } from "store";
import type { GatewayEventCallback } from "../events.js";

export const guildDeleteCallback: GatewayEventCallback = async (
  env,
  guild: GatewayGuildDeleteDispatchData,
) => {
  // > If the unavailable field is not set, the user was removed from the guild.
  // https://discord.dev/topics/gateway-events#guild-delete
  // We only care about this event if the bot has been removed.
  if ("unavailable" in guild) return;

  const db = getDb(env.HYPERDRIVE);
  await db
    .delete(discordGuilds)
    .where(
      eq(discordGuilds.id, makeSnowflake((guild as APIUnavailableGuild).id)),
    );
};
