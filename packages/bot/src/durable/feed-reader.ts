import { json } from "itty-router";
import { Env } from "../types/env.js";

export type FeedType =
  | "rss"
  | "atom"
  // We have to sort of re-implement the types here because I think we would
  // want to rename some properties to make more sense for the platform?
  | "bridge.tiktok"
  | "bridge.threads"
  | "bridge.mastodon"
  | "bridge.gocomics" // kill shayypy/daily-peanuts
  | "bridge.bandcamp";
// Maybe
// | "bridge.ao3"
// | "bridge.amazon-prices"
// | "bridge.youtube-community"
// | "bridge.twitch-videos"

/**
 * This durable object polls for changes in various feeds, including:
 * - RSS/Atom feeds
 * - Misc. JSON-formatted automatic feeds (https://github.com/RSS-Bridge/rss-bridge)
 */
export class FeedReader implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    switch (request.method) {
      default:
        return json({ message: "Method Not Allowed" }, { status: 405 });
    }
  }

  async alarm() {
    await this.state.storage.deleteAll();
  }
}

const getFeedReaderStub = (env: Env) => {
  // const id = env.READER.idFromName(sessionId);
  // const stub = env.READER.get(id);
  // return stub;
};
