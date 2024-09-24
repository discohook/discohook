import { formatEmoji } from "@discordjs/formatters";
import { REST } from "@discordjs/rest";
import {
  APIEmoji,
  APIMessageComponentEmoji,
  APIPartialEmoji,
  RESTGetAPIGuildEmojisResult,
  Routes,
} from "discord-api-types/v10";
import { json } from "itty-router";
import { Env } from "./types/env.js";

export class EmojiManager implements DurableObject {
  rest: REST;
  emojis: APIPartialEmoji[] | null;

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {
    this.rest = new REST().setToken(env.DISCORD_TOKEN);
    this.emojis = null;
  }

  async fetch(request: Request) {
    switch (request.method) {
      case "GET": {
        // We rely on eventual destruction to expire our cache and force us to
        // refresh since everything is stored in memory.
        // https://developers.cloudflare.com/durable-objects/examples/durable-object-in-memory-state
        if (this.emojis) {
          return json(this.emojis);
        }

        const params = new URL(request.url).searchParams;
        const guildId = params.get("guildId");
        if (guildId) {
          const items = (await this.rest.get(
            Routes.guildEmojis(guildId),
          )) as RESTGetAPIGuildEmojisResult;

          const emojis = items.map((emoji) => ({
            id: emoji.id,
            name: emoji.name,
            animated: emoji.animated,
          }));

          this.emojis = emojis;
          return json(emojis);
        }

        const { items } = (await this.rest.get(
          `/applications/${this.env.DISCORD_APPLICATION_ID}/emojis`,
        )) as { items: APIEmoji[] };
        const emojis = items.map((emoji) => ({
          id: emoji.id,
          name: emoji.name,
          animated: emoji.animated,
        }));

        this.emojis = emojis;
        return json(emojis);
      }
    }
    return new Response(null, { status: 405 });
  }
}

export class EmojiManagerCache {
  emojisByName: Map<string, APIPartialEmoji>;
  constructor(public emojis: APIPartialEmoji[]) {
    this.emojisByName = new Map(
      // biome-ignore lint/style/noNonNullAssertion: Must have one of these
      emojis.map((emoji) => [(emoji.name ?? emoji.id)!, emoji]),
    );
  }

  get(name: string, fallback?: false | undefined): APIPartialEmoji | null;
  get(name: string, fallback?: true | APIPartialEmoji): APIPartialEmoji;
  get(
    name: string,
    fallback?: boolean | APIPartialEmoji,
  ): APIPartialEmoji | null {
    const emoji = this.emojisByName.get(name);
    if (emoji) {
      return emoji;
    }
    if (fallback === true) {
      return { id: null, name: "🌫️" };
    } else if (fallback) {
      return fallback;
    }
    return null;
  }

  /**
   * Identical to `get` but returns an `APIMessageComponentEmoji`
   */
  getC(
    name: string,
    fallback?: false | undefined,
  ): APIMessageComponentEmoji | null;
  getC(
    name: string,
    fallback?: true | APIMessageComponentEmoji,
  ): APIMessageComponentEmoji;
  getC(
    name: string,
    fallback?: boolean | APIMessageComponentEmoji,
  ): APIMessageComponentEmoji | null {
    const emoji = this.get(
      name,
      typeof fallback === "boolean"
        ? fallback
          ? true
          : undefined
        : fallback
          ? {
              id: fallback.id ?? null,
              name: fallback.name ?? null,
              animated: fallback.animated,
            }
          : undefined,
    );
    if (emoji) {
      return {
        id: emoji.id ?? undefined,
        name: emoji.name ?? undefined,
        animated: emoji.animated,
      };
    }
    return null;
  }
}

export const getEmojis = async (env: Env, guildId?: string) => {
  const id = env.EMOJIS.idFromName(guildId ?? "@me");
  const stub = env.EMOJIS.get(id);

  const params = new URLSearchParams();
  if (guildId) params.set("guildId", guildId);
  const response = await stub.fetch(`http://do/?${params}`, { method: "GET" });
  const emojis = (await response.json()) as APIPartialEmoji[];

  const manager = new EmojiManagerCache(emojis);
  return manager;
};

export const emojiToString = (
  emoji: APIPartialEmoji | APIMessageComponentEmoji,
) => (emoji.id ? formatEmoji(emoji.id, emoji.animated) : emoji.name ?? "");
