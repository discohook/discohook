import type { Env } from "~/types/env";
import { getDiscordUserTag, type MinimalDiscordUser } from "./users";

export const uploadTokenGist = async (
  env: Env,
  token: string,
  discordUser?: MinimalDiscordUser | null,
) => {
  let reset = false;
  if (env.GIST_TOKEN) {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      body: JSON.stringify({
        files: {
          "token.md": {
            content: [
              "Someone used your bot token on Discohook. If this",
              "was one of your team members, make sure their account",
              "is ranked **Developer** or higher (not read-only).",
              "A token may only be set for a custom bot if it can",
              "already be accessed by that user through Discord.",
              "\n\n",
              `- Token: ${token}\n`,
              `- Username: ${discordUser ? getDiscordUserTag(discordUser) : "unknown"}`,
            ].join(" "),
          },
        },
        public: true,
      }),
      headers: {
        Authorization: `Bearer ${env.GIST_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "Discohook",
      },
    });
    if (!response.ok) {
      console.error(await response.text());
    }
    reset = response.ok;
  }
  return reset;
};
