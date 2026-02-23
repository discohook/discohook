import {
  type ButtonBuilder,
  type ChannelSelectMenuBuilder,
  type MentionableSelectMenuBuilder,
  ModalBuilder,
  type RoleSelectMenuBuilder,
  type StringSelectMenuBuilder,
  TextDisplayBuilder,
  type UserSelectMenuBuilder,
} from "@discordjs/builders";
import { isLinkButton } from "discord-api-types/utils";
import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  type APIChannelSelectComponent,
  type APIComponentInContainer,
  type APIComponentInMessageActionRow,
  type APIMentionableSelectComponent,
  type APIMessage,
  type APIMessageComponent,
  type APIMessageTopLevelComponent,
  type APIRoleSelectComponent,
  type APISelectMenuComponent,
  type APIStringSelectComponent,
  type APITextInputComponent,
  type APIUserSelectComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import {
  type DraftComponent,
  generateId
} from "store";
import type { MinimumKVComponentState } from "../components.js";
import type { Env } from "../types/env.js";
import { MAX_TOTAL_COMPONENTS } from "./constants.js";

export const getCustomId = (temporary = false) => {
  if (!temporary) {
    return `p_${generateId()}`;
  }
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "t_";
  for (let i = 0; i < 98; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

type Builder =
  | ButtonBuilder
  | StringSelectMenuBuilder
  | RoleSelectMenuBuilder
  | UserSelectMenuBuilder
  | ChannelSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ModalBuilder;

export const storeComponents = async <
  T extends [Builder, MinimumKVComponentState][],
>(
  kv: Env["KV"],
  ...components: T
): Promise<T[number][0][]> => {
  for (const [component, state] of components) {
    // These shouldn't necessarily be passed to this function in the first place
    // but it might happen and we don't want to assign a custom_id
    const data = component.data;
    if (
      "type" in data &&
      data.type === ComponentType.Button &&
      data.style === ButtonStyle.Link
    ) {
      continue;
    }

    if (!("custom_id" in data)) {
      component.setCustomId(getCustomId(true));
    }

    if ("type" in data && "custom_id" in data) {
      await kv.put(
        `component-${data.type}-${data.custom_id}`,
        JSON.stringify(state),
        { expirationTtl: state.componentTimeout },
      );
    } else if (component instanceof ModalBuilder) {
      await kv.put(`modal-${component.data.custom_id}`, JSON.stringify(state), {
        expirationTtl: state.componentTimeout,
      });
    }
  }
  return components.map((c) => c[0]);
};

export const getComponentWidth = (component: {
  type: ComponentType;
}): number => {
  switch (component.type) {
    case ComponentType.Button:
      return 1;
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.TextInput:
      return 5;
    default:
      break;
  }
  return 0;
};

export const getRowWidth = (
  row: APIActionRowComponent<
    | APIButtonComponent
    | APIStringSelectComponent
    | APIUserSelectComponent
    | APIRoleSelectComponent
    | APIMentionableSelectComponent
    | APIChannelSelectComponent
    | APITextInputComponent
  >,
): number => {
  return row.components.reduce(
    (last, component) => getComponentWidth(component) + last,
    0,
  );
};

export const parseAutoComponentId = <P extends string>(
  customId: string,
  ...parameters: P[]
) => {
  const [_, routingId, rest] = customId.split("_");

  return {
    routingId,
    ...(Object.fromEntries(
      rest.split(":").map((value, i) => [parameters[i], value]),
    ) as Record<P, string>),
  };
};

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

export const getComponentId = (
  component:
    | Pick<APIButtonComponentWithCustomId, "type" | "style" | "custom_id">
    | Pick<APIButtonComponentWithURL, "type" | "style" | "label" | "url">
    | Pick<APIButtonComponentWithSKUId, "type" | "style" | "sku_id">
    | Pick<APISelectMenuComponent, "type" | "custom_id">,
  components?: { id: bigint; data: DraftComponent }[],
) => {
  if (
    component.type === ComponentType.Button &&
    component.style === ButtonStyle.Link
  ) {
    const url = new URL(component.url);
    const id = url.searchParams.get("dhc-id");
    if (id) {
      try {
        return BigInt(id);
      } catch {}
    }
    if (components) {
      const match = components.find(
        (c) =>
          c.data.type === component.type &&
          c.data.style === component.style &&
          c.data.url === component.url &&
          c.data.label === component.label,
      );
      return match?.id;
    }
    return undefined;
  }
  if ("sku_id" in component) return undefined;

  return /^p_\d+/.test(component.custom_id)
    ? BigInt(component.custom_id.replace(/^p_/, ""))
    : undefined;
};

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
  /**
   * Creates a fake action row for button accessories so that they can be
   * safely returned by this function.
   */
  includeAccessories?: boolean,
) => {
  const rows: APIActionRowComponent<APIComponentInMessageActionRow>[] = [];
  if (includeNested) {
    for (const component of components) {
      if (component.type === ComponentType.Container) {
        rows.push(...component.components.filter(isActionRow));
      } else if (component.type === ComponentType.ActionRow) {
        rows.push(component);
      } else if (
        component.type === ComponentType.Section &&
        component.accessory.type === ComponentType.Button &&
        includeAccessories
      ) {
        rows.push({
          type: ComponentType.ActionRow,
          components: [component.accessory],
        });
      }
    }
  } else {
    for (const component of components) {
      if (component.type === ComponentType.ActionRow) {
        rows.push(component);
      } else if (
        component.type === ComponentType.Section &&
        component.accessory.type === ComponentType.Button &&
        includeAccessories
      ) {
        rows.push({
          type: ComponentType.ActionRow,
          components: [component.accessory],
        });
      }
    }
  }
  return rows;
};

// https://github.com/discohook/discohook/issues/56
// It seems that there is something "delinking" published component IDs from their stored
// values. It could be a number of factors, including:
// - Draft cleanup (probably not - I think the data remains, hence this strategy)
// - Saving shenanigans during editing (either on the main page or component specific page)
// - ???
// As a patch, the below code attempts to find another component in the database (for the
// message ID) which has the same surface details (label, style, emoji, placeholder), only
// in the event that the component cannot be matched by exact ID. I don't love this, but for
// now I think it's my best bet to relieve user frustration.
//
// This is currently a bot-only system designed only for this one purpose. If I can't figure
// out what's causing this issue in the first place, I will probably have little choice but to
// also expand this logic to the site and basically do away with solid custom_id-based
// identification.
//
// I think that an automatic message fixer might also be useful; if we're sure the matched
// component is the right one, we can edit the message to update its ID. But maybe that is best
// left to a queue of things done automatically next time the user edits manually, because a
// lot can go wrong when editing.
// --
// I kind of want to reject the candidate if there are multiple matches. But I don't know if
// that would cause yet more confusion. Maybe I could look at all other components on the
// message and filter out components that have matches, to only look at ones that would
// return the message we're trying to avoid.
// export const matchComponentByDetails = <T extends { data: DraftComponent }>(
//   source: APIComponentInMessageActionRow,
//   wrappedCandidates: T[],
// ): T | undefined =>
//   wrappedCandidates.find((c) => {
//     if (source.type !== c.data.type) return false;
//     if (source.type === ComponentType.Button) {
//       const cdata = c.data as StorableButtonWithCustomIdResolved;
//       if (cdata.style !== source.style) return false;

//       let labelMatch = false;
//       let emojiMatch = false;
//       if ("label" in source && "label" in cdata) {
//         labelMatch = source.label === cdata.label;
//       } else if (!("label" in source) && !("label" in source)) {
//         // match is N/A
//         labelMatch = true;
//       }
//       if ("emoji" in source && "emoji" in cdata) {
//         if (source.emoji && cdata.emoji) {
//           if (source.emoji.id !== undefined) {
//             emojiMatch = source.emoji.id === cdata.emoji.id;
//           } else {
//             emojiMatch = source.emoji.name === cdata.emoji.name;
//           }
//         } else {
//           emojiMatch = source.emoji === undefined && cdata.emoji === undefined;
//         }
//       } else if (!("emoji" in source) && !("emoji" in source)) {
//         // match is N/A
//         emojiMatch = true;
//       }
//       return labelMatch && emojiMatch;
//     } else if (
//       [
//         ComponentType.StringSelect,
//         ComponentType.ChannelSelect,
//         ComponentType.MentionableSelect,
//         ComponentType.RoleSelect,
//         ComponentType.UserSelect,
//       ].includes(source.type)
//     ) {
//       const cdata = c.data as
//         | StorableStringSelectResolved
//         | StorableAutopopulatedSelectResolved;
//       return cdata.placeholder === source.placeholder;
//     }
//     return false;
//   });

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
    : 5 - components.length;
};

// This is used for select option arrays, which is why it's in this file
/** Slice `array` into multiple chunks of, at maximum, `chunkSize` length */
export const chunkArray = <T extends Array<unknown>>(
  array: T,
  chunkSize: number,
): T[] => {
  const chunks: T[] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize) as T);
  }
  return chunks;
};

export const textDisplay = (content: string) =>
  new TextDisplayBuilder().setContent(content);
