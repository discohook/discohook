import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  RESTGetAPIGuildMemberResult,
  RESTGetAPIUserResult,
  Routes,
} from "discord-api-types/v10";
import { z } from "zod";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { ResolvableAPIGuildMember } from "~/util/cache/CacheManager";
import { isDiscordError } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId, userId } = zxParseParams(params, {
    guildId: z.literal("@global").or(snowflakeAsString()),
    userId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  if (guildId !== "@global") {
    const { member: userMember } = await getTokenGuildPermissions(
      token,
      guildId,
      context.env,
    );
    if (userMember && userId === token.user.discordId) {
      // Self-mention and fresh token assignment
      // biome-ignore lint/style/noNonNullAssertion:
      const user = userMember.user!;
      return respond(
        json({
          nick: userMember.nick,
          user: {
            id: user.id,
            global_name: user.global_name,
            username: user.username,
          },
        } satisfies ResolvableAPIGuildMember),
      );
    }
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let member: ResolvableAPIGuildMember;
  if (guildId === "@global") {
    try {
      const user = (await rest.get(
        Routes.user(String(userId)),
      )) as RESTGetAPIUserResult;
      member = {
        user: {
          id: user.id,
          username: user.username,
          global_name: user.global_name,
        },
      };
    } catch (e) {
      throw respond(
        json(
          isDiscordError(e) ? e.rawError : { message: "Failed to fetch user" },
          404,
        ),
      );
    }
  } else {
    try {
      const rawMember = (await rest.get(
        Routes.guildMember(String(guildId), String(userId)),
      )) as RESTGetAPIGuildMemberResult;
      // biome-ignore lint/style/noNonNullAssertion:
      const user = rawMember.user!;
      member = {
        nick: rawMember.nick,
        user: {
          id: user.id,
          username: user.username,
          global_name: user.global_name,
        },
      };
    } catch (e) {
      throw respond(
        json(
          isDiscordError(e)
            ? e.rawError
            : { message: "Failed to fetch member" },
          404,
        ),
      );
    }
  }

  return respond(json(member));
};
