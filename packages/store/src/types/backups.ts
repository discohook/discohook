import {
  APIActionRowComponent,
  APIAttachment,
  APIEmbed,
  APIMessageActionRowComponent,
} from "discord-api-types/v10";
import { z } from "zod";

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
  backup_id?: string;
  messages: {
    data: {
      author?: {
        name?: string;
        icon_url?: string;
      };
      content?: string | null;
      embeds?: APIEmbed[] | null;
      attachments?: APIAttachment[];
      components?: APIActionRowComponent<APIMessageActionRowComponent>[];
      webhook_id?: string;
    };
    reference?: string;
  }[];
  targets?: { url: string }[];
}

export const ZodQueryData: z.ZodType<QueryData> = z.any();

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
  backup_id: z.ostring(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.ostring() }),
});

export type LinkQueryData = z.infer<typeof ZodLinkQueryData>;
export type LinkEmbed = z.infer<typeof ZodLinkEmbed>;
export type LinkEmbedContainer = LinkQueryData["embed"];

export enum ScheduledRunStatus {
  Success = 0,
  Failure = 1,
  Warning = 2,
}

export interface ScheduledRunData {
  status: ScheduledRunStatus;
  message: string;
}
