export interface Env {
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  DEVELOPMENT_SERVER_ID: string;
  DB: D1Database;
}

export interface WorkerContext {
  waitUntil: (promise: Promise<void>) => void;
  passThroughOnException: () => void;
}
