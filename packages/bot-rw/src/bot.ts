import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  PresenceUpdateStatus
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import { ArgumentParser } from "argparse";
import i18next from "i18next";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Client } from "./client";

const {
  // url: GATEWAY_URL,
  shards: SHARD_COUNT,
  clusters: CLUSTER_COUNT,
} = (await Bun.file("./config.json").json()) as {
  url: string;
  shards: number;
  clusters: number;
};

const SHARDS_PER_CLUSTER = Math.floor(SHARD_COUNT / CLUSTER_COUNT);
const DEV = Bun.env.ENVIRONMENT === "development";

const argparser = new ArgumentParser();
argparser.add_argument("--cluster", {
  help: "zero-indexed cluster ID",
  required: !DEV,
  choices: Array(CLUSTER_COUNT)
    .fill(undefined)
    .map((_, i) => String(i)),
});

const cluster = Number(argparser.parse_args().cluster ?? 0);

// const guildIds = new Set<string>();

const rest = new REST({
  api: Bun.env.DISCORD_PROXY_API ?? "https://discord.com/api",
  retries: 2,
}).setToken(Bun.env.DISCORD_TOKEN);
const gateway = new WebSocketManager({
  token: Bun.env.DISCORD_TOKEN,
  intents:
    // none required: entitlement_*, interaction_create

    // guild_create, guild_delete, guild_emoji_update, channel_delete
    GatewayIntentBits.Guilds |
    // message_reaction_*
    GatewayIntentBits.GuildMessageReactions |
    // guild_member_*
    GatewayIntentBits.GuildMembers |
    // webhooks_update
    GatewayIntentBits.GuildWebhooks,
  rest,
  initialPresence: {
    status: PresenceUpdateStatus.Online,
    // I decided to remove the activity, perhaps temporarily, to not interfere
    // with custom profiles
    activities: [],
    // activities: [
    //   {
    //     name: "Custom",
    //     state: "discohook.app",
    //     type: ActivityType.Custom,
    //   },
    // ],
    afk: false,
    since: null,
  },
  ...(DEV
    ? { shardCount: null }
    : {
        shardCount: SHARD_COUNT,
        shardIds: {
          start: cluster * SHARDS_PER_CLUSTER,
          end: Math.min((cluster + 1) * SHARDS_PER_CLUSTER, SHARD_COUNT) - 1,
        },
      }),
});
// debug
// console.log(gateway.getShardIds());

const client = new Client({ rest, gateway });
client.once(GatewayDispatchEvents.Ready, ({ data: event, shardId }) => {
  client.ready = true;
  // for (const { id } of event.guilds) {
  //   guildIds.add(id);
  // }
  const shards = event.shard ? event.shard[1] : 0;
  console.log(
    `${event.user.username}#${
      event.user.discriminator
    } ready on cluster ${cluster}, shard ID ${shardId} (of ${shards}) with ${
      event.guilds.length
    } guilds`,
  );
});

const status: {
  // when the file was last saved
  // updated: number;
  // true = hello or resumed is most recent event
  // false = closed is most recent event
  shards: Record<number, boolean>;
} = {
  // updated: 0,
  shards: {},
};

gateway.on(WebSocketShardEvents.Hello, (shardId) => {
  console.log(`[hello] Cluster ${cluster}, Shard ${shardId}`);
  status.shards[shardId] = true;
});

gateway.on(WebSocketShardEvents.Resumed, (shardId) => {
  console.log(`[resumed] Cluster ${cluster}, Shard ${shardId}`);
  status.shards[shardId] = true;
});

gateway.on(WebSocketShardEvents.Closed, (_, shardId) => {
  console.log(`[closed] Cluster ${cluster}, Shard ${shardId}`);
  status.shards[shardId] = false;
});

gateway.on(WebSocketShardEvents.Error, (error, shardId) => {
  console.error(`[error] Cluster ${cluster}, Shard ${shardId}:`, error);
});

const addEvents = async () => {
  const folder = path.join(__dirname, "events");
  const files = (await readdir(folder)).filter(
    (f) => f !== "handler.ts" && f.endsWith(".ts"),
  );
  for (const file of files) {
    const adder = require(path.join(folder, file)).default;
    adder(client);
    console.log("Registered", file);
  }
};

const resources = {
  en: { translation: require("./i18n/en.json") },
  "en-GB": { translation: require("./i18n/en-GB.json") },
  fr: { translation: require("./i18n/fr.json") },
  nl: { translation: require("./i18n/nl.json") },
  it: { translation: require("./i18n/it.json") },
  "zh-CN": { translation: require("./i18n/zh-CN.json") },
};

const statusFileInterval = setInterval(() => {
  // const now = Date.now();
  if (Object.keys(status.shards).length === 0) return;

  Bun.file(`./status/${cluster}.json`)
    .write(JSON.stringify(status))
    .catch((e) => console.error("Failed to write status file", e));
  // status.updated = now;

  // 5 minutes
}, 300_000);
statusFileInterval.unref();

(async () => {
  await i18next.init({
    lng: "en",
    fallbackLng: "en",
    resources,
    // These are all plaintext strings passed to Discord (or another service
    // that sanitizes afterward)
    interpolation: { escapeValue: false },
  });

  await addEvents();
  await gateway.connect();
})();
