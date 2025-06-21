import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import { z } from "zod";
import type {
  APIButtonComponentWithCustomId,
  APIButtonComponentWithSkuId,
  APIButtonComponentWithURL,
  APIChannelSelectComponent,
  APIComponentInMessageActionRow,
  APIMentionableSelectComponent,
  APIRoleSelectComponent,
  APIStringSelectComponent,
  APIUserSelectComponent,
} from "./QueryData";
import {
  ZodAPIContainerComponentRaw,
  ZodAPIFileComponentRaw,
  ZodAPIMediaGalleryComponentRaw,
  ZodAPISectionComponentRaw,
  ZodAPISeparatorComponentRaw,
  ZodAPITextDisplayComponentRaw,
  ZodPartialEmoji,
} from "./components-raw";
import { ZodDraftFlow } from "./flows";

export const ZodAPIButtonComponentWithCustomIdBase = z.object({
  type: z.literal(ComponentType.Button),
  label: z.ostring(),
  emoji: ZodPartialEmoji.optional(),
  custom_id: z.string(),
  disabled: z.oboolean(),
  flow: ZodDraftFlow.optional(),
}) satisfies z.ZodType<Omit<APIButtonComponentWithCustomId, "style">>;

export const ZodAPIButtonComponentWithCustomIdPrimary = z
  .object({ style: z.literal(ButtonStyle.Primary) })
  .merge(
    ZodAPIButtonComponentWithCustomIdBase,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomIdSecondary = z
  .object({ style: z.literal(ButtonStyle.Secondary) })
  .merge(
    ZodAPIButtonComponentWithCustomIdBase,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomIdDanger = z
  .object({ style: z.literal(ButtonStyle.Danger) })
  .merge(
    ZodAPIButtonComponentWithCustomIdBase,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomIdSuccess = z
  .object({
    style: z.literal(ButtonStyle.Success),
  })
  .merge(
    ZodAPIButtonComponentWithCustomIdBase,
  ) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithCustomId = z.union([
  ZodAPIButtonComponentWithCustomIdPrimary,
  ZodAPIButtonComponentWithCustomIdSecondary,
  ZodAPIButtonComponentWithCustomIdDanger,
  ZodAPIButtonComponentWithCustomIdSuccess,
]) satisfies z.ZodType<APIButtonComponentWithCustomId>;

export const ZodAPIButtonComponentWithURL = z.object({
  type: z.literal(ComponentType.Button),
  style: z.literal(ButtonStyle.Link),
  label: z.ostring(),
  emoji: ZodPartialEmoji.optional(),
  url: z.string(),
  custom_id: z.ostring(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIButtonComponentWithURL>;

export const ZodAPIButtonComponentWithSkuId = z.object({
  type: z.literal(ComponentType.Button),
  style: z.literal(ButtonStyle.Premium),
  sku_id: z.string(),
  custom_id: z.ostring(),
  disabled: z.oboolean(),
}) satisfies z.ZodType<APIButtonComponentWithSkuId>;

export const ZodAPIButtonComponent = z.discriminatedUnion("style", [
  ZodAPIButtonComponentWithCustomIdPrimary,
  ZodAPIButtonComponentWithCustomIdSecondary,
  ZodAPIButtonComponentWithCustomIdDanger,
  ZodAPIButtonComponentWithCustomIdSuccess,
  ZodAPIButtonComponentWithURL,
  ZodAPIButtonComponentWithSkuId,
]);

export const ZodAPIStringSelectMenuComponent = z.object({
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
  flows: z.record(z.string(), ZodDraftFlow).optional(),
}) satisfies z.ZodType<APIStringSelectComponent>;

export const ZodAPIRoleSelectMenuComponent = z.object({
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
  flow: ZodDraftFlow.optional(),
}) satisfies z.ZodType<APIRoleSelectComponent>;

export const ZodAPIUserSelectMenuComponent = z.object({
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
  flow: ZodDraftFlow.optional(),
}) satisfies z.ZodType<APIUserSelectComponent>;

export const ZodAPIMentionableSelectMenuComponent = z.object({
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
  flow: ZodDraftFlow.optional(),
}) satisfies z.ZodType<APIMentionableSelectComponent>;

export const ZodAPIChannelSelectMenuComponent = z.object({
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
  flow: ZodDraftFlow.optional(),
}) satisfies z.ZodType<APIChannelSelectComponent>;

export const ZodAPISelectMenuComponent = z.discriminatedUnion("type", [
  ZodAPIStringSelectMenuComponent,
  ZodAPIRoleSelectMenuComponent,
  ZodAPIUserSelectMenuComponent,
  ZodAPIMentionableSelectMenuComponent,
  ZodAPIChannelSelectMenuComponent,
]);

export const ZodAPIMessageActionRowComponent = z
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
        : ZodAPISelectMenuComponent;

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
        : ZodAPISelectMenuComponent;

    const parsed = schema.parse(val);
    return parsed;
  }) as unknown as z.ZodType<APIComponentInMessageActionRow>;

export const ZodAPIActionRowComponent = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: ZodAPIMessageActionRowComponent.array(),
});

export const ZodAPITopLevelComponent = z.union([
  ZodAPIContainerComponentRaw,
  ZodAPIActionRowComponent,
  ZodAPIFileComponentRaw,
  ZodAPIMediaGalleryComponentRaw,
  ZodAPISectionComponentRaw,
  ZodAPISeparatorComponentRaw,
  ZodAPITextDisplayComponentRaw,
]);
