import { GatewayDispatchEvents } from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { discordReactionRoles, makeSnowflake } from "store";
import { createHandler } from "./handler";
import type { DiscordReactionRoleData } from "./messageReactionAdd";

export default createHandler(
  GatewayDispatchEvents.MessageReactionRemove,
  async ({ data, client }) => {
    if (!data.guild_id) return;

    // biome-ignore lint/style/noNonNullAssertion: One is required
    const reaction = (data.emoji.id ?? data.emoji.name)!;
    const key = `discord-reaction-role-${data.message_id}-${reaction}`;
    let rrData = await client.KV.get<DiscordReactionRoleData>(key, "json");
    if (!rrData) {
      const db = client.getDb();
      const stored = await db.query.discordReactionRoles.findFirst({
        where: and(
          eq(discordReactionRoles.messageId, makeSnowflake(data.message_id)),
          eq(discordReactionRoles.reaction, reaction),
        ),
      });
      if (!stored) {
        await client.KV.put(key, JSON.stringify({ roleId: null }), {
          expirationTtl: 604800,
        });
        return;
      }
      rrData = { roleId: String(stored.roleId) };
      await client.KV.put(key, JSON.stringify(rrData), {
        expirationTtl: 604800,
      });
    }
    if (!rrData.roleId) return;

    try {
      await client.api.guilds.removeRoleFromMember(
        data.guild_id,
        data.user_id,
        rrData.roleId,
        { reason: `Reaction role in channel ID ${data.channel_id}` },
      );
    } catch (e) {
      console.error(e);
    }
  },
);
