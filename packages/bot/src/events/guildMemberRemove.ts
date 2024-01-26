import { REST } from "@discordjs/rest";
import { GatewayGuildMemberRemoveDispatchData } from "discord-api-types/v10";
import { getDb, getchTriggerGuild } from "store";
import { GatewayEventCallback } from "../events.js";
import { executeFlow } from "../flows/flows.js";
import { getWelcomerConfigurations } from "./guildMemberAdd.js";

export const guildMemberRemoveCallback: GatewayEventCallback = async (
  env,
  payload: GatewayGuildMemberRemoveDispatchData,
) => {
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  const db = getDb(env.DATABASE_URL);
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
