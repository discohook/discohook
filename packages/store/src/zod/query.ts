import { z } from "zod";
import type { APIEmbed, QueryData } from "../types/backups.js";
import { randomString } from "../util/text.js";

export const ZodAPIEmbed: z.ZodType<APIEmbed> = z.object({
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

export const ZodQueryDataMessage = z.object({
  _id: z.string().default(() => randomString(10)),
  data: z.object({
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
      })
      .array()
      .optional(),
    webhook_id: z.ostring(),
    components: z.array(z.any()),
    // components: ZodAPIActionRowComponent.array().optional(),
    flags: z.onumber(),
    thread_name: z.ostring(),
  }),
  reference: z.ostring(),
  thread_id: z.ostring(),
}) satisfies z.ZodType<QueryData["messages"][number]>;

export const ZodLinkQueryDataVersion = z.literal(1);

export const ZodLinkEmbed = z.object({
  title: z.ostring(),
  description: z.ostring(),
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
    })
    .optional(),
  images: z
    .object({
      url: z.string(),
    })
    .array()
    .optional(),
  large_images: z.oboolean(),
  video: z
    .object({
      /** Direct video file or YouTube video */
      url: z.string(),
      height: z.onumber(),
      width: z.onumber(),
    })
    .optional(),
  color: z.onumber(),
});

export const ZodLinkQueryData = z.object({
  version: ZodLinkQueryDataVersion.optional(),
  backup_id: z.ostring(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.ostring() }),
});
