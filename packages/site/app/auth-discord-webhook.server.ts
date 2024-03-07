import { REST } from "@discordjs/rest";
import {
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";
import {
  APIUser,
  APIWebhook,
  RESTPostOAuth2AccessTokenWithBotAndGuildsAndWebhookIncomingScopeResult,
} from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import {
  getDb,
  getchGuild,
  upsertDiscordUser,
  upsertGuild,
  webhooks,
} from "./store.server";
import { Context } from "./util/loader";

export const getDiscordWebhookAuth = (context: Context) => {
  const dudSessionStorage = createWorkersKVSessionStorage({
    kv: context.env.KV,
    cookie: createCookie("__discohook_webhook", {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      // secure: process.env.NODE_ENV === "production",
    }),
  });

  const discordWebhookAuth = new Authenticator<APIWebhook>(dudSessionStorage);

  const strategy = new DiscordStrategy(
    {
      clientID: context.env.DISCORD_CLIENT_ID,
      clientSecret: context.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${context.origin}/callback/discord-webhook`,
      scope: ["webhook.incoming"],
    },
    async ({ profile, extraParams }): Promise<APIWebhook> => {
      const { webhook } =
        extraParams as unknown as RESTPostOAuth2AccessTokenWithBotAndGuildsAndWebhookIncomingScopeResult;

      const db = getDb(context.env.DATABASE_URL);
      let guildId: bigint | undefined = undefined;
      if (webhook.guild_id) {
        const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
        try {
          const guild = await getchGuild(
            rest,
            context.env.KV,
            webhook.guild_id,
          );
          const upserted = await upsertGuild(db, guild);
          guildId = upserted.id;
        } catch {
          guildId = undefined;
        }
      }
      let userId: number | undefined = undefined;
      if (profile.__json) {
        try {
          const upserted = await upsertDiscordUser(
            db,
            profile.__json as APIUser,
          );
          userId = upserted.id;
        } catch {
          userId = undefined;
        }
      }

      await db
        .insert(webhooks)
        .values({
          platform: "discord",
          id: webhook.id,
          name: webhook.name ?? "",
          avatar: webhook.avatar,
          channelId: webhook.channel_id,
          discordGuildId: guildId,
          userId,
        })
        .onConflictDoUpdate({
          target: [webhooks.platform, webhooks.id],
          set: {
            name: webhook.name ?? undefined,
            avatar: webhook.avatar,
            channelId: webhook.channel_id,
            discordGuildId: guildId,
            userId,
          },
        });

      return webhook;
    },
  );

  discordWebhookAuth.use(strategy);
  return discordWebhookAuth;
};
