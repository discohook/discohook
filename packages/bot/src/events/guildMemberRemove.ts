import { REST } from "@discordjs/rest";
import {
  GatewayGuildMemberRemoveDispatchData,
  RESTJSONErrorCodes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import {
  TriggerEvent,
  type TriggerKVGuild,
  discordMembers,
  getDb,
  getchTriggerGuild,
  makeSnowflake,
} from "store";
import { GatewayEventCallback } from "../events.js";
import { FlowResult, executeFlow } from "../flows/flows.js";
import { isDiscordError } from "../util/error.js";
import { Trigger, getWelcomerConfigurations } from "./guildMemberAdd.js";

export const guildMemberRemoveCallback: GatewayEventCallback = async (
  env,
  payload: GatewayGuildMemberRemoveDispatchData,
) => {
  if (payload.user.id === env.DISCORD_APPLICATION_ID) return [];

  const rest = new REST().setToken(env.DISCORD_TOKEN);

  const key = `cache:triggers-${TriggerEvent.MemberRemove}-${payload.guild_id}`;
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

  let guild: TriggerKVGuild;
  try {
    guild = await getchTriggerGuild(rest, env, payload.guild_id);
  } catch (e) {
    if (isDiscordError(e)) {
      return [
        {
          status: "failure",
          discordError: e.rawError,
          message:
            e.code === RESTJSONErrorCodes.UnknownGuild
              ? "Discohook cannot access the server"
              : e.rawError.message,
        } satisfies FlowResult,
      ];
    }
    throw e;
  }
  if (!triggers) {
    triggers = await getWelcomerConfigurations(db, "remove", rest, guild);
    await env.KV.put(key, JSON.stringify(triggers), { expirationTtl: 600 });
  }

  const applicable = triggers.filter((t) => !!t.flow && !t.disabled);
  const results: FlowResult[] = [];
  for (const trigger of applicable) {
    results.push(
      await executeFlow(env, trigger.flow, rest, db, {
        user: payload.user,
        guild,
      }),
    );
  }
  return results;
};
