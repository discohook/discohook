import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import type { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const action = async ({ request, context, params }: ActionArgs) => {
  const { guildId, tokenId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    tokenId: snowflakeAsString(),
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
      await context.env.KV.delete(`token-${tokenId}-guild-${guildId}`);
      return new Response(null, { status: 204 });
    }
    default:
      throw new Response(null, { status: 405 });
  }
};
