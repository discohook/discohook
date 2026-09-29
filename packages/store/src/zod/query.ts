import {
  type APIComponentInActionRow,
  type APIContainerComponent,
  type APISectionAccessoryComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
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

export const LinkEmbedComponentType = z.union([
  z.literal(ComponentType.ActionRow), // link buttons only
  z.literal(ComponentType.Button), // link buttons only
  z.literal(ComponentType.Section),
  z.literal(ComponentType.TextDisplay),
  z.literal(ComponentType.Thumbnail),
  z.literal(ComponentType.MediaGallery),
  z.literal(ComponentType.Separator),
]);

export type LinkEmbedComponentType = z.infer<typeof LinkEmbedComponentType>;

export const ZodLinkEmbedContainerComponent = z.object({
  type: z.literal(ComponentType.Container),
  accent_color: z.number().int().nullable().optional(),
  spoiler: z.boolean().optional(),
  components: z
    .object({
      id: z.number().optional(),
      type: z
        .number()
        .int()
        // we're using refine instead of a union because otherwise the type
        // guard for Container gets mad and i don't want to override it
        .refine(
          (type) =>
            [
              ComponentType.ActionRow, // link buttons only
              ComponentType.Button, // link buttons only
              ComponentType.Section,
              ComponentType.TextDisplay,
              ComponentType.Thumbnail,
              ComponentType.MediaGallery,
              ComponentType.Separator,
            ].includes(type),
          "Must be type ActionRow, Button, Section, TextDisplay, Thumbnail, MediaGallery, or Separator",
        ),
    })
    .passthrough()
    .refine((child) => {
      switch (child.type) {
        case ComponentType.Button:
          return child.style === ButtonStyle.Link;
        case ComponentType.ActionRow:
          for (const componentChild of (child.components ??
            []) as APIComponentInActionRow[]) {
            if (
              componentChild.type !== ComponentType.Button ||
              componentChild.style !== ButtonStyle.Link
            ) {
              return false;
            }
          }
          break;
        case ComponentType.Section: {
          const accessory = child.accessory as APISectionAccessoryComponent;
          return (
            accessory.type !== ComponentType.Button ||
            accessory.style === ButtonStyle.Link
          );
        }
        default:
          break;
      }
      return true;
    }, "Interactive components cannot be used in link previews")
    .array(),
}) satisfies z.ZodType<APIContainerComponent>;

export enum LinkEmbedStrategy {
  Link = "link",
  Mastodon = "mastodon",
  Components = "components",
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
      /** Direct video file or supported iframe src */
      url: z.string(),
      height: z.number().optional(),
      width: z.number().optional(),
    })
    .optional(),
  color: z.number().optional(),
  // only strategy:components
  components: ZodLinkEmbedContainerComponent.array().length(1).optional(),
}) satisfies z.ZodType<APIEmbed>;

export const ZodLinkQueryData = z.object({
  version: ZodLinkQueryDataVersion.optional(),
  backup_id: z.string().optional(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.string().optional() }),
});
