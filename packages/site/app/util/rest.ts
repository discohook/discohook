import { REST } from "@discordjs/rest";
import type { Env } from "~/types/env";

export const createREST = (env: Env) => {
  return new REST({
    api: env.DISCORD_PROXY_API ?? "https://discord.com/api",
  }).setToken(env.DISCORD_BOT_TOKEN);
};
