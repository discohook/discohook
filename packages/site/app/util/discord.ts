import {
  type BaseImageURLOptions,
  type ImageExtension,
  type REST,
  type RawFile,
  RequestMethod,
  calculateUserDefaultAvatarIndex,
} from "@discordjs/rest";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithSKUId,
  APIMessageComponent,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
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
import { Snowflake, getDate, isSnowflake } from "discord-snowflake";
import { TimestampStyle } from "~/components/editor/TimePicker";
import { DraftFile } from "~/routes/_index";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";

export const DISCORD_API = "https://discord.com/api";
export const DISCORD_API_V = "10";

export const DISCORD_BOT_TOKEN_RE =
  /^[a-zA-Z0-9_-]{23,28}\.[a-zA-Z0-9_-]{6,7}\.[a-zA-Z0-9_-]{27,}$/;

export const getSnowflakeDate = (snowflake: string) =>
  getDate(snowflake as Snowflake);

export const discordRequest = async <T>(
  method: RequestMethod,
  route: `/${string}`,
  options?: {
    query?: URLSearchParams;
    files?: DraftFile[];
    init?: Omit<RequestInit, "method">;
    rest?: REST;
  },
): Promise<T> => {
  const search = options?.query ? `?${options.query.toString()}` : "";
  const init = options?.init ?? {};
  const headers = init.headers ? new Headers(init.headers) : new Headers();

  if (options?.rest) {
    const files: RawFile[] = [];
    if (options.files) {
      for (const { file } of options.files) {
        files.push({
          name: file.name,
          contentType: file.type,
          data: await file.bytes(),
        });
      }
    }

    const response = await options.rest.request({
      method,
      fullRoute: route,
      query: options.query,
      // headers,
      files: files.length === 0 ? undefined : files,
      body: options.init?.body,
    });
    return response as T;
  }

  let body = undefined;
  if (options?.files && options?.files.length !== 0) {
    // Browser must set this header on its own along with `boundary`
    headers.delete("Content-Type");

    body = new FormData();
    const payload = options.init?.body
      ? JSON.parse(options.init?.body?.toString())
      : {};
    // payload.attachments = payload.attachments ?? [];
    // options.files.forEach(({ description }, id) =>
    //   payload.attachments?.push({ id, description }),
    // );
    body.set("payload_json", JSON.stringify(payload));

    let i = 0;
    for (const { file } of options.files) {
      body.append(`file[${i}]`, file, file.name);
      i += 1;
    }
  } else {
    body = init.body;
  }

  const response = await fetch(
    `${DISCORD_API}/v${DISCORD_API_V}${route}${search}`,
    { method, ...init, headers, body },
  );
  return (await response.json()) as T;
};

export const getWebhook = async (id: string, token: string, rest?: REST) => {
  const data = await discordRequest<RESTGetAPIWebhookWithTokenResult>(
    RequestMethod.Get,
    `/webhooks/${id}/${token}`,
    { rest },
  );
  return data;
};

export const getWebhookMessage = async (
  webhookId: string,
  webhookToken: string,
  messageId: string,
  threadId?: string,
  rest?: REST,
) => {
  const query = threadId
    ? new URLSearchParams({ thread_id: threadId })
    : undefined;
  const data = await discordRequest<RESTGetAPIWebhookWithTokenMessageResult>(
    RequestMethod.Get,
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    { query, rest },
  );
  return data;
};

export const executeWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: RESTPostAPIWebhookWithTokenJSONBody,
  files?: DraftFile[],
  threadId?: string,
  rest?: REST,
) => {
  const query = new URLSearchParams({ wait: "true" });
  if (threadId) {
    query.set("thread_id", threadId);
  }

  if (rest) {
    const rawFiles: RawFile[] = [];
    if (files) {
      for (const { file } of files) {
        rawFiles.push({
          name: file.name,
          contentType: file.type,
          data: Buffer.from(await file.arrayBuffer()),
        });
      }
    }

    return (await rest.post(Routes.webhook(webhookId, webhookToken), {
      body: payload,
      files: rawFiles.length === 0 ? undefined : rawFiles,
    })) as RESTPostAPIWebhookWithTokenWaitResult;
  }

  const data = await discordRequest<RESTPostAPIWebhookWithTokenWaitResult>(
    RequestMethod.Post,
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      query,
      files,
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type":
            files && files.length > 0
              ? "multipart/form-data"
              : "application/json",
        },
      },
    },
  );

  return data;
};

export const updateWebhookMessage = async (
  webhookId: string,
  webhookToken: string,
  messageId: string,
  payload: RESTPatchAPIWebhookWithTokenMessageJSONBody,
  files?: DraftFile[],
  threadId?: string,
  rest?: REST,
) => {
  const query = new URLSearchParams();
  if (threadId) {
    query.set("thread_id", threadId);
  }

  if (rest) {
    const rawFiles: RawFile[] = [];
    if (files) {
      for (const { file } of files) {
        rawFiles.push({
          name: file.name,
          contentType: file.type,
          data: Buffer.from(await file.arrayBuffer()),
        });
      }
    }

    return (await rest.patch(
      Routes.webhookMessage(webhookId, webhookToken, messageId),
      {
        query,
        body: payload,
        files: rawFiles.length === 0 ? undefined : rawFiles,
      },
    )) as RESTPatchAPIWebhookWithTokenMessageResult;
  }

  const data = await discordRequest<RESTPatchAPIWebhookWithTokenMessageResult>(
    RequestMethod.Patch,
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    {
      query,
      files,
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type":
            files && files.length > 0
              ? "multipart/form-data"
              : "application/json",
        },
      },
    },
  );

  return data;
};

export const modifyWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: RESTPatchAPIWebhookWithTokenJSONBody,
  reason?: string,
  rest?: REST,
) => {
  const data = await discordRequest<RESTPatchAPIWebhookWithTokenResult>(
    RequestMethod.Patch,
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      rest,
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
  return data;
};

export const getCurrentUserGuilds = async (accessToken: string) => {
  const data = await discordRequest<RESTGetAPICurrentUserGuildsResult>(
    RequestMethod.Get,
    "/users/@me/guilds",
    {
      init: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );

  return data;
};

export const getApplicationRpc = async (id: string, rest?: REST) => {
  const data = await discordRequest<RESTGetAPIApplicationRpcResult>(
    RequestMethod.Get,
    `/applications/${id}/rpc`,
    { rest },
  );
  return data;
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

  roleIcon(
    id: string,
    iconHash: string,
    options?: BaseImageURLOptions,
  ): string {
    return `${this.BASE}/role-icons/${id}/${iconHash}${this._withOpts(
      options,
    )}`;
  }
}

export const cdn = new CDN();

export const cdnImgAttributes = (
  base: BaseImageURLOptions["size"],
  generate: (size?: BaseImageURLOptions["size"]) => string | undefined,
) => {
  if (generate()) {
    return {
      src: generate(base),
      // srcSet: `${generate(
      //   base
      //     ? (Math.min(base * 2, 4096) as BaseImageURLOptions["size"])
      //     : undefined,
      // )} 2x`,

      // Is this really necessary?
      srcSet: base
        ? `
          ${generate(16)} ${16 / base}x,
          ${generate(32)} ${32 / base}x,
          ${generate(64)} ${64 / base}x,
          ${generate(128)} ${128 / base}x,
          ${generate(256)} ${256 / base}x,
          ${generate(512)} ${512 / base}x,
          ${generate(1024)} ${1024 / base}x,
          ${generate(2048)} ${2048 / base}x
        `.trim()
        : "",
      // srcSet: `
      //   ${generate(16)} 16w,
      //   ${generate(128)} 128w,
      //   ${generate(256)} 256w,
      //   ${generate(1024)} 1024w,
      //   ${generate(2048)} 2048w
      // `.trim(),
      // sizes: `
      // `.trim()
    };
  }
};

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

export const webhookAvatarUrl = (
  webhook: { id: string; avatar: string | null },
  options?: BaseImageURLOptions,
): string => {
  if (webhook.avatar) {
    return cdn.avatar(webhook.id, webhook.avatar, options);
  } else {
    return cdn.defaultAvatar(calculateUserDefaultAvatarIndex(webhook.id));
  }
};

export const characterAvatars = [
  "new-blue-1",
  "new-blue-2",
  "new-blue-3",
  "new-green-1",
  "new-green-2",
  "new-yellow-1",
  "new-yellow-2",
  "new-yellow-3",
];

export const getCharacterAvatarUrl = (key: string) =>
  `/discord-avatars/${key}.png`;

export const time = (date: Date | number, style?: TimestampStyle) => {
  const stamp = Math.floor(new Date(date).getTime() / 1000);
  return `<t:${stamp}:${style ?? "f"}>`;
};

export const isSnowflakeSafe = (id: string): id is `${bigint}` => {
  try {
    return isSnowflake(id);
  } catch {
    return false;
  }
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

export const isSkuButton = (
  component: Pick<APIButtonComponent, "type" | "style">,
): component is APIButtonComponentWithSKUId =>
  component.type === ComponentType.Button &&
  component.style === ButtonStyle.Premium;

export const hasCustomId = (
  component: APIMessageComponent,
): component is APIButtonComponentWithCustomId | APISelectMenuComponent =>
  (component.type === ComponentType.Button &&
    !isSkuButton(component) &&
    !isLinkButton(component)) ||
  component.type === ComponentType.StringSelect ||
  component.type === ComponentType.RoleSelect ||
  component.type === ComponentType.UserSelect ||
  component.type === ComponentType.ChannelSelect ||
  component.type === ComponentType.MentionableSelect;
