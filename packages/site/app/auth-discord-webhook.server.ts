import { createCookie, createWorkersKVSessionStorage } from "@remix-run/cloudflare";
import {
  APIWebhook,
  RESTPostOAuth2AccessTokenWithBotAndGuildsAndWebhookIncomingScopeResult,
} from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { Context } from "./util/loader";

export const getDiscordWebhookAuth = (context: Context) => {
  const dudSessionStorage = createWorkersKVSessionStorage({
    kv: context.env.KV,
    cookie: createCookie("__boogiehook_webhook", {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      // secure: process.env.NODE_ENV === "production",
    })
  });

  const discordWebhookAuth = new Authenticator<APIWebhook>(dudSessionStorage);

  const strategy = new DiscordStrategy(
    {
      clientID: context.env.DISCORD_CLIENT_ID,
      clientSecret: context.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${context.origin}/callback/discord-webhook`,
      scope: ["webhook.incoming"],
    },
    async ({ extraParams }): Promise<APIWebhook> => {
      return (
        extraParams as unknown as RESTPostOAuth2AccessTokenWithBotAndGuildsAndWebhookIncomingScopeResult
      ).webhook;
    }
  );

  discordWebhookAuth.use(strategy);
  return discordWebhookAuth;
}
