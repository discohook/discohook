import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { getDb } from "store";
import { zx } from "zodix";
import {
  authorizeRequest,
  getTokenGuildPermissions,
  type KVTokenPermissions,
} from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const { limit } = zxParseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    // page: zx.IntAsString.refine((v) => v >= 0).default("0"),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (
    !owner &&
    !permissions.has(PermissionFlags.ViewAuditLog, PermissionFlags.ManageGuild)
  ) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const db = getDb(context.env.HYPERDRIVE);
  const guildWithTokens = await db.query.discordGuilds.findFirst({
    where: (discordGuilds, { eq }) => eq(discordGuilds.id, guildId),
    columns: {},
    with: {
      tokens: {
        columns: {
          id: true,
          country: true,
          lastUsedAt: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        limit,
        orderBy: (tokens, { desc }) => desc(tokens.lastUsedAt),
      },
    },
  });

  if (!guildWithTokens) {
    return respond(json([]));
  }

  const tokenPermissions: Record<string, KVTokenPermissions> = {};
  for (const token of guildWithTokens.tokens) {
    const key = `token-${token.id}-guild-${guildId}`;
    const cached = await context.env.KV.get<KVTokenPermissions>(key, "json");
    if (cached) {
      tokenPermissions[token.id.toString()] = cached;
    }
  }

  return respond(
    json(
      guildWithTokens.tokens.map((guildToken) => ({
        ...guildToken,
        id: guildToken.id.toString() as `${bigint}`,
        // We'll see later if this is necessary for other users
        country:
          guildToken.user?.id === token.user.id ? guildToken.country : null,
        auth: tokenPermissions[guildToken.id.toString()] as
          | KVTokenPermissions
          | undefined,
      })),
    ),
  );
};
