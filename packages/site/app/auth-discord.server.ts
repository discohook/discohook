import { REST } from "@discordjs/rest";
import {
  APIUser,
  RESTPostOAuth2AccessTokenResult,
  Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { getSessionStorage } from "./session.server";
import {
  DBWithSchema,
  getDb,
  oauthInfo,
  upsertDiscordUser,
} from "./store.server";
import { Env } from "./types/env";
import { Context } from "./util/loader";
import { base64Encode } from "./util/text";

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
      scope: ["identify", "guilds", "guilds.members.read"],
    },
    async ({
      accessToken,
      refreshToken,
      extraParams,
      profile,
    }): Promise<UserAuth> => {
      const j = profile.__json as APIUser;
      const db = getDb(context.env.DATABASE_URL);
      const user = await upsertDiscordUser(db, j, {
        accessToken,
        refreshToken,
        scope: extraParams.scope,
        expiresAt: new Date(
          new Date().getTime() + extraParams.expires_in * 1000,
        ),
      });

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

type OauthInfo = NonNullable<
  Awaited<ReturnType<DBWithSchema["query"]["oauthInfo"]["findFirst"]>>
>;

export const getDiscordUserOAuth = async (
  db: DBWithSchema,
  env: Env,
  discordId: bigint,
): Promise<OauthInfo | undefined> => {
  const info = await db.query.oauthInfo.findFirst({
    where: eq(oauthInfo.discordId, discordId),
  });
  if (info) {
    return await refreshDiscordOAuth(db, env, info);
  }
};

export const refreshDiscordOAuth = async (
  db: DBWithSchema,
  env: Env,
  oauth: OauthInfo,
): Promise<OauthInfo | undefined> => {
  const now = new Date();
  if (oauth.expiresAt && now >= oauth.expiresAt) {
    if (!oauth.refreshToken) {
      await db.delete(oauthInfo).where(eq(oauthInfo.id, oauth.id));
      return undefined;
    }
    const rest = new REST();
    const response = (await rest.post(Routes.oauth2TokenExchange(), {
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: oauth.refreshToken,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${base64Encode(
          `${env.DISCORD_CLIENT_ID}:${env.DISCORD_CLIENT_SECRET}`,
        )}`,
      },
    })) as RESTPostOAuth2AccessTokenResult;

    const updated = await db
      .update(oauthInfo)
      .set({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: new Date(new Date().getTime() + response.expires_in * 1000),
        scope: response.scope.split(" "),
      })
      .where(eq(oauthInfo.id, oauth.id))
      .returning();

    return updated[0];
  }
  return oauth;
};
