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
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  APIComponentInContainer,
  APIContainerComponent,
  APIEmbed,
  type APIMessage,
  type APIMessageComponent,
  APISectionComponent,
  type APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type RESTError,
  type RESTGetAPICurrentUserGuildsResult,
  type RESTGetAPIWebhookWithTokenMessageResult,
  type RESTGetAPIWebhookWithTokenResult,
  type RESTPatchAPIWebhookWithTokenJSONBody,
  type RESTPatchAPIWebhookWithTokenMessageJSONBody,
  type RESTPatchAPIWebhookWithTokenMessageResult,
  type RESTPatchAPIWebhookWithTokenResult,
  type RESTPostAPIWebhookWithTokenJSONBody,
  type RESTPostAPIWebhookWithTokenWaitResult,
  Routes,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import { Snowflake, getDate, isSnowflake } from "discord-snowflake";
import { TimestampStyle } from "~/components/editor/TimePicker";
import { DraftFile } from "~/routes/_index";
import type {
  APIButtonComponentWithURL,
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
} from "~/types/QueryData";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import { MAX_TOTAL_COMPONENTS, MAX_V1_ROWS } from "./constants";
import { transformFileName } from "./files";
import { sleep } from "./time";

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
      body.append(`files[${i}]`, file, file.name);
      i += 1;
    }
  } else {
    body = init.body;
  }

  let tries = 0;
  while (tries < 5) {
    tries += 1;
    const response = await fetch(
      `${DISCORD_API}/v${DISCORD_API_V}${route}${search}`,
      { method, ...init, headers, body },
    );
    // TODO: bucket cache to prevent 429s entirely
    const rHeaders = response.headers;
    if (response.status === 429) {
      const bucket = rHeaders.get("X-RateLimit-Bucket");
      const resetAfter = Number(
        rHeaders.get("X-RateLimit-Reset-After") || rHeaders.get("Reset-After"),
      );
      if (!Number.isNaN(resetAfter) && resetAfter > 0) {
        console.log(
          `Rate limited on bucket ${bucket} for ${resetAfter}s (waiting). ${tries}/5`,
        );
        await sleep(Math.max(1, resetAfter) * 1000 + tries);
        continue;
      }
    }
    return (await response.json()) as T;
  }
  throw Error(`Failed to receive a good response for ${method} ${route}`);
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

const cascadeFileNameChange = (
  files: { oldName: string; newName: string }[],
  embeds: APIEmbed[],
) => {
  if (files.length === 0) return embeds;

  const newEmbeds = structuredClone(embeds);
  for (const { oldName, newName } of files) {
    const uri = `attachment://${transformFileName(oldName)}`;
    const newUri = `attachment://${transformFileName(newName)}`;
    for (const embed of newEmbeds) {
      if (embed.author?.icon_url?.trim() === uri) {
        embed.author.icon_url = newUri;
      }
      if (embed.image?.url?.trim() === uri) {
        embed.image.url = newUri;
      }
      if (embed.thumbnail?.url?.trim() === uri) {
        embed.thumbnail.url = newUri;
      }
      if (embed.footer?.icon_url?.trim() === uri) {
        embed.footer.icon_url = newUri;
      }
    }
  }
  return newEmbeds;
};

export const executeWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: RESTPostAPIWebhookWithTokenJSONBody,
  files?: DraftFile[],
  threadId?: string,
  rest?: REST,
  withComponents?: boolean,
) => {
  const query = new URLSearchParams({ wait: "true" });
  if (threadId) {
    query.set("thread_id", threadId);
  }
  if (withComponents !== undefined) {
    query.set("with_components", String(withComponents));
  }

  // Avoid possible error from stale data
  const flags = new MessageFlagsBitField(payload.flags ?? 0);
  if (flags.has(MessageFlags.IsComponentsV2)) {
    payload.content = undefined;
    payload.embeds = undefined;
    payload.poll = undefined;
  }

  if (files && payload.embeds) {
    payload.embeds = cascadeFileNameChange(
      files
        .filter(({ spoiler }) => spoiler)
        .map(({ file }) => ({
          oldName: file.name,
          newName: `SPOILER_${file.name}`,
        })),
      payload.embeds,
    );
  }

  if (files && !payload.attachments) {
    payload.attachments = files.map((file, i) => ({
      id: i,
      description: file.description,
      filename: file.spoiler ? `SPOILER_${file.file.name}` : file.file.name,
      // This is undocumented! Therefore we are taking precautions:
      // Only provide any value when it is true and the user is creating a
      // thread; narrows erroneous behavior if is_thumbnail suddenly gets
      // blocked for example - users can simply not mark files as thumbnails
      // instead of requiring an immediate patch.
      is_thumbnail: file.is_thumbnail && payload.thread_name ? true : undefined,
    }));
  }

  if (rest) {
    const rawFiles: RawFile[] = [];
    if (files) {
      for (const { file, spoiler } of files) {
        rawFiles.push({
          name: spoiler ? `SPOILER_${file.name}` : file.name,
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
  withComponents?: boolean,
) => {
  const query = new URLSearchParams();
  if (threadId) {
    query.set("thread_id", threadId);
  }
  if (withComponents !== undefined) {
    query.set("with_components", String(withComponents));
  }

  if (files && payload.embeds) {
    payload.embeds = cascadeFileNameChange(
      files
        .filter(({ spoiler }) => spoiler)
        .map(({ file }) => ({
          oldName: file.name,
          newName: `SPOILER_${file.name}`,
        })),
      payload.embeds,
    );
  }

  if (files && !payload.attachments) {
    payload.attachments = files.map((file, i) => ({
      id: i,
      description: file.description,
      filename: file.spoiler ? `SPOILER_${file.file.name}` : file.file.name,
      // See comment under `executeWebhook`
      is_thumbnail:
        file.is_thumbnail && threadId !== undefined ? true : undefined,
    }));
  }

  if (rest) {
    const rawFiles: RawFile[] = [];
    if (files) {
      for (const { file, spoiler } of files) {
        rawFiles.push({
          name: spoiler ? `SPOILER_${file.name}` : file.name,
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

export const isActionRow = (
  component: APIMessageTopLevelComponent,
): component is APIActionRowComponent<APIComponentInMessageActionRow> =>
  component.type === ComponentType.ActionRow;

export const onlyActionRows = (
  components: APIMessageTopLevelComponent[],
  /**
   * Also look for action rows within containers,
   * useful if you do not need sibling context.
   */
  includeNested?: boolean,
) => {
  const rows: APIActionRowComponent<APIComponentInMessageActionRow>[] = [];
  if (includeNested) {
    for (const component of components) {
      if (component.type === ComponentType.Container) {
        rows.push(...component.components.filter(isActionRow));
      } else if (component.type === ComponentType.ActionRow) {
        rows.push(component);
      }
    }
  } else {
    rows.push(...components.filter(isActionRow));
  }
  return rows;
};

export const extractInteractiveComponents = (
  components: APIMessageTopLevelComponent[],
) => {
  const children: APIComponentInMessageActionRow[] = [];
  for (const component of components) {
    if (component.type === ComponentType.Container) {
      for (const r of component.components) {
        if (r.type === ComponentType.ActionRow) {
          children.push(...r.components);
        } else if (
          r.type === ComponentType.Section &&
          r.accessory.type === ComponentType.Button
        ) {
          children.push(r.accessory);
        }
      }
    } else if (component.type === ComponentType.ActionRow) {
      children.push(...component.components);
    } else if (
      component.type === ComponentType.Section &&
      component.accessory.type === ComponentType.Button
    ) {
      children.push(component.accessory);
    }
  }
  return children;
};

export const isComponentsV2 = (message: Pick<APIMessage, "flags">): boolean =>
  new MessageFlagsBitField(message.flags ?? 0).has(MessageFlags.IsComponentsV2);

export const isStorableComponent = (
  component:
    | APIComponentInMessageActionRow
    | APIMessageTopLevelComponent
    | APIComponentInContainer,
): component is
  | APIButtonComponentWithCustomId
  | APIButtonComponentWithURL
  | APISelectMenuComponent => {
  return (
    [
      ComponentType.StringSelect,
      ComponentType.ChannelSelect,
      ComponentType.MentionableSelect,
      ComponentType.RoleSelect,
      ComponentType.UserSelect,
    ].includes(component.type) ||
    (component.type === ComponentType.Button &&
      component.style !== ButtonStyle.Premium)
  );
};

export const getTotalComponentsCount = (
  components: APIMessageTopLevelComponent[],
): number =>
  components
    ?.map((c) => 1 + ("components" in c ? c.components.length : 0))
    .reduce((a, b) => a + b, 0) ?? 0;

export const getRemainingComponentsCount = (
  components: APIMessageTopLevelComponent[],
  v2?: boolean,
): number => {
  const isV2 =
    v2 ??
    // Auto detect if not provided
    components.find((c) => c.type !== ComponentType.ActionRow) !== undefined;
  return isV2
    ? MAX_TOTAL_COMPONENTS - getTotalComponentsCount(components)
    : MAX_V1_ROWS - components.length;
};

// not in love with this function name
/**
 * Returns true if the component may house storable components, either
 * immediately (action row), under another layer of components (container),
 * or as the section accessory.
 */
export const isComponentHousable = (
  component: APIMessageComponent,
): component is
  | APIContainerComponent
  | APIActionRowComponent<APIComponentInMessageActionRow>
  | APISectionComponent =>
  [
    ComponentType.Container,
    ComponentType.ActionRow,
    ComponentType.Section,
  ].includes(component.type);
