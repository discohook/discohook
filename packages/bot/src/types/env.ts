import { Service } from "@cloudflare/workers-types";

export interface Env {
  ENVIRONMENT: "dev" | "preview" | "production";
  PREMIUM_SKUS: string[];
  LIFETIME_SKU: string;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  DEVELOPMENT_SERVER_ID: string;
  DISCOHOOK_ORIGIN: string;
  TOKEN_SECRET: string;
  DATABASE_URL: string;
  APPLICATIONS: Record<string, string>;
  APPLICATIONS_RAW?: string;
  HYPERDRIVE: Hyperdrive;
  KV: KVNamespace;
  COMPONENTS: DurableObjectNamespace;
  DRAFT_CLEANER: DurableObjectNamespace;
  SITE: Service;
}
