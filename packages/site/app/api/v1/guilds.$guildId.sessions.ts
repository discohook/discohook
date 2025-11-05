import type { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type RESTGetAPIGuildChannelsResult,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { zx } from "zodix";
import {
  authorizeRequest,
  getTokenGuildPermissions,
  type KVTokenPermissions,
  type RespondFunction,
} from "~/session.server";
import { isDiscordError } from "~/util/discord";
import { getId } from "~/util/id";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import { createREST } from "~/util/rest";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

const GUILD_TOKEN_TTL = 21_600_000; // ms

export const channelIsInGuild = async (
  rest: REST,
  guildId: string | bigint,
  channelId: string | bigint,
  respond: RespondFunction = (r) => r,
): Promise<void> => {
  if (channelId !== undefined) {
    try {
      const channels = (await rest.get(
        Routes.guildChannels(String(guildId)),
      )) as RESTGetAPIGuildChannelsResult;
      const channel = channels.find((c) => c.id === channelId);
      if (!channel) {
        throw respond(
          json(
            {
              message:
                "Unknown channel or Discohook is missing access to the server",
            },
            404,
          ),
        );
      }
    } catch (e) {
      if (e instanceof Response) throw e;
      if (
        isDiscordError(e) &&
        (e.code === RESTJSONErrorCodes.UnknownGuild ||
          e.code === RESTJSONErrorCodes.MissingAccess)
      ) {
        throw respond(
          json(
            {
              message:
                "Unknown channel or Discohook is missing access to the server",
            },
            404,
          ),
        );
      }
      throw e;
    }
  }
};

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const perPage = 50;
  const { cursor, channelId } = zxParseQuery(request, {
    cursor: zx.IntAsString.refine((v) => v > 0)
      .default("1")
      .transform((v) => v - 1),
    channelId: snowflakeAsString().transform(String).optional(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.Administrator)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }
  // Verify that the channel is part of this guild
  if (channelId !== undefined) {
    const rest = createREST(context.env);
    await channelIsInGuild(rest, guildId, channelId, respond);
  }

  /*
   * I don't love this but I think it's the best we can do right now.
   * I would use SSCAN but this of course requires the keys to be in a set
   * whose members cannot be made to expire automatically.
   * Perhaps: https://github.com/Rush/redis_expiremember_module
   */
  const keys = new Set<string>();
  let found = 0;
  let currentCursor = cursor;
  while (found < perPage) {
    const result = (await context.env.KV.send(
      "SCAN",
      String(currentCursor),
      "MATCH",
      channelId !== undefined
        ? `token-*-channel-${channelId}`
        : `token-*-guild-${guildId}`,
      "COUNT",
      "1000",
    )) as [string, string[]];
    // No results
    if (!result[1] || result[1].length === 0) {
      break;
    }

    currentCursor = Number(result[0]);
    for (const key of result[1]) {
      const tokenId = key.split("-")[1];
      if (!tokenId) continue; // shouldn't happen

      keys.add(key);
    }
    found += result[1].length;

    // End of iteration
    if (result[0] === "0" || result[0] === String(currentCursor)) {
      currentCursor = 0;
      break;
    }
  }

  if (keys.size === 0) {
    return respond(
      json({
        cursor: currentCursor,
        channelId: channelId ?? null,
        results: [],
      }),
    );
  }

  const keysArray = Array.from(keys.values());
  const rawValues = (await context.env.KV.send("MGET", ...keys)) as (
    | string
    | null
  )[];
  // @ts-expect-error error condition
  if (rawValues[0] === false) {
    console.error(rawValues[1]);
    throw respond(json({ message: "Failed to resolve values" }, 500));
  }

  const values: {
    tokenId: string;
    createdAt: number;
    expiresAt: number;
    permissions: string;
    owner?: boolean;
    me?: boolean;
  }[] = [];

  const now = Date.now();
  const deleteKeys = new Set<string>();
  let i = -1;
  for (const val of rawValues) {
    i += 1;
    if (val === null) continue;
    const key = keysArray[i];
    const tokenId = key.split("-")[1];
    if (!tokenId) continue; // shouldn't happen

    const { timestamp } = getId({ id: tokenId });
    try {
      const value = JSON.parse(JSON.parse(val).value) as KVTokenPermissions;
      // Declutter
      if (value.permissions === "0" || !value.permissions) continue;

      // Past due
      if (now > (value.expiresAt ?? timestamp + GUILD_TOKEN_TTL)) {
        deleteKeys.add(key);
      } else {
        values.push({
          tokenId,
          createdAt: timestamp,
          expiresAt: value.expiresAt ?? timestamp + GUILD_TOKEN_TTL,
          permissions: value.permissions,
          owner: value.owner || undefined,
          me: tokenId === String(token.id) || undefined,
        });
      }
    } catch {}
  }

  // This might mess up the cursor, hopefully it's not a big issue. If it is,
  // I think the solution would be to delete right after encountering the keys,
  // then re-run the query with the same cursor.
  if (deleteKeys.size !== 0) {
    await context.env.KV.delete(...deleteKeys);
  }

  return respond(
    json({
      cursor: currentCursor,
      channelId: channelId ?? null,
      results: values,
    }),
  );
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const { id: tokenIds, channelId } = zxParseQuery(request, {
    id: snowflakeAsString()
      .array()
      .max(200)
      .or(snowflakeAsString().transform((v) => [v])),
    channelId: snowflakeAsString().transform(String).optional(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.Administrator)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }
  if (channelId !== undefined) {
    const rest = createREST(context.env);
    await channelIsInGuild(rest, guildId, channelId, respond);
  }

  switch (request.method) {
    case "DELETE": {
      await context.env.KV.delete(
        ...tokenIds.map((id) => `token-${id}-guild-${guildId}`),
      );
      return new Response(null, { status: 204 });
    }
    default:
      throw new Response(null, { status: 405 });
  }
};
