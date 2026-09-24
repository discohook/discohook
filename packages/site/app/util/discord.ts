import {
  type BaseImageURLOptions,
  calculateUserDefaultAvatarIndex,
  type ImageExtension,
  type RawFile,
  RequestMethod,
  type REST,
} from "@discordjs/rest";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIComponentInContainer,
  type APIContainerComponent,
  type APIEmbed,
  type APIMediaGalleryItem,
  type APIMessage,
  type APIMessageComponent,
  type APISectionComponent,
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
import {
  MessageFlagsBitField,
  PermissionFlags,
  type PermissionsBitField,
} from "discord-bitflag";
import { getDate, isSnowflake, type Snowflake } from "discord-snowflake";
import { z } from "zod";
import type { TimestampStyle } from "~/components/editor/TimePicker";
import type { DraftFile } from "~/routes/_index";
import type { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import type {
  APIButtonComponentWithURL,
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
} from "~/types/QueryData";
import type {
  APIAttachment,
  QueryDataMessageDataRaw,
} from "~/types/QueryData-raw";
import { MAX_TOTAL_COMPONENTS, MAX_V1_ROWS } from "./constants";
import { transformFileName } from "./files";
import { sleep } from "./time";

export const DISCORD_API = "https://discord.com/api";
export const DISCORD_API_V = "10";

export const DISCORD_BOT_TOKEN_RE =
  /^[a-zA-Z0-9_-]{23,28}\.[a-zA-Z0-9_-]{6,7}\.[a-zA-Z0-9_-]{27,}$/;

export const getSnowflakeDate = (snowflake: string) =>
  getDate(snowflake as Snowflake);

export type DraftRawFile = DraftFile & Pick<RawFile, "key">;

export const discordRequest = async <T>(
  method: RequestMethod,
  route: `/${string}`,
  options?: {
    query?: URLSearchParams;
    files?: DraftRawFile[];
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
      for (const { file, key } of options.files) {
        files.push({
          key,
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

  let body: BodyInit | null | undefined;
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
    for (const { file, key } of options.files) {
      body.append(key ?? `files[${i}]`, file, file.name);
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

export const cascadeFileNameChangeEmbeds = (
  files: { oldName: string; newName: string; newUri?: string }[],
  embeds: Pick<APIEmbed, "author" | "image" | "thumbnail" | "footer">[],
) => {
  if (files.length === 0) return embeds;

  const newEmbeds = structuredClone(embeds);
  for (const {
    oldName,
    newName,
    newUri = `attachment://${transformFileName(newName)}`,
  } of files) {
    const uri = `attachment://${transformFileName(oldName)}`;
    if (uri === newUri) continue;

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

export const cascadeFileNameChangeComponents = (
  files: { oldName: string; newName: string; newUri?: string }[],
  components: APIMessageTopLevelComponent[],
) => {
  if (files.length === 0) return components;

  const newComponents = structuredClone(components);
  const applicable = extractComponentsByType(newComponents, [
    ComponentType.File,
    ComponentType.MediaGallery,
    ComponentType.Thumbnail,
  ]);
  for (const {
    oldName,
    newName,
    newUri = `attachment://${transformFileName(newName)}`,
  } of files) {
    const uri = `attachment://${transformFileName(oldName)}`;
    if (uri === newUri) continue;

    for (const component of applicable) {
      switch (component.type) {
        case ComponentType.File:
          if (component.file.url.trim() === uri) component.file.url = newUri;
          break;
        case ComponentType.Thumbnail:
          if (component.media.url.trim() === uri) component.media.url = newUri;
          break;
        case ComponentType.MediaGallery:
          for (const item of component.items) {
            if (item.media.url.trim() === uri) item.media.url = newUri;
          }
          break;
        default:
          break;
      }
    }
  }
  return newComponents;
};

export const createFakeWaveform = (): string => {
  // basically empty waveform with no audio
  // spikes. this resolves to `AA==`
  const array = new Uint8Array(1).fill(0);
  try {
    // @ts-expect-error baseline 2025
    return array.toBase64({ alphabet: "base64" });
  } catch {
    return btoa(new TextDecoder("utf8").decode(array));
  }
};

const apiAttachmentsToPayloadAttachments = (
  attachments: APIAttachment[],
  isThread?: boolean,
): NonNullable<RESTPostAPIWebhookWithTokenJSONBody["attachments"]> =>
  attachments.map((attachment) => ({
    id: attachment.id,
    // id: String(i),
    filename: attachment.spoiler
      ? `SPOILER_${attachment.filename}`
      : attachment.filename,
    description: attachment.description,
    flags: attachment.flags,
    // This is undocumented! Therefore we are taking precautions:
    // Only provide any value when it is true and the user is creating a
    // thread; narrows erroneous behavior if is_thumbnail suddenly gets
    // blocked for example - users can simply not mark files as thumbnails
    // instead of requiring an immediate patch.
    is_thumbnail: attachment.is_thumbnail && isThread ? true : undefined,
    // It's not officially supported for webhooks to send voice messages.
    // Hopefully this does not cause issues down the line with regular audio
    // files - I expect discord will just ignore it if N/A.
    duration_secs: attachment.duration_secs,
    waveform:
      attachment.waveform ??
      (attachment.duration_secs !== undefined
        ? createFakeWaveform()
        : undefined),
  }));

export const executeWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: RESTPostAPIWebhookWithTokenJSONBody,
  options: {
    files?: DraftRawFile[];
    attachments?: APIAttachment[];
    threadId?: string;
    rest?: REST;
    withComponents?: boolean;
  },
) => {
  const { files, attachments, threadId, rest, withComponents } = options;

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

  const localAttachments =
    attachments?.filter((a) => !a.url || a.url.startsWith("blob:")) ?? [];
  if (attachments) {
    const renameConfig = attachments.map(
      ({ filename, url, spoiler, placement_count, is_thumbnail }) => {
        if (!url || url.startsWith("blob:")) {
          if (spoiler) {
            return { oldName: filename, newName: `SPOILER_${filename}` };
          }
        } else if (placement_count && !is_thumbnail) {
          // This is a remote attachment which is only used as a reference within embeds/display
          // components. We have no reason to download and reupload it as an attachment. With CV2,
          // this should be somewhat rare, since it would only happen if someone manually pasted an
          // attachment URI.
          return { oldName: filename, newName: filename, newUri: url };
        }
        return { oldName: filename, newName: filename };
      },
    );
    if (payload.embeds) {
      payload.embeds = cascadeFileNameChangeEmbeds(
        renameConfig,
        payload.embeds,
      );
    }
    if (payload.components) {
      payload.components = cascadeFileNameChangeComponents(
        renameConfig,
        payload.components,
      );
    }
    payload.attachments = apiAttachmentsToPayloadAttachments(
      localAttachments,
      payload.thread_name !== undefined,
    );
  }

  if (rest) {
    const rawFiles: RawFile[] = [];
    if (files) {
      for (const { id, file, key } of files) {
        const spoiler = localAttachments.find((a) => a.id === id)?.spoiler;
        rawFiles.push({
          key,
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
  options: {
    files?: DraftRawFile[];
    attachments?: APIAttachment[];
    threadId?: string;
    rest?: REST;
    withComponents?: boolean;
  },
) => {
  const { files, attachments, threadId, rest, withComponents } = options;

  const query = new URLSearchParams();
  if (threadId) {
    query.set("thread_id", threadId);
  }
  if (withComponents !== undefined) {
    query.set("with_components", String(withComponents));
  }

  const localAttachments =
    attachments?.filter((a) => !a.url || a.url.startsWith("blob:")) ?? [];
  if (attachments) {
    const renameConfig = attachments.map(
      ({ filename, url, spoiler, placement_count, is_thumbnail }) => {
        if (!url || url.startsWith("blob:")) {
          if (spoiler) {
            return { oldName: filename, newName: `SPOILER_${filename}` };
          }
        } else if (placement_count && !is_thumbnail) {
          // See comment in executeWebhook
          return { oldName: filename, newName: filename, newUri: url };
        }
        return { oldName: filename, newName: filename };
      },
    );
    if (payload.embeds) {
      payload.embeds = cascadeFileNameChangeEmbeds(
        renameConfig,
        payload.embeds,
      );
    }
    if (payload.components) {
      payload.components = cascadeFileNameChangeComponents(
        renameConfig,
        payload.components,
      );
    }
    payload.attachments = apiAttachmentsToPayloadAttachments(
      localAttachments,
      threadId !== undefined,
    );
  }

  if (rest) {
    const rawFiles: RawFile[] = [];
    if (files) {
      for (const { id, file, key } of files) {
        const spoiler = localAttachments.find((a) => a.id === id)?.spoiler;
        rawFiles.push({
          key,
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
    const params = new URLSearchParams({
      size: String(options?.size ?? defaultSize ?? 1024),
    });
    // It seems like this is a fine assumption to make. Emojis with .gif don't
    // work anymore - avatars & icons do, but their animated webp counterparts
    // work fine and load faster.
    if (options?.extension === "gif") {
      options.extension = "webp";
      params.set("animated", "true");
    }
    return `.${options?.extension ?? "webp"}?${params}`;
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

  banner(
    id: string,
    bannerHash: string,
    options?: BaseImageURLOptions,
  ): string {
    return `${this.BASE}/banners/${id}/${bannerHash}${this._withOpts(options)}`;
  }

  guildMemberAvatar(
    guildId: string,
    id: string,
    avatarHash: string,
    options?: BaseImageURLOptions,
  ): string {
    return `${this.BASE}/guilds/${guildId}/users/${id}/avatars/${avatarHash}${this._withOpts(options)}`;
  }

  guildMemberBanner(
    guildId: string,
    id: string,
    avatarHash: string,
    options?: BaseImageURLOptions,
  ): string {
    return `${this.BASE}/guilds/${guildId}/users/${id}/banners/${avatarHash}${this._withOpts(options)}`;
  }

  emoji(id: string, extension?: ImageExtension): string {
    return `${this.BASE}/emojis/${id}${extension ? this._withOpts({ extension, size: 240 }) : ""}`;
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
  method: RequestMethod;
  url: string;
}

const RESTErrorSchema: z.ZodType<RESTError> = z.object({
  code: z.number().int(),
  message: z.string(),
});

export const isDiscordError = (error: any): error is DiscordError => {
  return "code" in error && "rawError" in error;
};

export const isErrorData = (data: any): data is RESTError =>
  RESTErrorSchema.safeParse(data).success;

export interface RESTErrorContext {
  guild?: {
    id: string;
    name?: string;
    icon?: string;
  };
  channel?: {
    id: string;
    name?: string;
  };
  required_permissions?: string;
}

export type RESTErrorWithContext = RESTError & {
  context?: RESTErrorContext;
};

export const injectErrorContext = (
  error: RESTError,
  context: {
    guildId?: string | bigint;
    channelId?: string | bigint;
    permissions?: string | bigint | PermissionsBitField;
  } & RESTErrorContext,
): RESTErrorWithContext => {
  // shortcuts to prevent unnecessary verbosity in error handlers
  const { guildId, channelId, permissions, ...rest } = context;
  const ctx: RESTErrorContext = rest;
  if (guildId) ctx.guild = { id: String(guildId) };
  if (channelId) ctx.channel = { id: String(channelId) };
  if (permissions) ctx.required_permissions = permissions.toString();
  return { ...error, context: ctx };
};

export const routePermissions = {
  GET: {
    channel: PermissionFlags.ViewChannel,
    channelMessages:
      PermissionFlags.ViewChannel | PermissionFlags.ReadMessageHistory,
    channelMessage:
      PermissionFlags.ViewChannel | PermissionFlags.ReadMessageHistory,
    webhook: PermissionFlags.ManageWebhooks,
    guildWebhooks: PermissionFlags.ManageWebhooks,
    channelWebhooks: PermissionFlags.ManageWebhooks,
  },
  POST: {
    channelMessages: PermissionFlags.ViewChannel | PermissionFlags.SendMessages,
    threads: PermissionFlags.CreatePublicThreads,
    guildWebhooks: PermissionFlags.ManageWebhooks,
    channelWebhooks: PermissionFlags.ManageWebhooks,
  },
  DELETE: {
    webhook: PermissionFlags.ManageWebhooks,
  },
  PATCH: {
    webhook: PermissionFlags.ManageWebhooks,
  },
  PUT: {},
} satisfies Record<RequestMethod, Partial<Record<keyof typeof Routes, bigint>>>;

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
): APIComponentInMessageActionRow[] => {
  return extractComponentsByType(components, [
    ComponentType.Button,
    ComponentType.ChannelSelect,
    ComponentType.MentionableSelect,
    ComponentType.RoleSelect,
    ComponentType.StringSelect,
    ComponentType.UserSelect,
  ]) as APIComponentInMessageActionRow[];
};

// TODO: return type
export const extractComponentsByType = <T extends ComponentType>(
  components: APIMessageTopLevelComponent[],
  types: T[],
) => {
  const match = (c: { type: ComponentType }) => types.includes(c.type as T);
  const found = [];

  for (const component of components) {
    if (match(component)) found.push(component);

    if (component.type === ComponentType.Container) {
      for (const r of component.components) {
        if (match(r)) found.push(r);

        if (r.type === ComponentType.ActionRow) {
          found.push(...r.components.filter(match));
        } else if (r.type === ComponentType.Section && match(r.accessory)) {
          found.push(r.accessory);
        }
      }
    } else if (component.type === ComponentType.ActionRow) {
      found.push(...component.components.filter(match));
    } else if (
      component.type === ComponentType.Section &&
      match(component.accessory)
    ) {
      found.push(component.accessory);
    }
  }
  return found;
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

export const convertMessageToComponents = (
  message: QueryDataMessageDataRaw,
) => {
  const flags = new MessageFlagsBitField(message.flags ?? 0);
  if (flags.has(MessageFlags.IsComponentsV2)) return message;
  flags.add(MessageFlags.IsComponentsV2);

  const { content, embeds, components, flags: _, ...keepData } = message;
  const data: QueryDataMessageDataRaw = {
    flags: Number(flags.value),
    ...keepData,
  };

  data.components = [];
  if (content) {
    data.components.push({ type: ComponentType.TextDisplay, content });
  }
  for (const embed of embeds ?? []) {
    const container: APIContainerComponent = {
      type: ComponentType.Container,
      accent_color: embed.color,
      components: [],
    };

    if (embed.author) {
      container.components.push({
        type: ComponentType.TextDisplay,
        content: embed.author.url
          ? `-# [${embed.author.name}](${embed.author.url})`
          : `-# ${embed.author.name}`,
      });
    }

    const addBody = <T extends typeof container.components>(
      components: T,
    ): T => {
      if (embed.title) {
        components.push({
          type: ComponentType.TextDisplay,
          content: embed.url
            ? `### [${embed.title}](${embed.url})`
            : `### ${embed.title}`,
        });
      }
      if (embed.description) {
        // This alone may push the message over the text limit (4096 vs 4000)
        // In an effort to minimize loss, I'm choosing not to strip the text.
        // It won't fail zod validation, but it will fail when the user sends
        // it to Discord
        components.push({
          type: ComponentType.TextDisplay,
          content: embed.description,
        });
      }
      if (embed.fields?.length) {
        components.push({
          type: ComponentType.TextDisplay,
          content: embed.fields
            .map((field) => `**${field.name}**\n\n${field.value}`)
            .join("\n"),
        });
      }
      return components;
    };

    if (embed.thumbnail) {
      const filename = embed.thumbnail.url.split("/").slice(-1)[0];
      container.components.push({
        type: ComponentType.Section,
        components: addBody([]),
        accessory: {
          type: ComponentType.Thumbnail,
          media: embed.thumbnail,
          spoiler: filename.startsWith("SPOILER_"),
        },
      });
    } else {
      addBody(container.components);
    }

    if (embed.image) {
      const filename = embed.image.url.split("/").slice(-1)[0];
      const item: APIMediaGalleryItem = {
        media: embed.image,
        spoiler: filename.startsWith("SPOILER_"),
      };
      const extantGallery = container.components.find(
        (c) => c.type === ComponentType.MediaGallery,
      );
      if (extantGallery) {
        extantGallery.items.push(item);
      } else {
        container.components.push({
          type: ComponentType.MediaGallery,
          items: [item],
        });
      }
    }
    if (embed.video?.url) {
      container.components.push({
        type: ComponentType.MediaGallery,
        items: [{ media: { ...embed.video, url: embed.video.url } }],
      });
    }

    if (embed.footer) {
      container.components.push({
        type: ComponentType.TextDisplay,
        content: `-# ${embed.footer.text}`,
      });
    }

    data.components.push(container);
  }

  // Only going to be action rows
  if (components) {
    data.components.push(...components);
  }

  return data;
};

const hexTimestampToDate = (hex: string): Date =>
  new Date(Number.parseInt(hex.replace(/^0x/i, ""), 16) * 1000);

export const parseAttachmentParams = (params: URLSearchParams) => {
  const ex = params.get("ex");
  const is = params.get("is");
  const hm = params.get("hm");
  return {
    ex: ex ? hexTimestampToDate(ex) : null,
    is: is ? hexTimestampToDate(is) : null,
    hm,
    sv: params.get("sv") === "1",
  };
};

export const parseAttachmentUrl = (url: string) => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw Error(`Invalid attachment URL: ${url}`);
  }
  const [_, __, channelId, attachmentId, filename] = parsed.pathname.split("/");
  return {
    channelId,
    attachmentId,
    filename,
    ...parseAttachmentParams(parsed.searchParams),
  };
};

export const isDiscordAttachmentUrl = (url: string | URL): boolean => {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  return (
    ["media.discordapp.net", "cdn.discordapp.com"].includes(u.hostname) &&
    u.pathname.startsWith("/attachments")
  );
};
