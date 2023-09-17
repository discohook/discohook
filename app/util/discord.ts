import { CDN, REST, RequestData, RouteLike } from "@discordjs/rest";
import { DiscordSnowflake } from "@sapphire/snowflake";
import {
  RESTGetAPIWebhookWithTokenMessageResult,
  RESTGetAPIWebhookWithTokenResult,
} from "discord-api-types/v10";

const rest = new REST({ version: "10" });
export const cdn = new CDN();

export const getSnowflakeDate = (snowflake: string) =>
  new Date(Number(DiscordSnowflake.deconstruct(snowflake).timestamp));

export const discordRequest = async (
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  route: RouteLike,
  options?: RequestData
) => {
  const search = options?.query ? "?" + options.query.toString() : ""
  return await rest.options.makeRequest(
    `${rest.options.api}/v${rest.options.version}${route}${search}`,
    {
      method,
      // body: options?.body,
      headers: options?.headers,
    }
  );
};

export const getWebhook = async (id: string, token: string) => {
  const data = await discordRequest("GET", `/webhooks/${id}/${token}`);
  return (await data.json()) as RESTGetAPIWebhookWithTokenResult;
};

export const getWebhookMessage = async (
  webhookId: string,
  webhookToken: string,
  messageId: string,
  threadId?: string
) => {
  const query = threadId
    ? new URLSearchParams({ thread_id: threadId })
    : undefined;
  const data = await discordRequest(
    "GET",
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    { query },
  );
  return (await data.json()) as RESTGetAPIWebhookWithTokenMessageResult;
};
