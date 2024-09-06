import { REST } from "@discordjs/rest";
import { GatewayGuildMemberRemoveDispatchData } from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { getDb, getchTriggerGuild } from "store";
import { discordMembers, makeSnowflake } from "store/src/schema";
import { TriggerEvent } from "store/src/types/triggers.js";
import { GatewayEventCallback } from "../events.js";
import { executeFlow } from "../flows/flows.js";
import { Trigger, getWelcomerConfigurations } from "./guildMemberAdd.js";

export const guildMemberRemoveCallback: GatewayEventCallback = async (
  env,
  payload: GatewayGuildMemberRemoveDispatchData,
) => {
  const rest = new REST().setToken(env.DISCORD_TOKEN);

  const key = `cache-triggers-${TriggerEvent.MemberRemove}-${payload.guild_id}`;
  let triggers = await env.KV.get<Trigger[]>(key, "json");
  if (triggers && triggers.length === 0) {
    return;
  }

  const db = getDb(env.HYPERDRIVE);
  // Remove member relation data. This is slightly more important than storing
  // the data initially but it's still skippable
  try {
    await db.delete(discordMembers).where(
      and(
        // biome-ignore lint/style/noNonNullAssertion: Only absent for message_create and message_update
        eq(discordMembers.userId, makeSnowflake(payload.user!.id)),
        eq(discordMembers.guildId, makeSnowflake(payload.guild_id)),
      ),
    );
  } catch {}

  const guild = await getchTriggerGuild(rest, env.KV, payload.guild_id);
  if (!triggers) {
    triggers = await getWelcomerConfigurations(db, "remove", rest, guild);
    await env.KV.put(key, JSON.stringify(triggers), { expirationTtl: 600 });
  }

  const applicable = triggers.filter((t) => !!t.flow && !t.disabled);
  for (const trigger of applicable) {
    await executeFlow(trigger.flow, rest, db, {
      user: payload.user,
      guild,
    });
  }
};
