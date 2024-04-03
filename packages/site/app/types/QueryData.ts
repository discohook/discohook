import {
  APIActionRowComponent,
  APIAttachment,
  APIEmbed,
  APIMessageActionRowComponent,
} from "discord-api-types/v10";
import { z } from "zod";
import { StorableComponent } from "~/store.server";
import { ZodAPIMessageActionRowComponent } from "./components";

/** The version of the query data, defaults to `d2`
 *
 * `d2` is based on Discohook's second data format, which supports multiple
 * messages and targets. `d2`-versioned data can also include `webhook_id`
 * for messages and `backup_id` at the top level, both of which are backwards
 * compatible with Discohook.
 */
export type QueryDataVersion = "d2";

export interface QueryData {
  version?: QueryDataVersion;
  backup_id?: number;
  messages: {
    data: {
      author?: {
        name?: string;
        icon_url?: string;
        badge?: string | null;
      };
      content?: string | null;
      embeds?: APIEmbed[] | null;
      attachments?: APIAttachment[];
      components?: APIActionRowComponent<APIMessageActionRowComponent>[];
      webhook_id?: string;
    };
    reference?: string;
  }[];
  components?: Record<
    string,
    {
      id: string;
      // @ts-expect-error
      data: Partial<Pick<StorableComponent, "flow" | "flows">>;
      draft?: boolean;
    }[]
  >;
  targets?: { url: string }[];
}

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
  color: z.onumber(),
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

export const ZodQueryDataMessage: z.ZodType<QueryData["messages"][number]> =
  z.object({
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
      // components:
      webhook_id: z.ostring(),
    }),
    reference: z.ostring(),
  });

export type QueryDataComponent = NonNullable<
  QueryData["components"]
>[string][number];

export const ZodQueryDataComponent: z.ZodType<QueryDataComponent> = z.object({
  id: z.string(),
  data: ZodAPIMessageActionRowComponent.and(
    z.object({
      flow: z.object({
        name: z.string(),
        actions: z.object({}).array(),
      }),
    }),
  ),
  draft: z.oboolean(),
});

export const ZodQueryDataTarget: z.ZodType<
  NonNullable<QueryData["targets"]>[number]
> = z.object({ url: z.string() });

export const ZodQueryData: z.ZodType<QueryData> = z.object({
  version: z.enum(["d2"]).optional(),
  backup_id: z.onumber(),
  messages: ZodQueryDataMessage.array(),
  components: z.record(z.string(), ZodQueryDataComponent.array()).optional(),
  targets: ZodQueryDataTarget.array().optional(),
});

export const ZodLinkQueryDataVersion = z.literal(1);

export const ZodLinkEmbed = z.object({
  // type: z
  //   .union([
  //     z.literal(EmbedType.Article),
  //     z.literal(EmbedType.Link),
  //     z.literal(EmbedType.Video),
  //     // I think GIFV and Image don't render as unfurl embeds?
  //     z.literal(EmbedType.Image),
  //     z.literal(EmbedType.GIFV),
  //   ])
  //   .optional(),
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
  backup_id: z.onumber(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.ostring() }),
});

export type LinkQueryData = z.infer<typeof ZodLinkQueryData>;
export type LinkEmbed = z.infer<typeof ZodLinkEmbed>;
export type LinkEmbedContainer = LinkQueryData["embed"];
