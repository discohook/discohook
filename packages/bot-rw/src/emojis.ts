import { formatEmoji } from "@discordjs/formatters";
import type {
  APIMessageComponentEmoji,
  APIPartialEmoji,
} from "discord-api-types/v10";

export class EmojiManagerCache {
  emojisByName = new Map<string, APIPartialEmoji>();

  constructor(public emojis: APIPartialEmoji[]) {
    this.updateEmojis(emojis);
  }

  updateEmojis(emojis: APIPartialEmoji[]) {
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

export const emojiToString = (
  emoji: APIPartialEmoji | APIMessageComponentEmoji,
) => (emoji.id ? formatEmoji(emoji.id, emoji.animated) : (emoji.name ?? ""));
