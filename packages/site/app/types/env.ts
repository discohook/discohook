import { Service } from "@cloudflare/workers-types";

export interface Env {
  ENVIRONMENT: "dev" | "preview" | "production";
  KV: KVNamespace;
  SCHEDULER: DurableObjectNamespace;
  DRAFT_CLEANER: DurableObjectNamespace;
  COMPONENTS: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;
  SHARE_LINKS: DurableObjectNamespace;
  __STATIC_CONTENT: Fetcher;
  VERSION: WorkerVersionMetadata;
  // __STATIC_CONTENT_MANIFEST: Object;
  SESSION_SECRET: string;
  TOKEN_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  AUTHLINK_CLIENT_ID?: string;
  AUTHLINK_CLIENT_SECRET?: string;
  GUILDED_BOT_TOKEN?: string;
  DISCORD_SUPPORT_INVITE_CODE: string;
  DATABASE_URL?: string;
  HYPERDRIVE: Hyperdrive;
  KOFI_WEBHOOK_TOKEN?: string;
  CRYPTO_ALERTS_TOKEN?: string;
  BITCOIN_ADDRESS?: string;
  // reset possibly-stolen bot tokens
  GIST_TOKEN?: string;
  // discohook.org - for importing old-style backups
  LEGACY_ORIGIN?: string;
  // discohook.link - prettier links for link embeds
  LINK_ORIGIN?: string;
  // cdn.discohook.app - user uploaded content on B2
  CDN_ORIGIN: string;
  CDN: Service;
  // bots.discohook.app - custom bots
  BOTS_ORIGIN?: string;
  BOT: Service;
}
