import { Service } from "@cloudflare/workers-types";

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

  GUILD_ID?: string;
  DONATOR_ROLE_ID?: string;
  SUBSCRIBER_ROLE_ID?: string;

  APPLICATIONS: Record<string, string>;
  APPLICATIONS_RAW?: string;
  HYPERDRIVE: Hyperdrive;
  KV: KVNamespace;
  COMPONENTS: DurableObjectNamespace;
  DRAFT_CLEANER: DurableObjectNamespace;
  SITE: Service;
}
