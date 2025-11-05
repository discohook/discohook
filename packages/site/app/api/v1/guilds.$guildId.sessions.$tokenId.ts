import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import type { ActionArgs } from "~/util/loader";
import { createREST } from "~/util/rest";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";
import { channelIsInGuild } from "./guilds.$guildId.sessions";

export const action = async ({ request, context, params }: ActionArgs) => {
  const { guildId, tokenId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    tokenId: snowflakeAsString(),
  });
  const { channelId } = zxParseQuery(request, {
    channelId: snowflakeAsString().optional(),
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
      await context.env.KV.delete(`token-${tokenId}-guild-${guildId}`);
      return new Response(null, { status: 204 });
    }
    default:
      throw new Response(null, { status: 405 });
  }
};
