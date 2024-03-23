import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  APIMessageComponentEmoji,
  RESTGetAPIGuildEmojisResult,
  RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { zx } from "zodix";
import { getDiscordUserOAuth } from "~/auth-discord.server";
import { getUser } from "~/session.server";
import {
  discordMessageComponents,
  getDb,
  getchGuild,
  upsertGuild,
} from "~/store.server";
import { isDiscordError } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: zx.IntAsString });

  const user = await getUser(request, context, true);
  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const db = getDb(context.env.DATABASE_URL);

  const component = await db.query.discordMessageComponents.findFirst({
    where: eq(discordMessageComponents.id, id),
    columns: {
      id: true,
      guildId: true,
      channelId: true,
      messageId: true,
      data: true,
      customId: true,
      draft: true,
    },
  });

  if (!component) {
    throw json({ message: "Component does not exist." }, 404);
  }
  const guildId = String(component.guildId);

  let isMember = false;
  if (user.discordUser) {
    const oauth = await getDiscordUserOAuth(
      db,
      context.env,
      user.discordUser.id,
    );

    try {
      if (oauth?.scope.includes("guilds.members.read")) {
        const r = new REST().setToken(oauth.accessToken);
        await r.get(Routes.userGuildMember(guildId), {
          authPrefix: "Bearer",
        });
      } else {
        await rest.get(
          Routes.guildMember(guildId, String(user.discordUser.id)),
        );
      }
      isMember = true;
    } catch (e) {
      if (isDiscordError(e)) {
        console.log(e);
        throw json(e.raw, 403);
      }
      console.error(e);
    }
  }

  if (!isMember) {
    throw json({ message: "You are not a member of this server." }, 403);
  }

  const guild = await getchGuild(rest, context.env.KV, guildId);
  await upsertGuild(db, guild);

  const emojis = (await rest.get(
    Routes.guildEmojis(guild.id),
  )) as RESTGetAPIGuildEmojisResult;

  const roles = (await rest.get(
    Routes.guildRoles(guild.id),
  )) as RESTGetAPIGuildRolesResult;

  return {
    component,
    guild: {
      ...guild,
      emojis: emojis
        .filter((e) => !!e.available)
        .map(
          (e) =>
            ({
              id: e.id ?? undefined,
              name: e.name ?? undefined,
              animated: e.animated,
            }) satisfies APIMessageComponentEmoji,
        ),
      roles,
    },
  };
};
