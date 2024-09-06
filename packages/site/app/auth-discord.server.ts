import { SessionStorage } from "@remix-run/cloudflare";
import {
  APIUser,
  RESTPostOAuth2AccessTokenResult,
  Routes,
} from "discord-api-types/v10";
import { eq, sql } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { getSessionStorage } from "./session.server";
import {
  DBWithSchema,
  discordGuilds,
  discordMembers,
  getDb,
  makeSnowflake,
  oauthInfo,
  upsertDiscordUser,
} from "./store.server";
import { Env } from "./types/env";
import {
  DISCORD_API,
  DISCORD_API_V,
  getCurrentUserGuilds,
} from "./util/discord";
import { Context } from "./util/loader";
import { base64Encode } from "./util/text";

export type UserAuth = {
  id: string;
  discordId?: string;
  guildedId?: string;
};

export const getDiscordAuth = (
  context: Context,
  sessionStorage?: SessionStorage,
) => {
  const discordAuth = new Authenticator<UserAuth>(
    sessionStorage ?? getSessionStorage(context).sessionStorage,
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
      try {
        const j = profile.__json as APIUser;
        const db = getDb(context.env.HYPERDRIVE);
        const user = await upsertDiscordUser(db, j, {
          accessToken,
          refreshToken,
          scope: extraParams.scope,
          expiresAt: new Date(
            new Date().getTime() + extraParams.expires_in * 1000,
          ),
        });

        const guilds = await getCurrentUserGuilds(accessToken);
        if (guilds.length !== 0) {
          await db
            .insert(discordGuilds)
            .values(
              guilds.map((guild) => ({
                id: makeSnowflake(guild.id),
                name: guild.name,
                icon: guild.icon,
                ownerDiscordId: guild.owner ? makeSnowflake(j.id) : undefined,
              })),
            )
            .onConflictDoUpdate({
              target: discordGuilds.id,
              set: {
                name: sql`excluded.name`,
                icon: sql`excluded.icon`,
                ownerDiscordId: sql`excluded."ownerDiscordId"`,
              },
            });
          await db
            .insert(discordMembers)
            .values(
              guilds.map((guild) => ({
                guildId: makeSnowflake(guild.id),
                userId: makeSnowflake(j.id),
                permissions: guild.permissions,
                owner: guild.owner,
              })),
            )
            .onConflictDoUpdate({
              target: [discordMembers.guildId, discordMembers.userId],
              set: { permissions: sql`excluded.permissions` },
            });
        }

        return {
          id: String(user.id),
          discordId: j.id,
        };
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  );

  discordAuth.use(strategy);
  return discordAuth;
};

export type OauthInfo = typeof oauthInfo.$inferSelect;

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
    // I don't know why but REST.post does not work here. I was getting
    // generic bad requests with no response elaboration, maybe it mistreats
    // a urlsearchparams body?
    const raw = await fetch(
      `${DISCORD_API}/v${DISCORD_API_V}${Routes.oauth2TokenExchange()}`,
      {
        method: "POST",
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
      },
    );
    if (!raw.ok) {
      // Assume the user has deauthorized
      // const data = (await raw.json()) as DiscordErrorData;
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
