export interface Env {
  D1: D1Database;
  KV: KVNamespace;
  __STATIC_CONTENT: Fetcher;
  // __STATIC_CONTENT_MANIFEST: Object;
  SESSION_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_SUPPORT_INVITE_CODE: string;
  KOFI_WEBHOOK_TOKEN: string;
}
