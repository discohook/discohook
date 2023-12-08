import { APIAttachment, APIEmbed } from "discord-api-types/v10";
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
  backup_id?: number;
  messages: {
    data: {
      author?: {
        name?: string;
        icon_url?: string;
      };
      content?: string | null;
      embeds?: APIEmbed[] | null;
      attachments?: APIAttachment[];
      webhook_id?: string;
    };
    reference?: string;
  }[];
  targets?: { url: string }[];
}

export const ZodQueryData: z.ZodType<QueryData> = z.any();
