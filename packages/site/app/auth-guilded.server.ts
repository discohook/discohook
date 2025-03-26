import type { SessionStorage } from "@remix-run/cloudflare";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { GuildedStrategy } from "remix-auth-guilded";
import type { OauthInfo, UserAuth } from "./auth-discord.server";
import { getSessionStorage } from "./session.server";
import {
  type DBWithSchema,
  getDb,
  oauthInfo,
  upsertGuildedUser,
} from "./store.server";
import type { Env } from "./types/env";
import type { Context } from "./util/loader";

export const getGuildedAuth = (
  context: Context,
  sessionStorage?: SessionStorage,
) => {
  if (!context.env.AUTHLINK_CLIENT_ID || !context.env.AUTHLINK_CLIENT_SECRET) {
    throw Error("No Authlink parameters provided");
  }
  const auth = new Authenticator<UserAuth>(
    sessionStorage ?? getSessionStorage(context).sessionStorage,
  );
  const strategy = new GuildedStrategy(
    {
      clientId: context.env.AUTHLINK_CLIENT_ID,
      clientSecret: context.env.AUTHLINK_CLIENT_SECRET,
      redirectUri: `${context.origin}/callback/guilded`,
      scope: ["identify", "servers.members.read"],
    },
    async ({
      accessToken,
      refreshToken,
      extraParams,
      profile,
    }): Promise<UserAuth> => {
      const guildedUser = profile._json;

      const db = getDb(context.env.HYPERDRIVE);
      const user = await upsertGuildedUser(db, guildedUser, {
        accessToken,
        refreshToken,
        scope: extraParams.scope.split(" "),
        expiresAt: new Date(
          new Date().getTime() + extraParams.expires_in * 1000,
        ),
      });
      // Cannot get servers :(

      return {
        id: String(user.id),
        guildedId: guildedUser.id,
      };
    },
  );

  auth.use(strategy);
  return auth;
};

export const getGuildedUserOAuth = async (
  db: DBWithSchema,
  env: Env,
  guildedId: string,
): Promise<OauthInfo | undefined> => {
  const info = await db.query.oauthInfo.findFirst({
    where: eq(oauthInfo.guildedId, guildedId),
  });
  if (info) {
    return await refreshGuildedOAuth(db, env, info);
  }
};

export const refreshGuildedOAuth = async (
  db: DBWithSchema,
  env: Env,
  oauth: OauthInfo,
): Promise<OauthInfo | undefined> => {
  if (!env.AUTHLINK_CLIENT_ID || !env.AUTHLINK_CLIENT_SECRET) {
    throw Error("Must provide Authlink client ID and secret");
  }
  const now = new Date();
  if (oauth.expiresAt && now >= oauth.expiresAt) {
    if (!oauth.refreshToken) {
      await db.delete(oauthInfo).where(eq(oauthInfo.id, oauth.id));
      return undefined;
    }

    const raw = await fetch("https://authlink.app/v1/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: env.AUTHLINK_CLIENT_ID,
        client_secret: env.AUTHLINK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: oauth.refreshToken,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!raw.ok) {
      // Assume the user has deauthorized
      await db.delete(oauthInfo).where(eq(oauthInfo.id, oauth.id));
      return undefined;
    }
    const response = (await raw.json()) as RESTPostOAuth2AccessTokenResult;

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
