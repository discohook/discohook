import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  RESTGetAPIGuildMemberResult,
  RESTGetAPIUserResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionsBitField } from "discord-bitflag";
import { z } from "zod";
import { refreshAuthToken } from "~/routes/s.$guildId";
import { discordMembers, getDb } from "~/store.server";
import { ResolvableAPIGuildMember } from "~/util/cache/CacheManager";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId, userId } = zxParseParams(params, {
    guildId: z.literal("@global").or(snowflakeAsString()),
    userId: snowflakeAsString(),
  });

  let permissions: PermissionsBitField | undefined;
  if (guildId !== "@global") {
    // You only need to be a member for this route
    ({ permissions } = await refreshAuthToken(
      String(guildId),
      request,
      context,
      true,
    ));
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
      console.log(e);
      throw json({ message: "Failed to fetch user - they may not exist" }, 404);
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
      console.log(e);
      throw json(
        { message: "Failed to fetch member - they may not exist" },
        404,
      );
    }
  }

  if (guildId !== "@global") {
    const db = getDb(context.env.DATABASE_URL);
    await db
      .insert(discordMembers)
      .values({
        guildId,
        userId,
        permissions: permissions?.toString(),
      })
      .onConflictDoUpdate({
        target: [discordMembers.guildId, discordMembers.userId],
        set: {
          permissions: permissions?.toString(),
        },
      });
  }

  return member;
};
