// Generated initially by Wrangler by running `wrangler types`
// !! Don't regenerate this file automatically !!

// Thanks https://stackoverflow.com/a/51114250 !
declare namespace Store {
  type RedisKV = import("store").RedisKV;
}

interface Env {
  ENVIRONMENT: "dev" | "preview" | "production";
  LINK_ORIGIN: string;
  SESSION_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_SUPPORT_INVITE_CODE: string;
  DISCORD_PROXY_API?: string;
  AUTHLINK_CLIENT_ID?: string;
  AUTHLINK_CLIENT_SECRET?: string;
  GUILDED_BOT_TOKEN?: string;
  TOKEN_SECRET: string;
  // WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE: string;
  KOFI_WEBHOOK_TOKEN?: string;
  DATABASE_URL?: string;
  BITCOIN_ADDRESS?: string;
  CRYPTO_ALERTS_TOKEN?: string;

  // bots.discohook.app - custom bots
  BOTS_ORIGIN?: string;
  // reset possibly-stolen bot tokens
  GIST_TOKEN?: string;
  // discohook.org - for importing old-style backups
  LEGACY_ORIGIN?: string;
  // discohook.link - prettier links for link embeds
  LINK_ORIGIN?: string;
  // cdn.discohook.app - user uploaded content on B2
  CDN_ORIGIN: string;

  REDIS_URL: string;
  KV: Store.RedisKV;
  HYPERDRIVE: Hyperdrive;
  SCHEDULER: DurableObjectNamespace /* DurableScheduler */;
  COMPONENTS: DurableObjectNamespace /* DurableComponentState from discohook-bot */;
  DRAFT_CLEANER: DurableObjectNamespace /* DurableDraftComponentCleaner */;
  RATE_LIMITER: DurableObjectNamespace /* RateLimiter */;
  SHARE_LINKS: DurableObjectNamespace /* ShareLinks */;
  SESSIONS: DurableObjectNamespace /* SessionManager */;
  CDN: Fetcher;
  BOT: Fetcher;
  VERSION: { id: string; tag: string };
}
