import { z } from "zod/v3";
import type { APIEmbed, QueryData } from "../types/backups.js";
import { randomString } from "../util/text.js";

export const ZodAPIEmbed: z.ZodType<APIEmbed> = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
  color: z
    .number()
    .optional()
    .nullable()
    .transform((v) => (v === null ? undefined : v)),
  footer: z
    .object({ text: z.string(), icon_url: z.string().optional() })
    .optional(),
  image: z.object({ url: z.string() }).optional(),
  thumbnail: z.object({ url: z.string() }).optional(),
  video: z.object({ url: z.string() }).optional(),
  provider: z
    .object({
      name: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  author: z
    .object({
      name: z.string(),
      url: z.string().optional(),
      icon_url: z.string().optional(),
    })
    .optional(),
  fields: z
    .object({
      name: z.string(),
      value: z.string(),
      inline: z.boolean().optional(),
    })
    .array()
    .optional(),
});

export const ZodQueryDataMessage = z.object({
  _id: z.string().default(() => randomString(10)),
  name: z.string().max(50).optional(),
  data: z.object({
    username: z.string().optional(),
    avatar_url: z.string().optional(),
    author: z
      .object({
        /** @deprecated use `data.username` */
        name: z.string().optional(),
        /** @deprecated use `data.avatar_url` */
        badge: z.string().optional().nullable(),
      })
      .optional(),
    content: z.string().optional().nullable(),
    embeds: ZodAPIEmbed.array().nullable().optional(),
    attachments: z
      .object({
        id: z.string(),
        filename: z.string(),
        description: z.string().optional(),
        content_type: z.string().optional(),
        size: z.number(),
        url: z.string(),
        proxy_url: z.string(),
        height: z.number().optional().nullable(),
        weight: z.number().optional().nullable(),
      })
      .array()
      .optional(),
    webhook_id: z.string().optional(),
    components: z.array(
      z.object({ id: z.number().optional(), type: z.number() }).passthrough(),
    ),
    // components: ZodAPITopLevelComponent.array().optional(),
    flags: z.number().optional(),
    thread_name: z.string().optional(),
  }),
  reference: z.string().optional(),
  thread_id: z.string().optional(),
}) satisfies z.ZodType<QueryData["messages"][number]>;

export const ZodLinkQueryDataVersion = z.literal(1);

export enum LinkEmbedStrategy {
  Link = "link",
  Mastodon = "mastodon",
}

export const ZodLinkEmbedStrategy = z.nativeEnum(LinkEmbedStrategy);

export const ZodLinkEmbed = z.object({
  strategy: ZodLinkEmbedStrategy.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  timestamp: z.string().optional(),
  provider: z
    .object({
      name: z.string().optional(),
      icon_url: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  author: z
    .object({
      name: z.string(),
      icon_url: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  images: z
    .object({
      url: z.string(),
    })
    .array()
    .optional(),
  large_images: z.boolean().optional(),
  video: z
    .object({
      /** Direct video file or YouTube video */
      url: z.string(),
      height: z.number().optional(),
      width: z.number().optional(),
    })
    .optional(),
  color: z.number().optional(),
}) satisfies z.ZodType<APIEmbed>;

export const ZodLinkQueryData = z.object({
  version: ZodLinkQueryDataVersion.optional(),
  backup_id: z.string().optional(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.string().optional() }),
});
