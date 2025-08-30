import { REST } from "@discordjs/rest";
import {
  type RESTGetAPIGatewayBotResult,
  type RESTGetAPIGatewayResult,
  Routes,
} from "discord-api-types/v10";

const shardless = process.argv.includes("--shardless");
const config = Bun.file("./config.json");
const rest = new REST();

if (shardless) {
  const data = (await rest.get(Routes.gateway(), {
    auth: false,
  })) as RESTGetAPIGatewayResult;
  console.log({ shardless, url: data.url });

  await config.write({
    ...(await config.json()),
    ...data,
  });
} else {
  rest.setToken(Bun.env.DISCORD_TOKEN);
  const data = (await rest.get(
    Routes.gatewayBot(),
  )) as RESTGetAPIGatewayBotResult;
  console.log({ shardless, url: data.url, shards: data.shards });

  await config.write({
    ...(await config.json()),
    ...data,
  });
}
