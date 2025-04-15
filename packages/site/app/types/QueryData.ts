import type {
  APIButtonComponentWithCustomId as _APIButtonComponentWithCustomId,
  APIChannelSelectComponent as _APIChannelSelectComponent,
  APIMentionableSelectComponent as _APIMentionableSelectComponent,
  APIRoleSelectComponent as _APIRoleSelectComponent,
  APIStringSelectComponent as _APIStringSelectComponent,
  APIUserSelectComponent as _APIUserSelectComponent,
  APIActionRowComponent,
  APIAttachment,
  APIButtonComponentBase,
  APIContainerComponent,
  APIFileComponent,
  APIMediaGalleryComponent,
  APISectionComponent,
  APISeparatorComponent,
  APITextDisplayComponent,
  ButtonStyle,
  MessageFlags,
  UserFlags,
} from "discord-api-types/v10";
import { z } from "zod";
import type { DraftFlow } from "~/store.server";
import { randomString } from "~/util/text";
import {
  type APIEmbed,
  type QueryDataVersion,
  ZodAPIEmbed,
} from "./QueryData-raw";
import { ZodAPIActionRowComponent } from "./components";
import { ZodMessageFlags } from "./discord";

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

// I don't see any way to key these components in the way we do with e.g. URL
// buttons, but we add an optional custom_id parameter just for ease of typing.
// In any normal scenario we are not actually ever dealing with these.
export interface APIButtonComponentWithSkuId
  extends APIButtonComponentBase<ButtonStyle.Premium> {
  sku_id: string;
  custom_id?: string;
}

export interface APIButtonComponentWithCustomId
  extends _APIButtonComponentWithCustomId {
  flow?: DraftFlow;
}

export interface APIStringSelectComponent extends _APIStringSelectComponent {
  flows?: Record<string, DraftFlow>;
}

export interface APIUserSelectComponent extends _APIUserSelectComponent {
  flow?: DraftFlow;
}

export interface APIRoleSelectComponent extends _APIRoleSelectComponent {
  flow?: DraftFlow;
}

export interface APIMentionableSelectComponent
  extends _APIMentionableSelectComponent {
  flow?: DraftFlow;
}

export interface APIChannelSelectComponent extends _APIChannelSelectComponent {
  flow?: DraftFlow;
}

export type APIButtonComponent =
  | APIButtonComponentWithCustomId
  | APIButtonComponentWithURL
  | APIButtonComponentWithSkuId;

export type APISelectMenuComponent =
  | APIStringSelectComponent
  | APIUserSelectComponent
  | APIRoleSelectComponent
  | APIMentionableSelectComponent
  | APIChannelSelectComponent;

export type APIAutoPopulatedSelectMenuComponent =
  | APIUserSelectComponent
  | APIRoleSelectComponent
  | APIMentionableSelectComponent
  | APIChannelSelectComponent;

export type APIComponentInMessageActionRow =
  | APIButtonComponent
  | APISelectMenuComponent;

export type APIMessageTopLevelComponent =
  | APIActionRowComponent<APIComponentInMessageActionRow>
  | APIContainerComponent
  | APIFileComponent
  | APIMediaGalleryComponent
  | APISectionComponent
  | APISeparatorComponent
  | APITextDisplayComponent;

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
      components?: APIMessageTopLevelComponent[];
      webhook_id?: string;
      flags?: MessageFlags;
      thread_name?: string;
    };
    reference?: string;
    thread_id?: string;
  }[];
  targets?: { url: string }[];
}

export const ZodQueryDataMessageData = z.object({
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
  components: ZodAPIActionRowComponent.array().optional(),
  flags: ZodMessageFlags.optional(),
  thread_name: z.ostring(),
}) satisfies z.ZodType<QueryData["messages"][number]["data"]>;

export const ZodQueryDataMessage = z.object({
  _id: z.string().default(() => randomString(10)),
  data: ZodQueryDataMessageData,
  reference: z.ostring(),
  thread_id: z.ostring(),
}) satisfies z.ZodType<QueryData["messages"][number]>;

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

export enum LinkEmbedStrategy {
  Link = "link",
  Mastodon = "mastodon",
}

export const ZodLinkEmbedStrategy = z.nativeEnum(LinkEmbedStrategy);

export const ZodLinkEmbed = z.object({
  strategy: ZodLinkEmbedStrategy.optional(),
  title: z.ostring(),
  description: z.ostring(),
  timestamp: z.ostring(),
  provider: z
    .object({
      name: z.ostring(),
      icon_url: z.ostring(),
      url: z.ostring(),
    })
    .optional(),
  author: z
    .object({
      name: z.string(),
      icon_url: z.ostring(),
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
}) satisfies z.ZodType<APIEmbed>;

export const ZodLinkQueryData = z.object({
  version: ZodLinkQueryDataVersion.optional(),
  backup_id: z.ostring(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.ostring() }),
});

export type LinkQueryData = z.infer<typeof ZodLinkQueryData>;
export type LinkEmbed = z.infer<typeof ZodLinkEmbed>;
export type LinkEmbedContainer = LinkQueryData["embed"];
