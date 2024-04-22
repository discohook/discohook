import { Service } from "@cloudflare/workers-types";
import { WorkerEntrypoint } from "cloudflare:workers";

class CDNService extends WorkerEntrypoint {
  async upload(blob: Blob) {}
}

export interface Env {
  KV: KVNamespace;
  SCHEDULER: DurableObjectNamespace;
  __STATIC_CONTENT: Fetcher;
  // __STATIC_CONTENT_MANIFEST: Object;
  SESSION_SECRET: string;
  TOKEN_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_SUPPORT_INVITE_CODE: string;
  DATABASE_URL: string;
  KOFI_WEBHOOK_TOKEN?: string;
  CRYPTO_ALERTS_TOKEN?: string;
  BITCOIN_ADDRESS?: string;
  // reset possibly-stolen bot tokens
  GIST_TOKEN?: string;
  // discohook.org - for importing old-style backups
  LEGACY_ORIGIN?: string;
  // my.discohook.app - prettier links for link embeds
  MY_ORIGIN?: string;
  // cdn.discohook.app - user uploaded content on B2
  CDN_ORIGIN: string;
  CDN: Service<CDNService>;
  // bots.discohook.app - custom bots
  BOTS_ORIGIN?: string;
}
