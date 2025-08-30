import { GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import { ArgumentParser } from "argparse";
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

const rest = new REST().setToken(Bun.env.DISCORD_TOKEN);
const gateway = new WebSocketManager({
  token: Bun.env.DISCORD_TOKEN,
  intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessageReactions,
  rest,
  // initialPresence: {
  //   status: PresenceUpdateStatus.Online,
  //   activities: [
  //     {
  //       name: "Custom",
  //       state: "discohook.app/guide",
  //       type: ActivityType.Custom,
  //     },
  //   ],
  //   afk: false,
  //   since: null,
  // },
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

gateway.on(WebSocketShardEvents.Hello, (shardId) => {
  console.log(`[hello] Cluster ${cluster}, Shard ${shardId}`);
});

gateway.on(WebSocketShardEvents.Resumed, (shardId) => {
  console.log(`[resumed] Cluster ${cluster}, Shard ${shardId}`);
});

gateway.on(WebSocketShardEvents.Closed, (_, shardId) => {
  console.log(`[closed] Cluster ${cluster}, Shard ${shardId}`);
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

(async () => {
  await addEvents();
  await gateway.connect();
})();
