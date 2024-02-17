import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import { z } from "zod";

export const ZodPartialEmoji = z.object({
  id: z.string(),
  name: z.ostring(),
  animated: z.oboolean(),
});

export const ZodAPIButtonComponent = z.object({
  type: z.literal(ComponentType.Button),
  style: z.union([
    z.literal(ButtonStyle.Primary),
    z.literal(ButtonStyle.Secondary),
    z.literal(ButtonStyle.Success),
    z.literal(ButtonStyle.Danger),
    z.literal(ButtonStyle.Link),
  ]),
  label: z.ostring(),
  emoji: ZodPartialEmoji.optional(),
  custom_id: z.ostring(),
  url: z.ostring(),
  disabled: z.oboolean(),
});

export const ZodAPISelectMenuComponent = z.object({
  type: z.union([
    z.literal(ComponentType.StringSelect),
    z.literal(ComponentType.UserSelect),
    z.literal(ComponentType.RoleSelect),
    z.literal(ComponentType.MentionableSelect),
    z.literal(ComponentType.ChannelSelect),
  ]),
  custom_id: z.string(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        description: z.ostring(),
        emoji: ZodPartialEmoji.optional(),
        default: z.oboolean(),
      }),
    )
    .optional(),
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
  placeholder: z.ostring(),
  default_values: z
    .array(
      z.object({
        id: z.string(),
        type: z.union([
          z.literal(SelectMenuDefaultValueType.User),
          z.literal(SelectMenuDefaultValueType.Role),
          z.literal(SelectMenuDefaultValueType.Channel),
        ]),
      }),
    )
    .optional(),
  min_values: z.onumber(),
  max_values: z.onumber(),
  disabled: z.oboolean(),
});

export const ZodAPIMessageActionRowComponent = z.union([
  ZodAPIButtonComponent,
  ZodAPISelectMenuComponent,
]);
