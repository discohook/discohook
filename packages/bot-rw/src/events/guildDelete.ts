import { GatewayDispatchEvents } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { discordGuilds, makeSnowflake } from "store";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.GuildDelete,
  async ({ client, data }) => {
    // > If the unavailable field is not set, the user was removed from the guild.
    // https://discord.dev/topics/gateway-events#guild-delete
    // We only care about this event if the bot has been removed.
    if (data.unavailable !== undefined) return;

    const db = client.getDb();
    await db
      .delete(discordGuilds)
      .where(eq(discordGuilds.id, makeSnowflake(data.id)));

    // No reason to keep these in memory
    await client.KV.delete(`cache-triggerGuild-${data.id}`);
    await client.KV.delete(`cache-guild-${data.id}`);
  },
);
