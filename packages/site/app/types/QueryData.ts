import {
  APIButtonComponentWithCustomId as _APIButtonComponentWithCustomId,
  APIChannelSelectComponent as _APIChannelSelectComponent,
  APIMentionableSelectComponent as _APIMentionableSelectComponent,
  APIRoleSelectComponent as _APIRoleSelectComponent,
  APIStringSelectComponent as _APIStringSelectComponent,
  APIUserSelectComponent as _APIUserSelectComponent,
  APIActionRowComponent,
  APIAttachment,
  APIButtonComponentBase,
  APIEmbed,
  ButtonStyle,
  MessageFlags,
  UserFlags,
} from "discord-api-types/v10";
import { z } from "zod";
import { Flow } from "~/store.server";
import { randomString } from "~/util/text";
import { ZodAPIActionRowComponent } from "./components";
import { ZodMessageFlags } from "./discord";

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

export interface APIButtonComponentWithURL
  extends APIButtonComponentBase<ButtonStyle.Link> {
  /**
   * The URL to direct users to when clicked for Link buttons
   */
  url: string;
  /**
   * An internal Discohook ID, only sent to Discord when combined with the
   * validated `url`. It is later split from `url` to populate this property.
   */
  custom_id?: string;
}

export interface APIButtonComponentWithCustomId
  extends _APIButtonComponentWithCustomId {
  flow?: Flow;
}

export interface APIStringSelectComponent extends _APIStringSelectComponent {
  flows?: Record<string, Flow>;
}

export interface APIUserSelectComponent extends _APIUserSelectComponent {
  flow?: Flow;
}

export interface APIRoleSelectComponent extends _APIRoleSelectComponent {
  flow?: Flow;
}

export interface APIMentionableSelectComponent
  extends _APIMentionableSelectComponent {
  flow?: Flow;
}

export interface APIChannelSelectComponent extends _APIChannelSelectComponent {
  flow?: Flow;
}

export type APIButtonComponent =
  | APIButtonComponentWithCustomId
  | APIButtonComponentWithURL;

export type APISelectMenuComponent =
  | APIStringSelectComponent
  | APIUserSelectComponent
  | APIRoleSelectComponent
  | APIMentionableSelectComponent
  | APIChannelSelectComponent;

export type APIMessageActionRowComponent =
  | APIButtonComponent
  | APISelectMenuComponent;

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
    };
    reference?: string;
  }[];
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
      components: ZodAPIActionRowComponent.array().optional(),
      flags: ZodMessageFlags.optional(),
    }),
    reference: z.ostring(),
  });

export const ZodQueryDataTarget: z.ZodType<
  NonNullable<QueryData["targets"]>[number]
> = z.object({ url: z.string() });

export const ZodQueryData: z.ZodType<QueryData> = z.object({
  version: z.enum(["d2"]).optional(),
  backup_id: z.ostring(),
  messages: ZodQueryDataMessage.array().max(10),
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
