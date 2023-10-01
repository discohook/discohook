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

export const ZodQueryData = z.object({
  version: z.optional(z.enum(["d2"])),
  backup_id: z.onumber(),
  messages: z.array(
    z.object({
      data: z.object({
        author: z.optional(
          z.object({
            name: z.optional(z.string()),
            icon_url: z.optional(z.string()),
          })
        ),
        content: z.optional(z.nullable(z.string())),
        embeds: z.optional(
          z.nullable(
            z.array(
              z.object({
                title: z.optional(z.string()),
                description: z.optional(z.string()),
                url: z.optional(z.string()),
                color: z.optional(z.nullable(z.number())),
                fields: z.optional(
                  z.array(
                    z.object({
                      name: z.string(),
                      value: z.string(),
                      inline: z.optional(z.boolean()),
                    })
                  )
                ),
                author: z.optional(
                  z.object({
                    name: z.string(),
                    icon_url: z.optional(z.string()),
                    proxy_icon_url: z.optional(z.string()),
                    url: z.optional(z.string()),
                  })
                ),
                footer: z.optional(
                  z.object({
                    text: z.string(),
                    icon_url: z.optional(z.string()),
                    proxy_icon_url: z.optional(z.string()),
                  })
                ),
                provider: z.optional(
                  z.object({
                    name: z.optional(z.string()),
                    url: z.optional(z.string()),
                  })
                ),
                timestamp: z.optional(z.string()),
                thumbnail: z.optional(
                  z.object({
                    url: z.string(),
                    proxy_url: z.optional(z.string()),
                    width: z.optional(z.number()),
                    height: z.optional(z.number()),
                  })
                ),
                image: z.optional(
                  z.object({
                    url: z.string(),
                    proxy_url: z.optional(z.string()),
                    width: z.optional(z.number()),
                    height: z.optional(z.number()),
                  })
                ),
                video: z.optional(
                  z.object({
                    url: z.string(),
                    proxy_url: z.optional(z.string()),
                    width: z.optional(z.number()),
                    height: z.optional(z.number()),
                  })
                ),
              })
            )
          )
        ),
        attachments: z.optional(
          z.array(
            z.object({
              id: z.string(),
              content_type: z.optional(z.string()),
              filename: z.string(),
              description: z.optional(z.string()),
              url: z.string(),
              size: z.optional(z.number()),
            })
          )
        ),
        webhook_id: z.optional(z.string()),
      }),
      reference: z.optional(z.string()),
    })
  ),
  targets: z.optional(
    z.array(
      z.object({
        url: z.string(),
      })
    )
  ),
});
