import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import {
  ActivityType,
  GatewayDispatchEvents,
  GatewayIntentBits,
  PresenceUpdateStatus,
} from "discord-api-types/v10";
import { configDotenv } from "dotenv";

configDotenv();

const env = process.env as {
  DISCORD_TOKEN: string;
  WORKER_ORIGIN: string;
};

if (!env.DISCORD_TOKEN || !env.WORKER_ORIGIN) {
  throw Error("Missing required environment variables. Refer to README.");
}

const rest = new REST().setToken(env.DISCORD_TOKEN);
const manager = new WebSocketManager({
  token: env.DISCORD_TOKEN,
  intents: GatewayIntentBits.GuildMembers,
  rest,
  initialPresence: {
    status: PresenceUpdateStatus.Online,
    activities: [
      {
        name: "Custom",
        state: "Road work ahead",
        type: ActivityType.Custom,
      },
    ],
    afk: false,
    since: null,
  },
});

manager.on(WebSocketShardEvents.Ready, (event) => {
  console.log(
    `${event.data.user.username}#${event.data.user.discriminator} ready with ${event.data.shard?.length} shards on ${event.data.guilds.length} guilds`,
  );
});

manager.on(WebSocketShardEvents.Dispatch, async (event) => {
  if (
    [
      GatewayDispatchEvents.GuildMemberAdd,
      GatewayDispatchEvents.GuildMemberRemove,
      // GatewayDispatchEvents.GuildCreate,
    ].includes(event.data.t)
  ) {
    try {
      const response = await fetch(`${env.WORKER_ORIGIN}/ws`, {
        method: "POST",
        body: JSON.stringify(event.data.d),
        headers: {
          Authorization: `Bot ${env.DISCORD_TOKEN}`,
          "X-Boogiehook-Event": event.data.t,
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
