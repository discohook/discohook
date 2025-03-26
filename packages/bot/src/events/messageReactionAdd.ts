import { REST } from "@discordjs/rest";
import {
  type GatewayMessageReactionAddDispatchData,
  Routes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { getDb } from "store";
import { discordReactionRoles, makeSnowflake } from "store/src/schema";
import type { GatewayEventCallback } from "../events.js";

export interface DiscordReactionRoleData {
  roleId: string | null;
}

export const messageReactionAddCallback: GatewayEventCallback = async (
  env,
  event: GatewayMessageReactionAddDispatchData,
) => {
  if (!event.guild_id || event.member?.user?.bot) return;

  // biome-ignore lint/style/noNonNullAssertion: One is required
  const reaction = (event.emoji.id ?? event.emoji.name)!;
  const key = `discord-reaction-role-${event.message_id}-${reaction}`;
  let data = await env.KV.get<DiscordReactionRoleData>(key, "json");
  if (!data) {
    const db = getDb(env.HYPERDRIVE);
    const stored = await db.query.discordReactionRoles.findFirst({
      where: and(
        eq(discordReactionRoles.messageId, makeSnowflake(event.message_id)),
        eq(discordReactionRoles.reaction, reaction),
      ),
    });
    if (!stored) {
      await env.KV.put(key, JSON.stringify({ roleId: null }), {
        expirationTtl: 604800,
      });
      return;
    }
    data = { roleId: String(stored.roleId) };
    await env.KV.put(key, JSON.stringify(data), { expirationTtl: 604800 });
  }
  if (!data.roleId) return;

  const rest = new REST().setToken(env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.guildMemberRole(event.guild_id, event.user_id, data.roleId),
      {
        reason: `Reaction role in channel ID ${event.channel_id}`,
      },
    );
  } catch (e) {
    console.error(e);
  }
};
