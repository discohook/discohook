import {
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  type APIChannelSelectComponent,
  type APIComponentInMessageActionRow,
  type APIContainerComponent,
  type APIFileComponent,
  type APIMediaGalleryComponent,
  type APIMediaGalleryItem,
  type APIMentionableSelectComponent,
  type APIMessageComponentEmoji,
  type APIRoleSelectComponent,
  type APISectionAccessoryComponent,
  type APISectionComponent,
  type APISeparatorComponent,
  type APIStringSelectComponent,
  type APITextDisplayComponent,
  type APIThumbnailComponent,
  type APIUnfurledMediaItem,
  type APIUserSelectComponent,
  ButtonStyle,
  ChannelType,
  ComponentType,
  SelectMenuDefaultValueType,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { z } from "zod/v3";

export const ZodPartialEmoji: z.ZodType<APIMessageComponentEmoji> = z.object({
  id: z.ostring(),
  name: z.ostring(),
  animated: z.oboolean(),
});

export const ZodAPIButtonComponentWithCustomIdBaseRaw = z.object({
  type: z.literal(ComponentType.Button),
  label: z.ostring(),
  emoji: ZodPartialEmoji.optional(),
  custom_id: z.string(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<Omit<APIButtonComponentWithCustomId, "style">>;

export const ZodAPIButtonComponentWithCustomIdPrimaryRaw = z
  .object({ style: z.literal(ButtonStyle.Primary) })
  .merge(
    ZodAPIButtonComponentWithCustomIdBaseRaw,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomIdSecondaryRaw = z
  .object({ style: z.literal(ButtonStyle.Secondary) })
  .merge(
    ZodAPIButtonComponentWithCustomIdBaseRaw,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomIdDangerRaw = z
  .object({ style: z.literal(ButtonStyle.Danger) })
  .merge(
    ZodAPIButtonComponentWithCustomIdBaseRaw,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomIdSuccessRaw = z
  .object({
    style: z.literal(ButtonStyle.Success),
  })
  .merge(
    ZodAPIButtonComponentWithCustomIdBaseRaw,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomId = z.union([
  ZodAPIButtonComponentWithCustomIdPrimaryRaw,
  ZodAPIButtonComponentWithCustomIdSecondaryRaw,
  ZodAPIButtonComponentWithCustomIdDangerRaw,
  ZodAPIButtonComponentWithCustomIdSuccessRaw,
]) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithURLRaw = z.object({
  type: z.literal(ComponentType.Button),
  style: z.literal(ButtonStyle.Link),
  label: z.ostring(),
  emoji: ZodPartialEmoji.optional(),
  url: z.string(),
  custom_id: z.ostring(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIButtonComponentWithURL>;

export const ZodAPIButtonComponentWithSkuIdRaw = z.object({
  type: z.literal(ComponentType.Button),
  style: z.literal(ButtonStyle.Premium),
  sku_id: z.string(),
  custom_id: z.ostring(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIButtonComponentWithSKUId>;

export const ZodAPIButtonComponent = z.discriminatedUnion("style", [
  ZodAPIButtonComponentWithCustomIdPrimaryRaw,
  ZodAPIButtonComponentWithCustomIdSecondaryRaw,
  ZodAPIButtonComponentWithCustomIdDangerRaw,
  ZodAPIButtonComponentWithCustomIdSuccessRaw,
  ZodAPIButtonComponentWithURLRaw,
  ZodAPIButtonComponentWithSkuIdRaw,
]);

export const ZodAPIStringSelectMenuComponentRaw = z.object({
  type: z.literal(ComponentType.StringSelect),
  custom_id: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      description: z.ostring(),
      emoji: ZodPartialEmoji.optional(),
      default: z.oboolean(),
    }),
  ),
  placeholder: z.ostring(),
  min_values: z.onumber(),
  max_values: z.onumber(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIStringSelectComponent>;

export const ZodAPIRoleSelectMenuComponentRaw = z.object({
  type: z.literal(ComponentType.RoleSelect),
  custom_id: z.string(),
  default_values: z
    .object({
      id: z.string(),
      type: z.literal(SelectMenuDefaultValueType.Role),
    })
    .array()
    .optional(),
  placeholder: z.ostring(),
  min_values: z.onumber(),
  max_values: z.onumber(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIRoleSelectComponent>;

export const ZodAPIUserSelectMenuComponentRaw = z.object({
  type: z.literal(ComponentType.UserSelect),
  custom_id: z.string(),
  default_values: z
    .object({
      id: z.string(),
      type: z.literal(SelectMenuDefaultValueType.User),
    })
    .array()
    .optional(),
  placeholder: z.ostring(),
  min_values: z.onumber(),
  max_values: z.onumber(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIUserSelectComponent>;

export const ZodAPIMentionableSelectMenuComponentRaw = z.object({
  type: z.literal(ComponentType.MentionableSelect),
  custom_id: z.string(),
  default_values: z
    .object({
      id: z.string(),
      type: z.union([
        z.literal(SelectMenuDefaultValueType.User),
        z.literal(SelectMenuDefaultValueType.Role),
      ]),
    })
    .array()
    .optional(),
  placeholder: z.ostring(),
  min_values: z.onumber(),
  max_values: z.onumber(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIMentionableSelectComponent>;

export const ZodAPIChannelSelectMenuComponentRaw = z.object({
  type: z.literal(ComponentType.ChannelSelect),
  custom_id: z.string(),
  channel_types: z
    .array(
      z.union([
        z.literal(ChannelType.GuildText),
        z.literal(ChannelType.GuildVoice),
        z.literal(ChannelType.GuildCategory),
        z.literal(ChannelType.GuildAnnouncement),
        z.literal(ChannelType.AnnouncementThread),
        z.literal(ChannelType.PublicThread),
        z.literal(ChannelType.PrivateThread),
        z.literal(ChannelType.GuildStageVoice),
        z.literal(ChannelType.GuildDirectory),
        z.literal(ChannelType.GuildForum),
        z.literal(ChannelType.GuildMedia),
      ]),
    )
    .optional(),
  default_values: z
    .object({
      id: z.string(),
      type: z.literal(SelectMenuDefaultValueType.Channel),
    })
    .array()
    .optional(),
  placeholder: z.ostring(),
  min_values: z.onumber(),
  max_values: z.onumber(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIChannelSelectComponent>;

export const ZodAPISelectMenuComponentRaw = z.discriminatedUnion("type", [
  ZodAPIStringSelectMenuComponentRaw,
  ZodAPIRoleSelectMenuComponentRaw,
  ZodAPIUserSelectMenuComponentRaw,
  ZodAPIMentionableSelectMenuComponentRaw,
  ZodAPIChannelSelectMenuComponentRaw,
]);

export const ZodAPIMessageActionRowComponentRaw = z
  .object({
    type: z.union([
      z.literal(ComponentType.Button),
      z.literal(ComponentType.ChannelSelect),
      z.literal(ComponentType.MentionableSelect),
      z.literal(ComponentType.RoleSelect),
      z.literal(ComponentType.StringSelect),
      z.literal(ComponentType.UserSelect),
    ]),
  })
  .passthrough()
  // I'm not the biggest fan of this, but it's the best method I could figure
  // out here. We're basically doing `discriminatedUnion` ourself since Zod
  // doesn't support nesting them.
  .superRefine((val, ctx) => {
    const schema =
      val.type === ComponentType.Button
        ? ZodAPIButtonComponent
        : ZodAPISelectMenuComponentRaw;

    const parsed = schema.safeParse(val);
    if (!parsed.success) {
      parsed.error.issues.forEach(ctx.addIssue);
      return z.NEVER;
    }
  })
  .transform((val) => {
    const schema =
      val.type === ComponentType.Button
        ? ZodAPIButtonComponent
        : ZodAPISelectMenuComponentRaw;

    const parsed = schema.parse(val);
    return parsed;
  }) as unknown as z.ZodType<APIComponentInMessageActionRow>;

export const ZodAPIActionRowComponentRaw = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: ZodAPIMessageActionRowComponentRaw.array(),
});

export const ZodAPITextDisplayComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.TextDisplay),
  content: z.string(),
}) satisfies z.ZodType<APITextDisplayComponent>;

export const ZodAPIUnfurledMediaItemRaw = z.object({
  /** http(s) or attachment:// */
  url: z.string(),
  proxy_url: z.ostring(),
  width: z.onumber().nullable(),
  height: z.onumber().nullable(),
  content_type: z.ostring(),
}) satisfies z.ZodType<APIUnfurledMediaItem>;

export const ZodAPIThumbnailComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.Thumbnail),
  media: ZodAPIUnfurledMediaItemRaw,
  description: z.ostring().nullable(),
  spoiler: z.oboolean(),
}) satisfies z.ZodType<APIThumbnailComponent>;

export const ZodAPISectionAccessoryComponentRaw = z.union([
  ZodAPIButtonComponent,
  ZodAPIThumbnailComponentRaw,
]) satisfies z.ZodType<APISectionAccessoryComponent>;

export const ZodAPISectionComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.Section),
  components: ZodAPITextDisplayComponentRaw.array(),
  accessory: ZodAPISectionAccessoryComponentRaw,
}) satisfies z.ZodType<APISectionComponent>;

export const ZodAPIMediaGalleryItemRaw = z.object({
  media: ZodAPIUnfurledMediaItemRaw,
  description: z.ostring().nullable(),
  spoiler: z.oboolean(),
}) satisfies z.ZodType<APIMediaGalleryItem>;

export const ZodAPIMediaGalleryComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.MediaGallery),
  items: ZodAPIMediaGalleryItemRaw.array(),
}) satisfies z.ZodType<APIMediaGalleryComponent>;

export const ZodAPIFileComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.File),
  /** Only supports attachment:// */
  file: ZodAPIUnfurledMediaItemRaw,
}) satisfies z.ZodType<APIFileComponent>;

export const ZodAPISeparatorComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.Separator),
  divider: z.oboolean(),
  spacing: z.nativeEnum(SeparatorSpacingSize).optional(),
}) satisfies z.ZodType<APISeparatorComponent>;

export const ZodAPIComponentInContainerRaw = z.union([
  ZodAPIActionRowComponentRaw,
  ZodAPIFileComponentRaw,
  ZodAPIMediaGalleryComponentRaw,
  ZodAPISectionComponentRaw,
  ZodAPISeparatorComponentRaw,
  ZodAPITextDisplayComponentRaw,
]);

export const ZodAPIContainerComponentRaw = z.object({
  id: z.onumber(),
  type: z.literal(ComponentType.Container),
  accent_color: z.onumber().nullable(),
  spoiler: z.oboolean(),
  components: ZodAPIComponentInContainerRaw.array(),
}) satisfies z.ZodType<APIContainerComponent>;

export const ZodAPITopLevelComponentRaw = z.union([
  ZodAPIContainerComponentRaw,
  ZodAPIActionRowComponentRaw,
  ZodAPIFileComponentRaw,
  ZodAPIMediaGalleryComponentRaw,
  ZodAPISectionComponentRaw,
  ZodAPISeparatorComponentRaw,
  ZodAPITextDisplayComponentRaw,
]);
