import {
  type APIButtonComponentWithCustomId as _APIButtonComponentWithCustomId,
  type APIChannelSelectComponent as _APIChannelSelectComponent,
  type APIMentionableSelectComponent as _APIMentionableSelectComponent,
  type APIRoleSelectComponent as _APIRoleSelectComponent,
  type APIStringSelectComponent as _APIStringSelectComponent,
  type APIUserSelectComponent as _APIUserSelectComponent,
  type APIActionRowComponent,
  type APIButtonComponentBase,
  type APIComponentInActionRow,
  type APIContainerComponent,
  type APIFileComponent,
  type APIMediaGalleryComponent,
  type APISectionAccessoryComponent,
  type APISectionComponent,
  type APISeparatorComponent,
  type APITextDisplayComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import type React from "react";
import { z } from "zod/v3";
import type { DraftFlow } from "~/store.server";
import { randomString } from "~/util/text";
import { ZodAPITopLevelComponent } from "./components";
import {
  type APIEmbed,
  type QueryDataMessageDataRaw,
  queryDataMessageDataTransform,
  type QueryDataTarget,
  type QueryDataVersion,
  type TargetBot,
  type TargetFluxerWebhook,
  TargetType,
  type TargetWebhook,
  ZodQueryDataMessageDataBase,
} from "./QueryData-raw";

export interface APIButtonComponentWithURL
  extends APIButtonComponentBase<ButtonStyle.Link> {
  /**
   * The URL to direct users to when clicked for Link buttons
   */
  url: string;
  /**
   * An internal Discohook ID for tracking within the editor
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
    name?: string;
    data: Omit<QueryDataMessageDataRaw, "components"> & {
      components?: APIMessageTopLevelComponent[];
    };
    reference?: string;
    thread_id?: string;
  }[];
  targets?: QueryDataTarget[];
}

export type SetQueryData = React.Dispatch<QueryData>;

export const ZodQueryDataMessage = z.object({
  _id: z.string().default(() => randomString(10)),
  name: z.string().max(50).optional(),
  data: ZodQueryDataMessageDataBase.omit({ components: true })
    .merge(z.object({ components: ZodAPITopLevelComponent.array().optional() }))
    .transform(queryDataMessageDataTransform),
  reference: z.ostring(),
  thread_id: z.ostring(),
}) satisfies z.ZodType<QueryData["messages"][number]>;

export const ZodQueryDataTargetWebhook: z.ZodType<TargetWebhook> = z.object({
  type: z.literal(TargetType.Webhook).default(TargetType.Webhook).optional(),
  url: z.string(),
});

export const ZodQueryDataTargetBot: z.ZodType<TargetBot> = z.object({
  type: z.literal(TargetType.Bot),
  application_id: z.string(),
  bot_id: z.string().optional(),
  channel_id: z.string(),
});

export const ZodQueryDataTargetFluxerWebhook: z.ZodType<TargetFluxerWebhook> =
  z.object({
    type: z.literal(TargetType.FluxerWebhook),
    id: z.string(),
    token: z.string(),
  });

export const ZodQueryDataTarget: z.ZodType<QueryDataTarget> = z.union([
  ZodQueryDataTargetWebhook,
  ZodQueryDataTargetBot,
  ZodQueryDataTargetFluxerWebhook,
]);

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
  Components = "components",
}

export const ZodLinkEmbedStrategy = z.nativeEnum(LinkEmbedStrategy);

export const LinkEmbedComponentType = z.union([
  z.literal(ComponentType.ActionRow), // link buttons only
  z.literal(ComponentType.Button), // link buttons only
  z.literal(ComponentType.Section),
  z.literal(ComponentType.TextDisplay),
  z.literal(ComponentType.Thumbnail),
  z.literal(ComponentType.MediaGallery),
  z.literal(ComponentType.Separator),
]);

export const linkEmbedComponentTypes = [
  ComponentType.ActionRow, // link buttons only
  ComponentType.Button, // link buttons only
  ComponentType.Section,
  ComponentType.TextDisplay,
  ComponentType.Thumbnail,
  ComponentType.MediaGallery,
  ComponentType.Separator,
];

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
          (type) => linkEmbedComponentTypes.includes(type),
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
  backup_id: z.ostring(),
  embed: z.object({ data: ZodLinkEmbed, redirect_url: z.ostring() }),
});

export type LinkQueryData = z.infer<typeof ZodLinkQueryData>;
export type LinkEmbed = z.infer<typeof ZodLinkEmbed>;
export type LinkEmbedContainer = LinkQueryData["embed"];
