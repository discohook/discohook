import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { zx } from "zodix";
import {
  authorizeRequest,
  getTokenGuildPermissions,
  type KVTokenPermissions,
} from "~/session.server";
import { getId } from "~/util/id";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

const GUILD_TOKEN_TTL = 21_600_000; // ms

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const perPage = 50;
  const { cursor } = zxParseQuery(request, {
    cursor: zx.IntAsString.refine((v) => v > 0)
      .default("1")
      .transform((v) => v - 1),
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

  /*
   * I really don't like this but I think it's the best we can do right now.
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
      `token-*-guild-${guildId}`,
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

  const keysArray = Array.from(keys.values());
  const rawValues = (await context.env.KV.send("MGET", ...keys)) as (
    | string
    | null
  )[];
  // @ts-expect-error error condition
  if (rawValues[0] === false) {
    console.error(rawValues[1]);
    throw json({ message: "Failed to resolve values" }, 500);
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

  return {
    cursor: currentCursor,
    results: values,
  };
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const { id: tokenIds } = zxParseQuery(request, {
    id: snowflakeAsString()
      .array()
      .max(200)
      .or(snowflakeAsString().transform((v) => [v])),
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
