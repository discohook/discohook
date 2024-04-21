import type {
  BaseImageURLOptions,
  ImageExtension,
  REST,
  RawFile,
} from "@discordjs/rest";
import { DiscordSnowflake } from "@sapphire/snowflake";
import {
  RESTError,
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPIWebhookWithTokenMessageResult,
  RESTGetAPIWebhookWithTokenResult,
  RESTPatchAPIWebhookWithTokenJSONBody,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  RESTPatchAPIWebhookWithTokenMessageResult,
  RESTPatchAPIWebhookWithTokenResult,
  RESTPostAPIWebhookWithTokenJSONBody,
  RESTPostAPIWebhookWithTokenWaitResult,
  Routes,
} from "discord-api-types/v10";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";

export const DISCORD_API = "https://discord.com/api";
export const DISCORD_API_V = "10";

export const DISCORD_BOT_TOKEN_RE =
  /^[a-zA-Z0-9_-]{23,28}\.[a-zA-Z0-9_-]{6,7}\.[a-zA-Z0-9_-]{27,}$/;

export const getSnowflakeDate = (snowflake: string) =>
  new Date(Number(DiscordSnowflake.deconstruct(snowflake).timestamp));

export const discordRequest = async (
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  route: `/${string}`,
  options?: {
    query?: URLSearchParams;
    init?: Omit<RequestInit, "method">;
  },
) => {
  const search = options?.query ? `?${options.query.toString()}` : "";
  const init = options?.init ?? {};

  return await fetch(`${DISCORD_API}/v${DISCORD_API_V}${route}${search}`, {
    method,
    ...init,
  });
};

export const getWebhook = async (id: string, token: string) => {
  const data = await discordRequest("GET", `/webhooks/${id}/${token}`);
  return (await data.json()) as RESTGetAPIWebhookWithTokenResult;
};

export const getWebhookMessage = async (
  webhookId: string,
  webhookToken: string,
  messageId: string,
  threadId?: string,
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

export const executeWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: RESTPostAPIWebhookWithTokenJSONBody,
  files?: RawFile[],
  threadId?: string,
  rest?: REST,
) => {
  const query = new URLSearchParams({ wait: "true" });
  if (threadId) {
    query.set("thread_id", threadId);
  }

  if (rest) {
    return (await rest.post(Routes.webhook(webhookId, webhookToken), {
      body: payload,
      files,
    })) as RESTPostAPIWebhookWithTokenWaitResult;
  }

  const data = await discordRequest(
    "POST",
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      query,
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type":
            files && files.length > 0
              ? "multipart/form-data"
              : "application/json",
        },
        // files,
      },
    },
  );

  return (await data.json()) as RESTPostAPIWebhookWithTokenWaitResult;
};

export const updateWebhookMessage = async (
  webhookId: string,
  webhookToken: string,
  messageId: string,
  payload: RESTPatchAPIWebhookWithTokenMessageJSONBody,
  files?: RawFile[],
  threadId?: string,
  rest?: REST,
) => {
  const query = new URLSearchParams();
  if (threadId) {
    query.set("thread_id", threadId);
  }

  if (rest) {
    return (await rest.patch(
      Routes.webhookMessage(webhookId, webhookToken, messageId),
      {
        body: payload,
        files,
      },
    )) as RESTPatchAPIWebhookWithTokenMessageResult;
  }

  const data = await discordRequest(
    "PATCH",
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    {
      query,
      init: {
        body: JSON.stringify(payload),
        // files,
        headers: {
          "Content-Type":
            files && files.length > 0
              ? "multipart/form-data"
              : "application/json",
        },
      },
    },
  );

  return (await data.json()) as RESTPatchAPIWebhookWithTokenMessageResult;
};

export const modifyWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: RESTPatchAPIWebhookWithTokenJSONBody,
  reason?: string,
) => {
  const data = await discordRequest(
    "PATCH",
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          ...(reason
            ? {
                "X-Audit-Log-Reason": reason,
              }
            : {}),
        },
      },
    },
  );

  return (await data.json()) as RESTPatchAPIWebhookWithTokenResult;
};

export const getCurrentUserGuilds = async (accessToken: string) => {
  const data = await discordRequest("GET", "/users/@me/guilds", {
    init: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return (await data.json()) as RESTGetAPICurrentUserGuildsResult;
};

export const getApplicationRpc = async (id: string) => {
  const data = await discordRequest("GET", `/applications/${id}/rpc`);
  return (await data.json()) as RESTGetAPIApplicationRpcResult;
};

class CDN {
  readonly BASE = "https://cdn.discordapp.com";

  _withOpts(
    options: BaseImageURLOptions | undefined,
    defaultSize?: BaseImageURLOptions["size"],
  ): string {
    return `.${options?.extension ?? "webp"}?size=${
      options?.size ?? defaultSize ?? 1024
    }`;
  }

  avatar(
    id: string,
    avatarHash: string,
    options?: BaseImageURLOptions,
  ): string {
    return `${this.BASE}/avatars/${id}/${avatarHash}${this._withOpts(options)}`;
  }

  defaultAvatar(index: number): string {
    return `${this.BASE}/embed/avatars/${index}.png`;
  }

  emoji(id: string, extension?: ImageExtension): string {
    return `${this.BASE}/emojis/${id}${extension ? `.${extension}` : ""}`;
  }

  icon(id: string, iconHash: string, options?: BaseImageURLOptions): string {
    return `${this.BASE}/icons/${id}/${iconHash}${this._withOpts(options)}`;
  }

  appIcon(id: string, iconHash: string, options?: BaseImageURLOptions): string {
    return `${this.BASE}/app-icons/${id}/${iconHash}${this._withOpts(options)}`;
  }
}

export const cdn = new CDN();

export const botAppAvatar = (
  app: {
    applicationId: bigint | string;
    applicationUserId: bigint | string | null;
    icon?: string | null;
    avatar?: string | null;
    discriminator?: string | null;
  },
  options?: BaseImageURLOptions,
) => {
  if (app.applicationUserId) {
    if (!app.avatar) {
      return cdn.defaultAvatar(
        app.discriminator === "0" || !app.discriminator
          ? Number((BigInt(app.applicationUserId) >> BigInt(22)) % BigInt(6))
          : Number(app.discriminator) % 5,
      );
    } else {
      return cdn.avatar(String(app.applicationUserId), app.avatar, options);
    }
  }
  if (app.icon) {
    return cdn.appIcon(String(app.applicationId), app.icon, options);
  }
  // Discord doesn't actually do this, but the alternative is a static value
  // that usually doesn't match the bot default avatar
  return cdn.defaultAvatar(
    Number((BigInt(app.applicationId) >> BigInt(22)) % BigInt(6)),
  );
};

interface DiscordError {
  code: number;
  rawError: RESTError;
  status: number;
  method: string;
  url: string;
}

export const isDiscordError = (error: any): error is DiscordError => {
  return "code" in error && "rawError" in error;
};
