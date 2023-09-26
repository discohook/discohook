import { createCookieSessionStorage } from "@remix-run/node";
import {
  APIWebhook,
  RESTPostOAuth2AccessTokenWithBotAndGuildsAndWebhookIncomingScopeResult,
} from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";

const dudSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__boogiehook_webhook",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

export const discordWebhookAuth = new Authenticator<APIWebhook>(
  dudSessionStorage
);

const strategy = new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: `${process.env.ORIGIN}/callback/discord-webhook`,
    scope: ["webhook.incoming"],
  },
  async ({
    accessToken,
    refreshToken,
    extraParams,
    profile,
  }): Promise<APIWebhook> => {
    return (
      extraParams as unknown as RESTPostOAuth2AccessTokenWithBotAndGuildsAndWebhookIncomingScopeResult
    ).webhook;
  }
);

discordWebhookAuth.use(strategy);
