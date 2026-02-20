import {
  type APIUser,
  type APIWebhook,
  type ClientOptions,
  Client as DjsClient,
} from "@discordjs/core";
import TTLCache from "@isaacs/ttlcache";
import {
  type DBWithSchema,
  getchGuild,
  getchTriggerGuild,
  getDb,
  getRedis,
  type QueryData,
  type RedisKV,
  type Env as StoreEnv,
} from "store";
import {
  fetchEmojiData,
  type ResolvedEmojiData,
  resolveEmojiData,
} from "./commands/emojis";
import { getWebhook } from "./commands/webhooks/webhookInfo";
import { EmojiManagerCache } from "./emojis";

export const parseApplicationsValue = () => {
  const parsed = JSON.parse(Bun.env.APPLICATIONS_RAW ?? "{}");
  parsed[Bun.env.DISCORD_APPLICATION_ID] = Bun.env.DISCORD_TOKEN;
  return parsed as Record<string, string>;
};

type MinimalAutocompleteWebhook = Pick<APIWebhook, "id" | "name"> & {
  user?: Pick<APIUser, "username" | "global_name">;
  channel: {
    id: string;
    name: string;
    position: number;
  };
};

export class Client extends DjsClient {
  public ready = false;
  private db_: DBWithSchema | undefined;
  private emojis_: ResolvedEmojiData | undefined;
  public emojiManagers = new Map<string, EmojiManagerCache>();

  // bun has a built-in redis client which we probably should use instead
  public KV: RedisKV;
  public guildWebhooks: TTLCache<string, MinimalAutocompleteWebhook[]>;
  public webhooks: TTLCache<string, APIWebhook>;

  constructor(props: ClientOptions) {
    super(props);

    this.KV = getRedis({
      REDIS_URL: Bun.env.REDIS_URL,
      ENVIRONMENT: Bun.env.ENVIRONMENT === "development" ? "dev" : "production",
    });

    // this is to speed up autocomplete, especially in servers with many
    // webhooks since fetching webhooks seems to be O(n)
    this.guildWebhooks = new TTLCache({
      // max of 30 servers with 10 minutes of retention
      max: 30,
      ttl: 60000,
    });

    this.webhooks = new TTLCache({ max: 100, ttl: 30000 });
  }

  private get storeEnv(): StoreEnv {
    return {
      ENVIRONMENT: Bun.env.ENVIRONMENT === "development" ? "dev" : "production",
      REDIS_URL: Bun.env.REDIS_URL,
      KV: this.KV,
      SESSIONS: null, // shouldn't ever be accessed
    };
  }

  getDb(): DBWithSchema {
    if (this.db_) return this.db_;

    const db = getDb({ connectionString: Bun.env.DATABASE_URL });
    this.db_ = db;
    return db;
  }

  getchTriggerGuild(guildId: string) {
    return getchTriggerGuild(this.rest, this.storeEnv, guildId);
  }

  getchGuild(guildId: string) {
    return getchGuild(this.rest, this.storeEnv, guildId);
  }

  async fetchEmojis() {
    if (this.emojis_) return this.emojis_;

    const data = await fetchEmojiData();
    this.emojis_ = resolveEmojiData(data);
    return this.emojis_;
  }

  getEmoji(query: { name: string } | { unicode: string }) {
    if (!this.emojis_) return null;

    if ("unicode" in query) {
      return this.emojis_.emojiToName.get(query.unicode);
    } else {
      return this.emojis_.nameToEmoji.get(query.name);
    }
  }

  async fetchEmojiManager(guildId?: string): Promise<EmojiManagerCache> {
    const key = guildId ?? Bun.env.DISCORD_APPLICATION_ID;
    const cached = this.emojiManagers.get(key);
    if (cached) return cached;

    if (guildId) {
      const items = await this.api.guilds.getEmojis(guildId);
      const emojis = items.map((emoji) => ({
        id: emoji.id,
        name: emoji.name,
        animated: emoji.animated,
      }));

      const manager = new EmojiManagerCache(emojis);
      this.emojiManagers.set(guildId, manager);
      return manager;
    }

    const { items } = await this.api.applications.getEmojis(
      Bun.env.DISCORD_APPLICATION_ID,
    );
    const emojis = items.map((emoji) => ({
      id: emoji.id,
      name: emoji.name,
      animated: emoji.animated,
    }));

    const manager = new EmojiManagerCache(emojis);
    this.emojiManagers.set(Bun.env.DISCORD_APPLICATION_ID, manager);
    return manager;
  }

  async getchWebhook(
    webhookId: string,
    options?: { token?: string; applicationId?: string },
  ) {
    const { token, applicationId } = options ?? {};
    return await getWebhook(this, webhookId, applicationId, token);
  }

  async getShareLinkExists(shareId: string) {
    const result = await this.KV.send("EXISTS", `share-${shareId}`);
    return result === 1;
  }

  async getShareLink(
    shareId: string,
  ): Promise<{ data: QueryData; origin?: string }> {
    const result = await this.KV.getWithMetadata<
      { data: QueryData; origin?: string },
      { expiresAt: number }
    >(`share-${shareId}`, "json");
    if (!result.value) {
      throw Error("No share data exists with that ID");
    }

    return { ...result.value, alarm: result.metadata.expiresAt };
  }

  async putShareLink(
    shareId: string,
    data: { data: QueryData; origin?: string },
    expiresAt?: Date,
  ) {
    await this.KV.put(
      `share-${shareId}`,
      JSON.stringify({
        data: data.data,
        origin: data.origin,
      }),
      {
        expiration: expiresAt,
        metadata: { expiresAt: expiresAt?.valueOf() },
      },
    );
  }
}
