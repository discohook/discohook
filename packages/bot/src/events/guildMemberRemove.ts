import { REST } from "@discordjs/rest";
import { GatewayGuildMemberRemoveDispatchData } from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { getDb, getchTriggerGuild } from "store";
import { discordMembers, makeSnowflake } from "store/src/schema";
import { GatewayEventCallback } from "../events.js";
import { executeFlow } from "../flows/flows.js";
import { getWelcomerConfigurations } from "./guildMemberAdd.js";

export const guildMemberRemoveCallback: GatewayEventCallback = async (
  env,
  payload: GatewayGuildMemberRemoveDispatchData,
) => {
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  const db = getDb(env.DATABASE_URL);

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
  const triggers = await getWelcomerConfigurations(db, "remove", rest, guild);
  const applicable = triggers.filter(
    (t) =>
      !!t.flow && !t.disabled && (payload.user?.bot ? !t.ignoreBots : true),
  );

  for (const trigger of applicable) {
    // biome-ignore lint/style/noNonNullAssertion: Filtered above
    await executeFlow(trigger.flow!, rest, db, {
      user: payload.user,
      guild,
    });
  }
};
