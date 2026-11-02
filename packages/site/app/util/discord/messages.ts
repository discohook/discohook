import { isLinkButton } from "discord-api-types/utils/v10";
import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIComponentInContainer,
  type APIContainerComponent,
  type APIEmbedImage,
  type APIEmbedVideo,
  type APIGuild,
  type APIMediaGalleryItem,
  type APIMessage,
  type APIMessageComponent,
  type APISectionComponent,
  type APISelectMenuComponent,
  type APIUnfurledMediaItem,
  ButtonStyle,
  ComponentType,
  EmbedMediaFlags,
  GuildPremiumTier,
  MessageFlags,
  UnfurledMediaItemFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import type {
  APIButtonComponentWithURL,
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
} from "~/types/QueryData";
import type { QueryDataMessageDataRaw } from "~/types/QueryData-raw";
import {
  MAX_FILE_SIZE_DEFAULT,
  MAX_FILE_SIZE_TIER_2,
  MAX_FILE_SIZE_TIER_3,
  MAX_TOTAL_COMPONENTS,
  MAX_V1_ROWS,
} from "../constants";

export const isSkuButton = (
  component: Pick<APIButtonComponent, "type" | "style">,
): component is APIButtonComponentWithSKUId =>
  component.type === ComponentType.Button &&
  component.style === ButtonStyle.Premium;

export const hasCustomId = (
  component: APIMessageComponent,
): component is APIButtonComponentWithCustomId | APISelectMenuComponent =>
  (component.type === ComponentType.Button &&
    !isSkuButton(component) &&
    !isLinkButton(component)) ||
  component.type === ComponentType.StringSelect ||
  component.type === ComponentType.RoleSelect ||
  component.type === ComponentType.UserSelect ||
  component.type === ComponentType.ChannelSelect ||
  component.type === ComponentType.MentionableSelect;

export const isActionRow = (
  component: APIMessageTopLevelComponent,
): component is APIActionRowComponent<APIComponentInMessageActionRow> =>
  component.type === ComponentType.ActionRow;

export const onlyActionRows = (
  components: APIMessageTopLevelComponent[],
  /**
   * Also look for action rows within containers,
   * useful if you do not need sibling context.
   */
  includeNested?: boolean,
) => {
  const rows: APIActionRowComponent<APIComponentInMessageActionRow>[] = [];
  if (includeNested) {
    for (const component of components) {
      if (component.type === ComponentType.Container) {
        rows.push(...component.components.filter(isActionRow));
      } else if (component.type === ComponentType.ActionRow) {
        rows.push(component);
      }
    }
  } else {
    rows.push(...components.filter(isActionRow));
  }
  return rows;
};

export const extractInteractiveComponents = (
  components: APIMessageTopLevelComponent[],
): APIComponentInMessageActionRow[] => {
  return extractComponentsByType(components, [
    ComponentType.Button,
    ComponentType.ChannelSelect,
    ComponentType.MentionableSelect,
    ComponentType.RoleSelect,
    ComponentType.StringSelect,
    ComponentType.UserSelect,
  ]) as APIComponentInMessageActionRow[];
};

// TODO: return type
export const extractComponentsByType = <T extends ComponentType>(
  components: APIMessageTopLevelComponent[],
  types: T[],
) => {
  const match = (c: { type: ComponentType }) => types.includes(c.type as T);
  const found = [];

  for (const component of components) {
    if (match(component)) found.push(component);

    if (component.type === ComponentType.Container) {
      for (const r of component.components) {
        if (match(r)) found.push(r);

        if (r.type === ComponentType.ActionRow) {
          found.push(...r.components.filter(match));
        } else if (r.type === ComponentType.Section && match(r.accessory)) {
          found.push(r.accessory);
        }
      }
    } else if (component.type === ComponentType.ActionRow) {
      found.push(...component.components.filter(match));
    } else if (
      component.type === ComponentType.Section &&
      match(component.accessory)
    ) {
      found.push(component.accessory);
    }
  }
  return found;
};

export const isComponentsV2 = (message: Pick<APIMessage, "flags">): boolean =>
  new MessageFlagsBitField(message.flags ?? 0).has(MessageFlags.IsComponentsV2);

export const isStorableComponent = (
  component:
    | APIComponentInMessageActionRow
    | APIMessageTopLevelComponent
    | APIComponentInContainer,
): component is
  | APIButtonComponentWithCustomId
  | APIButtonComponentWithURL
  | APISelectMenuComponent => {
  return (
    [
      ComponentType.StringSelect,
      ComponentType.ChannelSelect,
      ComponentType.MentionableSelect,
      ComponentType.RoleSelect,
      ComponentType.UserSelect,
    ].includes(component.type) ||
    (component.type === ComponentType.Button &&
      component.style !== ButtonStyle.Premium)
  );
};

export const getTotalComponentsCount = (
  components: APIMessageTopLevelComponent[],
): number =>
  components
    ?.map((c) => 1 + ("components" in c ? c.components.length : 0))
    .reduce((a, b) => a + b, 0) ?? 0;

export const getRemainingComponentsCount = (
  components: APIMessageTopLevelComponent[],
  v2?: boolean,
): number => {
  const isV2 =
    v2 ??
    // Auto detect if not provided
    components.find((c) => c.type !== ComponentType.ActionRow) !== undefined;
  return isV2
    ? MAX_TOTAL_COMPONENTS - getTotalComponentsCount(components)
    : MAX_V1_ROWS - components.length;
};

const embedMediaToUnfurledMediaItem = (
  original: APIEmbedImage | APIEmbedVideo,
): APIUnfurledMediaItem => {
  const originalFlags = original.flags ?? 0;
  let flags = 0 as UnfurledMediaItemFlags;
  // easier to do bitmath here since we dont have BitFields for either of these
  if (
    (originalFlags & EmbedMediaFlags.IsAnimated) ===
    EmbedMediaFlags.IsAnimated
  ) {
    flags |= UnfurledMediaItemFlags.IsAnimated;
  }
  return {
    url: original.url ?? "http://localhost#embedMediaToUnfurledMediaItem",
    proxy_url: original.proxy_url,
    content_type: original.content_type,
    flags,
    width: original.width,
    height: original.height,
  };
};

// not in love with this function name
/**
 * Returns true if the component may house storable components, either
 * immediately (action row), under another layer of components (container),
 * or as the section accessory.
 */
export const isComponentHousable = (
  component: APIMessageComponent,
): component is
  | APIContainerComponent
  | APIActionRowComponent<APIComponentInMessageActionRow>
  | APISectionComponent =>
  [
    ComponentType.Container,
    ComponentType.ActionRow,
    ComponentType.Section,
  ].includes(component.type);

export const convertMessageToComponents = (
  message: QueryDataMessageDataRaw,
) => {
  const flags = new MessageFlagsBitField(message.flags ?? 0);
  if (flags.has(MessageFlags.IsComponentsV2)) return message;
  flags.add(MessageFlags.IsComponentsV2);

  const { content, embeds, components, flags: _, ...keepData } = message;
  const data: QueryDataMessageDataRaw = {
    flags: Number(flags.value),
    ...keepData,
  };

  data.components = [];
  if (content) {
    data.components.push({ type: ComponentType.TextDisplay, content });
  }
  for (const embed of embeds ?? []) {
    const container: APIContainerComponent = {
      type: ComponentType.Container,
      accent_color: embed.color,
      components: [],
    };

    if (embed.author) {
      container.components.push({
        type: ComponentType.TextDisplay,
        content: embed.author.url
          ? `-# [${embed.author.name}](${embed.author.url})`
          : `-# ${embed.author.name}`,
      });
    }

    const addBody = <T extends typeof container.components>(
      components: T,
    ): T => {
      if (embed.title) {
        components.push({
          type: ComponentType.TextDisplay,
          content: embed.url
            ? `### [${embed.title}](${embed.url})`
            : `### ${embed.title}`,
        });
      }
      if (embed.description) {
        // This alone may push the message over the text limit (4096 vs 4000)
        // In an effort to minimize loss, I'm choosing not to strip the text.
        // It won't fail zod validation, but it will fail when the user sends
        // it to Discord
        components.push({
          type: ComponentType.TextDisplay,
          content: embed.description,
        });
      }
      if (embed.fields?.length) {
        components.push({
          type: ComponentType.TextDisplay,
          content: embed.fields
            .map((field) => `**${field.name}**\n\n${field.value}`)
            .join("\n"),
        });
      }
      return components;
    };

    if (embed.thumbnail) {
      container.components.push({
        type: ComponentType.Section,
        components: addBody([]),
        accessory: {
          type: ComponentType.Thumbnail,
          media: embedMediaToUnfurledMediaItem(embed.thumbnail),
        },
      });
    } else {
      addBody(container.components);
    }

    if (embed.image) {
      const item: APIMediaGalleryItem = {
        media: embedMediaToUnfurledMediaItem(embed.image),
      };
      const extantGallery = container.components.find(
        (c) => c.type === ComponentType.MediaGallery,
      );
      if (extantGallery) {
        extantGallery.items.push(item);
      } else {
        container.components.push({
          type: ComponentType.MediaGallery,
          items: [item],
        });
      }
    }
    if (embed.video?.url) {
      container.components.push({
        type: ComponentType.MediaGallery,
        items: [{ media: embedMediaToUnfurledMediaItem(embed.video) }],
      });
    }

    if (embed.footer) {
      container.components.push({
        type: ComponentType.TextDisplay,
        content: `-# ${embed.footer.text}`,
      });
    }

    data.components.push(container);
  }

  // Only going to be action rows
  if (components) {
    data.components.push(...components);
  }

  return data;
};

const hexTimestampToDate = (hex: string): Date =>
  new Date(Number.parseInt(hex.replace(/^0x/i, ""), 16) * 1000);

export const parseAttachmentParams = (params: URLSearchParams) => {
  const ex = params.get("ex");
  const is = params.get("is");
  const hm = params.get("hm");
  return {
    ex: ex ? hexTimestampToDate(ex) : null,
    is: is ? hexTimestampToDate(is) : null,
    hm,
    sv: params.get("sv") === "1",
  };
};

export const parseAttachmentUrl = (url: string) => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw Error(`Invalid attachment URL: ${url}`);
  }
  const [_, __, channelId, attachmentId, filename] = parsed.pathname.split("/");
  return {
    channelId,
    attachmentId,
    filename,
    ...parseAttachmentParams(parsed.searchParams),
  };
};

export const isDiscordAttachmentUrl = (url: string | URL): boolean => {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  return (
    ["media.discordapp.net", "cdn.discordapp.com"].includes(u.hostname) &&
    u.pathname.startsWith("/attachments")
  );
};

export const calculateMaxFileSize = (
  guild: Pick<APIGuild, "premium_tier" | "features">,
): number => {
  switch (guild.premium_tier) {
    case GuildPremiumTier.Tier3:
      return MAX_FILE_SIZE_TIER_3;
    case GuildPremiumTier.Tier2:
      return MAX_FILE_SIZE_TIER_2;
    default:
      return MAX_FILE_SIZE_DEFAULT;
  }
};
