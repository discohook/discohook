import { APIUser } from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { getSessionStorage } from "./session.server";
import { getDb, upsertDiscordUser } from "./store.server";
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
      const db = getDb(context.env.DATABASE_URL);
      const user = await upsertDiscordUser(db, j);

      // const userGuilds = await getCurrentUserGuilds(accessToken);
      // const guilds = userGuilds.filter(
      //  // Owner or manage webhooks
      //  (g) => g.owner || (BigInt(g.permissions) & BigInt(0x29)) == BigInt(0x29)
      // );

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
