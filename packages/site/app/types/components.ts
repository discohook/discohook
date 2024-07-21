import {
  APIMessageComponentEmoji,
  ButtonStyle,
  ChannelType,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import { z } from "zod";
import {
  APIButtonComponentWithCustomId,
  APIButtonComponentWithSkuId,
  APIButtonComponentWithURL,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIRoleSelectComponent,
  APIStringSelectComponent,
  APIUserSelectComponent,
} from "./QueryData";
import { ZodDraftFlow } from "./flows";

export const ZodPartialEmoji: z.ZodType<APIMessageComponentEmoji> = z.object({
  id: z.ostring(),
  name: z.ostring(),
  animated: z.oboolean(),
});

export const ZodAPIButtonComponentWithCustomId = z.object({
  type: z.literal(ComponentType.Button),
  style: z.union([
    z.literal(ButtonStyle.Primary),
    z.literal(ButtonStyle.Secondary),
    z.literal(ButtonStyle.Success),
    z.literal(ButtonStyle.Danger),
  ]),
  label: z.ostring(),
  emoji: ZodPartialEmoji.optional(),
  custom_id: z.string(),
  disabled: z.oboolean(),
  flow: ZodDraftFlow.optional(),
}) satisfies z.ZodType<APIButtonComponentWithCustomId>;

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

export const ZodAPIButtonComponent = z.union([
  ZodAPIButtonComponentWithCustomId,
  ZodAPIButtonComponentWithURL,
  ZodAPIButtonComponentWithSkuId,
]);

export const ZodAPIStringSelectMenuComponent: z.ZodType<APIStringSelectComponent> =
  z.object({
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
  });

export const ZodAPIRoleSelectMenuComponent: z.ZodType<APIRoleSelectComponent> =
  z.object({
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
  });

export const ZodAPIUserSelectMenuComponent: z.ZodType<APIUserSelectComponent> =
  z.object({
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
  });

export const ZodAPIMentionableSelectMenuComponent: z.ZodType<APIMentionableSelectComponent> =
  z.object({
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
  });

export const ZodAPIChannelSelectMenuComponent: z.ZodType<APIChannelSelectComponent> =
  z.object({
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
  });

export const ZodAPISelectMenuComponent = z.union([
  ZodAPIStringSelectMenuComponent,
  ZodAPIRoleSelectMenuComponent,
  ZodAPIUserSelectMenuComponent,
  ZodAPIMentionableSelectMenuComponent,
  ZodAPIChannelSelectMenuComponent,
]);

export const ZodAPIMessageActionRowComponent = z.union([
  ZodAPIButtonComponent,
  ZodAPISelectMenuComponent,
]);

export const ZodAPIActionRowComponent = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: ZodAPIMessageActionRowComponent.array(),
});
