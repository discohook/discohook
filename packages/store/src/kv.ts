import type { REST } from "@discordjs/rest";
import {
  type APIGuild,
  type APIGuildChannel,
  type APIMessage,
  type GuildChannelType,
  GuildPremiumTier,
  Routes,
} from "discord-api-types/v10";
import type { DBWithSchema } from "./db.js";
import type { RedisKV } from "./redis.js";
import type { DraftComponent } from "./types/components.js";
import type { PartialKVGuild, TriggerKVGuild } from "./types/guild.js";

export type Env = {
  ENVIRONMENT: "dev" | "preview" | "production";
  SESSIONS: DurableObjectNamespace;
  REDIS_URL: string;
  KV: RedisKV;
};

export const getSessionManagerStub = (env: Env, sessionId: string) => {
  const id = env.SESSIONS.idFromName(sessionId);
  const stub = env.SESSIONS.get(id);
  return stub;
};

// No good way to `has()` with this unfortunately
export const getGeneric = async <T>(
  env: Env,
  key: string,
): Promise<T | null> => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", { method: "GET" });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as { data: T };
  return raw.data;
};

export const putGeneric = async <T>(
  env: Env,
  key: string,
  data: any,
  options?: { expirationTtl?: number; expiration?: number },
) => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", {
    method: "PUT",
    body: JSON.stringify({
      data,
      expires: options?.expiration
        ? new Date(options.expiration)
        : options?.expirationTtl
          ? new Date(new Date().getTime() + options.expirationTtl * 1000)
          : undefined,
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as T;
  return raw;
};

export const getchGuild = async (
  rest: REST,
  env: Env,
  guildId: string,
): Promise<PartialKVGuild> => {
  const key = `cache-guild-${guildId}`;
  const cached = await env.KV.get<PartialKVGuild>(key, "json");
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId))) as APIGuild;
    const reduced: PartialKVGuild = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    };
    await env.KV.put(key, JSON.stringify(reduced), { expirationTtl: 3600 });
    return reduced;
  }
  return cached;
};

export const getchTriggerGuild = async (
  rest: REST,
  env: Env,
  guildId: string,
): Promise<TriggerKVGuild> => {
  const key = `cache-triggerGuild-${guildId}`;
  const cached = await env.KV.get<TriggerKVGuild>(key, "json");
  if (!cached) {
    const guild = (await rest.get(Routes.guild(guildId), {
      query: new URLSearchParams({ with_counts: "true" }),
    })) as APIGuild;
    const reduced: TriggerKVGuild = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner_id: guild.owner_id,
      members: guild.approximate_member_count ?? 0,
      online_members: guild.approximate_presence_count ?? 0,
      roles: guild.roles.length,
      boosts: guild.premium_subscription_count ?? 0,
      boost_level: guild.premium_tier,
      vanity_code: guild.vanity_url_code,
      // emojis: guild.emojis.length,
      emoji_limit:
        guild.premium_tier === GuildPremiumTier.Tier3
          ? 250
          : guild.premium_tier === GuildPremiumTier.Tier2
            ? 150
            : guild.premium_tier === GuildPremiumTier.Tier1
              ? 100
              : 50,
      sticker_limit:
        guild.premium_tier === GuildPremiumTier.Tier3
          ? 60
          : guild.premium_tier === GuildPremiumTier.Tier2
            ? 30
            : guild.premium_tier === GuildPremiumTier.Tier1
              ? 15
              : 5,
    };
    await env.KV.put(key, JSON.stringify(reduced), { expirationTtl: 3600 });
    return reduced;
  }
  return cached;
};

export type APIMessageReduced = Pick<
  APIMessage,
  | "channel_id"
  | "type"
  | "application_id"
  | "webhook_id"
  | "author"
  | "content"
  | "components"
  | "embeds"
  | "attachments"
  | "flags"
  | "poll"
  // | "message_reference"
  // | "message_snapshots"
  | "position"
> & {
  guild_id?: string;
};

export type APIMessageReducedWithId = APIMessageReduced &
  Pick<APIMessage, "id">;

const reduceMessage = (
  message: APIMessage,
  guildId?: string,
): APIMessageReduced => ({
  channel_id: message.channel_id,
  type: message.type,
  application_id: message.application_id,
  webhook_id: message.webhook_id,
  author: message.author,
  content: message.content,
  components: message.components,
  embeds: message.embeds,
  attachments: message.attachments,
  flags: message.flags,
  poll: message.poll,
  position: message.position,
  guild_id: guildId,
});

export const cacheMessage = async (
  env: Env,
  message: APIMessage,
  guildId?: string,
  // 15m
  ttl = 900,
): Promise<APIMessageReducedWithId> => {
  const reduced = reduceMessage(message, guildId);
  await env.KV.put(`cache-message-${message.id}`, JSON.stringify(reduced), {
    expirationTtl: ttl,
  });
  return { id: message.id, ...reduced };
};

export const getchMessage = async (
  rest: REST,
  env: Env,
  channelId: string,
  messageId: string,
  options?: {
    guildId?: string;
    /** Defaults to 15 minutes (900s) per `cacheMessage` */
    ttl?: number;
    /**
     * If `false`, do not automatically renew the key. Otherwise, and if `ttl`
     * is provided, the key's expiry is renewed.
     */
    renew?: boolean;
  },
): Promise<APIMessageReducedWithId> => {
  try {
    const key = `cache-message-${messageId}`;
    const cached = await env.KV.get<APIMessageReduced>(key, "json");
    if (cached) {
      if (
        options?.guildId &&
        cached.guild_id &&
        cached.guild_id !== options.guildId
      ) {
        throw Error("Message is not from the provided guild.");
      }

      if (options?.renew !== false && options?.ttl !== undefined) {
        // I wanted to be able to determine when the key would expire and
        // dynamically renew based on that, but it proved too complex for the
        // simple solution I wanted.
        // const ttl = Number(await env.KV.send("TTL", key));
        // const now = Math.floor(new Date().getTime() / 1000);
        // const remaining = cached.metadata.ttl - now - cached.metadata.created;
        await env.KV.send("EXPIRE", key, String(options.ttl));
      }

      return { id: messageId, ...cached };
    }
  } catch {
    // Able to fetch from discord in the event that our redis is down
  }
  if (options?.guildId) {
    const channel = (await rest.get(
      Routes.channel(channelId),
    )) as APIGuildChannel<GuildChannelType>;
    if (!channel.guild_id || channel.guild_id !== options.guildId) {
      throw Error("Message is not from the provided guild.");
    }
  }

  const message = (await rest.get(
    Routes.channelMessage(channelId, messageId),
  )) as APIMessage;
  return await cacheMessage(env, message, options?.guildId, options?.ttl);
};

export interface KVStoredComponent {
  id: string;
  data: DraftComponent;
}

export const launchComponentKV = async (
  env: Env | Env["KV"],
  // In the future we will probably need a guild ID here so that we
  // can store on shard/cluster-specific machines
  options: {
    // messageId: string;
    componentId: string | bigint;
    data?: DraftComponent;
    db?: DBWithSchema;
  },
) => {
  const key = `custom-component-${options.componentId}`;
  const data = {
    id: String(options.componentId),
    data: options.data,
  };
  if (!data.data) {
    if (!options.db) throw Error("Must provide db if not data");

    const component = await options.db.query.discordMessageComponents.findFirst(
      {
        where: (table, { eq }) => eq(table.id, BigInt(options.componentId)),
        columns: { id: true, data: true },
      },
    );
    if (!component) throw Error("Unknown Component");
    data.data = component.data;
  }

  const kv = "KV" in env ? env.KV : env;
  // 1 hour
  await kv.put(key, JSON.stringify(data), { expirationTtl: 3600 });
  return data;
};

export const destroyComponentKV = async (
  env: Env | Env["KV"],
  // In the future we will probably need a guild ID here so that we
  // can store on shard/cluster-specific machines
  componentId: string | bigint,
) => {
  const kv = "KV" in env ? env.KV : env;
  await kv.delete(`custom-component-${componentId}`);
};
