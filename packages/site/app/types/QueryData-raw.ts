import type {
  APIActionRowComponent,
  APIMessageActionRowComponent,
  MessageFlags,
  UserFlags,
  APIAttachment as _APIAttachment,
  APIEmbed as _APIEmbed,
} from "discord-api-types/v10";
import { z } from "zod";
import { ZodAPIActionRowComponentRaw } from "./components-raw";
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
  fields: z
    .object({
      name: z.string(),
      value: z.string(),
      inline: z.oboolean(),
    })
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

export interface QueryDataRaw {
  version?: QueryDataVersion;
  backup_id?: string;
  messages: {
    _id?: string;
    data: {
      author?: {
        name?: string;
        icon_url?: string;
        badge?: string | null;
        flags?: UserFlags;
      };
      content?: string | null;
      embeds?: APIEmbed[] | null;
      attachments?: APIAttachment[];
      components?: APIActionRowComponent<APIMessageActionRowComponent>[];
      webhook_id?: string;
      flags?: MessageFlags;
      thread_name?: string;
    };
    reference?: string;
    thread_id?: string;
  }[];
  targets?: { url: string }[];
}

export const ZodQueryDataMessageDataRaw = z.object({
  author: z
    .object({
      name: z.ostring(),
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
  components: ZodAPIActionRowComponentRaw.array().optional(),
  flags: ZodMessageFlags.optional(),
  thread_name: z.ostring(),
}) satisfies z.ZodType<QueryDataRaw["messages"][number]["data"]>;
