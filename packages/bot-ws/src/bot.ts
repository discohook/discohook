import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import {
  ActivityType,
  GatewayDispatchEvents,
  GatewayIntentBits,
  PresenceUpdateStatus,
} from "discord-api-types/v10";
import { configDotenv } from "dotenv";
import type { Env } from "./types";

configDotenv();
const env = process.env as unknown as Env;

if (!env.DISCORD_TOKEN || !env.WORKER_ORIGIN) {
  throw Error("Missing required environment variables. Refer to README.");
}

let guildIds: string[] = [];
const rest = new REST().setToken(env.DISCORD_TOKEN);
const manager = new WebSocketManager({
  token: env.DISCORD_TOKEN,
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.GuildMessageReactions |
    GatewayIntentBits.GuildWebhooks,
  rest,
  initialPresence: {
    status: PresenceUpdateStatus.Online,
    activities: [
      {
        name: "Custom",
        state: "discohook.app/guide",
        type: ActivityType.Custom,
      },
    ],
    afk: false,
    since: null,
  },
  shardCount: env.SHARD_COUNT ?? null,
  // 13 processes for ~128 shards seems about right.
  // Each process handles ~10k guilds with this setup
  // buildStrategy: (manager) =>
  //   new ProcessShardingStrategy(manager, { shardsPerProcess: 10 }),
});

manager.on(WebSocketShardEvents.Ready, (event) => {
  guildIds = event.data.guilds.map((g) => g.id);
  console.log(
    `${event.data.user.username}#${event.data.user.discriminator} ready with ${
      event.data.shard ? event.data.shard[1] : 0
    } shards on ${event.data.guilds.length} guilds\nWorker origin: ${
      env.WORKER_ORIGIN
    }`,
  );
});

manager.on(WebSocketShardEvents.Hello, (event) => {
  console.log(`[hello] Shard ID ${event.shardId}`);
});

manager.on(WebSocketShardEvents.Resumed, (event) => {
  console.log(`[resumed] Shard ID ${event.shardId}`);
});

manager.on(WebSocketShardEvents.Closed, (event) => {
  console.log(`[closed] Shard ID ${event.shardId}`);
});

manager.on(WebSocketShardEvents.Dispatch, async (event) => {
  // We have to have just a little bit of local state to prevent sending 1000+
  // requests every time a shard is ready. Since this is the only cache, I am
  // not so concerned about RAM with this 'hybrid' technique
  switch (event.data.t) {
    case GatewayDispatchEvents.GuildCreate: {
      const alreadyMember = guildIds.includes(event.data.d.id);
      guildIds.push(event.data.d.id);
      if (alreadyMember) return;
      break;
    }
    case GatewayDispatchEvents.GuildDelete: {
      // It's just unavailable, ignore but let the bot worker handle it
      if (event.data.d.unavailable) break;
      const index = guildIds.indexOf(event.data.d.id);
      if (index !== -1) guildIds.splice(index, 1);
      break;
    }
    default:
      break;
  }

  if (
    [
      GatewayDispatchEvents.GuildMemberAdd,
      GatewayDispatchEvents.GuildMemberRemove,
      GatewayDispatchEvents.GuildCreate,
      GatewayDispatchEvents.GuildDelete,
      GatewayDispatchEvents.WebhooksUpdate,
      // Discobot: reaction roles
      GatewayDispatchEvents.MessageReactionAdd,
      GatewayDispatchEvents.MessageReactionRemove,
    ].includes(event.data.t)
  ) {
    try {
      const response = await fetch(`${env.WORKER_ORIGIN}/ws`, {
        method: "POST",
        body: JSON.stringify(event.data.d),
        headers: {
          Authorization: `Bot ${env.DISCORD_TOKEN}`,
          "X-Discohook-Event": event.data.t,
          "X-Discohook-Shard": String(event.shardId),
          "Content-Type": "application/json",
          "User-Agent":
            "discohook-bot-ws/1.0.0 (+https://github.com/shayypy/discohook)",
        },
      });
      console.log(`${event.data.t} returned ${response.status}`);
    } catch (e) {
      console.error(e);
    }
  }
});

(async () => {
  await manager.connect();
})();
