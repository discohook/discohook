import { GatewayDispatchEvents, RESTJSONErrorCodes } from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import {
  discordMembers,
  makeSnowflake,
  TriggerEvent,
  type TriggerKVGuild
} from "store";
import { executeFlow, type FlowResult } from "../flows/flows.js";
import { isDiscordError } from "../util/error.js";
import { getWelcomerConfigurations, type Trigger } from "./guildMemberAdd.js";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.GuildMemberRemove,
  async ({ data, client }) => {
    if (data.user.id === Bun.env.DISCORD_APPLICATION_ID) return [];

    const key = `cache:triggers-${TriggerEvent.MemberRemove}-${data.guild_id}`;
    let triggers = await client.KV.get<Trigger[]>(key, "json");
    if (triggers && triggers.length === 0) {
      return;
    }

    const db = client.getDb();
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
      guild = await client.getchTriggerGuild(data.guild_id);
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
      triggers = await getWelcomerConfigurations(client, "remove", guild);
      await client.KV.put(key, JSON.stringify(triggers), {
        expirationTtl: 600,
      });
    }

    const applicable = triggers.filter((t) => !!t.flow && !t.disabled);
    const results: FlowResult[] = [];
    for (const trigger of applicable) {
      results.push(
        await executeFlow({
          env,
          flow: trigger.flow,
          rest,
          db,
          liveVars: { user: payload.user, guild },
          deferred,
        }),
      );
    }
    return results;
  },
);
