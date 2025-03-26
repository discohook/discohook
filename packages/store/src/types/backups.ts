import type {
  APIActionRowComponent,
  APIMessageActionRowComponent,
  MessageFlags,
  UserFlags,
  APIAttachment as _APIAttachment,
  APIEmbed as _APIEmbed,
} from "discord-api-types/v10";
import type { z } from "zod";
import type { ZodLinkEmbed, ZodLinkQueryData } from "../zod/query.js";

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
