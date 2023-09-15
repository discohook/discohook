import { CDN, REST, RequestData, RouteLike } from "@discordjs/rest";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { APIWebhook } from "discord-api-types/v10";

const rest = new REST({ version: "10" });
export const cdn = new CDN();

export const getSnowflakeDate = (snowflake: string) =>
  new Date(Number(DiscordSnowflake.deconstruct(snowflake).timestamp));

export const discordRequest = async (
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  route: RouteLike,
  options?: RequestData
) => {
  return await rest.options.makeRequest(
    `${rest.options.api}/v${rest.options.version}${route}`,
    {
      method,
      // body: options?.body,
      headers: options?.headers,
    }
  );
};

export const getWebhook = async (id: string, token: string) => {
  const data = await discordRequest("GET", `/webhooks/${id}/${token}`);
  return (await data.json()) as APIWebhook;
};
