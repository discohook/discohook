import type { Service } from "@cloudflare/workers-types";
import type { RedisKV } from "store";

export interface Env {
  ENVIRONMENT: "dev" | "preview" | "production";
  PREMIUM_SKUS: string[];
  LIFETIME_SKU: string;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  DISCOHOOK_ORIGIN: string;
  TOKEN_SECRET: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  KV: RedisKV;

  GUILD_ID?: string;
  DONATOR_ROLE_ID?: string;
  SUBSCRIBER_ROLE_ID?: string;

  APPLICATIONS: Record<string, string>;
  APPLICATIONS_RAW?: string;
  HYPERDRIVE: Hyperdrive;
  COMPONENTS: DurableObjectNamespace;
  DRAFT_CLEANER: DurableObjectNamespace;
  SHARE_LINKS: DurableObjectNamespace;
  EMOJIS: DurableObjectNamespace;
  SESSIONS: DurableObjectNamespace;
  SITE: Service;

  DEV_GUILD_ID?: string;
  DEV_OWNER_ID?: string;
}
