declare module "bun" {
  interface Env {
    DISCORD_APPLICATION_ID: string;
    DISCORD_TOKEN: string;
    DISCOHOOK_ORIGIN: string;
    TOKEN_SECRET: string;
    DATABASE_URL: string;
    APPLICATIONS_RAW: string;
    REDIS_URL: string;
    GUILD_ID: string;
    DEV_GUILD_ID: string;
    DEV_OWNER_ID: string;
  }
}
