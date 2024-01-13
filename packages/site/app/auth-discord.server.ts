import { APIUser } from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { getDb } from "./db/index.server";
import { discordUsers, makeSnowflake } from "./db/schema.server";
import { getSessionStorage, writeOauthUser } from "./session.server";
import { Context } from "./util/loader";

export type UserAuth = {
  id: number;
  authType: "discord";
  accessToken: string;
  refreshToken?: string;
};

export const getDiscordAuth = (context: Context) => {
  const discordAuth = new Authenticator<UserAuth>(
    getSessionStorage(context).sessionStorage,
  );
  const strategy = new DiscordStrategy(
    {
      clientID: context.env.DISCORD_CLIENT_ID,
      clientSecret: context.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${context.origin}/callback/discord`,
      scope: ["identify", "guilds"],
    },
    async ({
      accessToken,
      refreshToken,
      // extraParams,
      profile,
    }): Promise<UserAuth> => {
      const j = profile.__json as APIUser;
      const db = getDb(context.env.D1);
      await db
        .insert(discordUsers)
        .values({
          id: makeSnowflake(j.id),
          name: j.username,
          globalName: j.global_name,
          discriminator: j.discriminator,
          avatar: j.avatar,
        })
        .onConflictDoUpdate({
          target: discordUsers.id,
          set: {
            name: j.username,
            globalName: j.global_name,
            discriminator: j.discriminator,
            avatar: j.avatar,
          },
        });

      const user = await writeOauthUser({ db, discord: profile });

      // const userGuilds = await getCurrentUserGuilds(accessToken);
      //const guilds = userGuilds.filter(
      //  // Owner or manage webhooks
      //  (g) => g.owner || (BigInt(g.permissions) & BigInt(0x29)) == BigInt(0x29)
      //);

      return {
        id: user.id,
        authType: "discord",
        accessToken,
        refreshToken,
      };
    },
  );

  discordAuth.use(strategy);
  return discordAuth;
};
