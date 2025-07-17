import {
  type APIAttachment as _APIAttachment,
  type APIEmbed as _APIEmbed,
  AllowedMentionsTypes,
  type APIAllowedMentions,
  type APIEmbedField,
  type APIMessageTopLevelComponent,
  type MessageFlags,
  type UserFlags,
} from "discord-api-types/v10";
import { z } from "zod";
import { ZodAPITopLevelComponentRaw } from "./components-raw";
import { ZodMessageFlags } from "./discord";

/**
 * Discord may not return `null` but it will accept the value in payloads.
 * We're modifying this type to maintain compatibility with prior Discohook
 * versions, which used `null` instead of `undefined`.
 */
export type APIEmbed = Omit<_APIEmbed, "color"> & { color?: number | null };

/**
 * Extending for media channel thumbnails (this attribute is undocumented,
 * so we try to use it with caution)
 */
export type APIAttachment = _APIAttachment & { is_thumbnail?: boolean };

export const ZodAPIEmbed: z.ZodType<APIEmbed> = z.object({
  // type: z
  //   .enum([
  //     EmbedType.Rich,
  //     EmbedType.Image,
  //     EmbedType.Video,
  //     EmbedType.GIFV,
  //     EmbedType.Article,
  //     EmbedType.Link,
  //     EmbedType.AutoModerationMessage,
  //   ])
  //   .optional(),
  title: z.ostring(),
  description: z.ostring(),
  url: z.ostring(),
  timestamp: z.ostring(),
  color: z
    .onumber()
    .nullable()
    .transform((v) => (v === null ? undefined : v)),
  footer: z.object({ text: z.string(), icon_url: z.ostring() }).optional(),
  image: z.object({ url: z.string() }).optional(),
  thumbnail: z.object({ url: z.string() }).optional(),
  video: z.object({ url: z.string() }).optional(),
  provider: z
    .object({
      name: z.ostring(),
      url: z.ostring(),
    })
    .optional(),
  author: z
    .object({
      name: z.string(),
      url: z.ostring(),
      icon_url: z.ostring(),
    })
    .optional(),
  fields: (
    z.object({
      // Zod cries about these defaults but the resultant types are actually
      // still compatible (non-optional string)
      name: z.string().default(""),
      value: z.string().default(""),
      inline: z.oboolean(),
    }) as z.ZodType<APIEmbedField>
  )
    .array()
    .optional(),
});

/** The version of the query data, defaults to `d2`
 *
 * `d2` is based on Discohook's ~2023 data format, which supports multiple
 * messages and targets. `d2`-versioned data can also include:
 * - `messages[n].webhook_id`
 * - `messages[n].components`
 * - `backup_id`
 *
 * All of these are backwards compatible with pre-2024 Discohook.
 */
export type QueryDataVersion = "d2";

export enum TargetType {
  Webhook = 1,
}

export interface QueryDataRaw {
  version?: QueryDataVersion;
  backup_id?: string;
  messages: {
    _id?: string;
    data: QueryDataMessageDataRaw;
    reference?: string;
    thread_id?: string;
  }[];
  targets?: { type?: TargetType; url: string }[];
}

export interface QueryDataMessageDataRaw {
  username?: string;
  avatar_url?: string;
  author?: {
    /** @deprecated use `data.username` */
    name?: string;
    /** @deprecated use `data.avatar_url` */
    icon_url?: string;
    badge?: string | null;
    flags?: UserFlags;
  };
  content?: string | null;
  embeds?: APIEmbed[] | null;
  attachments?: APIAttachment[];
  components?: APIMessageTopLevelComponent[];
  webhook_id?: string;
  flags?: MessageFlags;
  thread_name?: string;
  allowed_mentions?: APIAllowedMentions;
}

export const ZodAPIAllowedMentions = z.object({
  parse: z.nativeEnum(AllowedMentionsTypes).array().optional(),
  roles: z.string().array().optional(),
  users: z.string().array().optional(),
  // not relevant; discard data
  // replied_user: z.oboolean(),
}) satisfies z.ZodType<APIAllowedMentions>;

export const queryDataMessageDataTransform = (
  value: QueryDataMessageDataRaw,
) => {
  if (!value.username && value.author?.name) {
    value.username = value.author.name;
  }
  if (!value.avatar_url && value.author?.icon_url) {
    value.avatar_url = value.author.icon_url;
  }
  return value;
};

export const ZodQueryDataMessageDataBase = z.object({
  username: z.ostring(),
  avatar_url: z.ostring(),
  author: z
    .object({
      /** @deprecated use `data.username` */
      name: z.ostring(),
      /** @deprecated use `data.avatar_url` */
      icon_url: z.ostring(),
      badge: z.ostring().nullable(),
    })
    .optional(),
  content: z.ostring().nullable(),
  embeds: ZodAPIEmbed.array().nullable().optional(),
  attachments: z
    .object({
      id: z.string(),
      filename: z.string(),
      description: z.ostring(),
      content_type: z.ostring(),
      size: z.number(),
      url: z.string(),
      proxy_url: z.string(),
      height: z.onumber().nullable(),
      weight: z.onumber().nullable(),
      is_thumbnail: z.oboolean(),
    })
    .array()
    .optional(),
  webhook_id: z.ostring(),
  components: ZodAPITopLevelComponentRaw.array().optional(),
  flags: ZodMessageFlags.optional(),
  thread_name: z.ostring(),
  allowed_mentions: ZodAPIAllowedMentions.optional(),
}) satisfies z.ZodType<QueryDataMessageDataRaw>;

export const ZodQueryDataMessageDataRaw = ZodQueryDataMessageDataBase.transform(
  queryDataMessageDataTransform,
);

/** Make zod-transformed payloads compatible with possibly-old API consumers */
export const retrofitQueryData = <T extends QueryDataRaw>(data: T): T => {
  const transformed = structuredClone(data);
  for (const message of transformed.messages) {
    message.data = queryDataMessageDataTransform(message.data);
    if (message.data.avatar_url && !message.data.author?.icon_url) {
      message.data.author = message.data.author ?? {};
      message.data.author.icon_url = message.data.avatar_url;
    }
    if (message.data.username && !message.data.author?.name) {
      message.data.author = message.data.author ?? {};
      message.data.author.name = message.data.username;
    }
  }
  return transformed;
};
