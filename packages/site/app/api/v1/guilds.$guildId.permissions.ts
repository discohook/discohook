import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type APIGuildMember,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { getBucket } from "~/durable/rate-limits";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
  type TokenGuildPermissions,
} from "~/session.server";
import { injectErrorContext, isDiscordError } from "~/util/discord";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const headers = await getBucket(request, context, "guildPermissions");
  const [token, respond] = await authorizeRequest(request, context, {
    headers,
  });
  const data: TokenGuildPermissions = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  const { owner, permissions: userPermissions } = data;
  if (!owner && !userPermissions.has(PermissionFlags.ViewChannel)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let guild = data.guild;
  if (!guild) {
    try {
      guild = await getGuild(guildId, rest, context.env);
    } catch (e) {
      if (isDiscordError(e)) {
        throw json(
          {
            ...e.rawError,
            message:
              e.code === RESTJSONErrorCodes.UnknownGuild
                ? "Discohook Utils cannot access this server"
                : e.rawError.message,
          },
          e.status,
        );
      }
      throw json({ message: `Failed to fetch server: ${String(e)}` }, 500);
    }
  }

  let me: APIGuildMember;
  try {
    me = (await rest.get(
      // assuming new bot app for convenience
      Routes.guildMember(String(guildId), context.env.DISCORD_CLIENT_ID),
    )) as APIGuildMember;
  } catch (e) {
    if (isDiscordError(e)) {
      throw respond(
        json(injectErrorContext(e.rawError, { guildId }), e.status),
      );
    }
    throw respond(json({ message: "Failed to fetch current member" }, 500));
  }

  const botGuildPermissions = new PermissionsBitField(
    me.roles
      .map((roleId) => {
        const role = guild.roles.find((r) => r.id === roleId);
        return role?.permissions ?? "0";
      })
      .reduce((prev, cur) => BigInt(cur) | prev, 0n),
  );

  return respond(
    json({
      user: userPermissions.toString(),
      bot: botGuildPermissions.toString(),
      userOwner: owner,
    }),
  );
};
