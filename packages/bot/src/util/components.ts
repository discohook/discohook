import {
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from "@discordjs/builders";
import { isLinkButton } from "discord-api-types/utils";
import {
  APIActionRowComponent,
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithSKUId,
  APIButtonComponentWithURL,
  APIChannelSelectComponent,
  APIComponentInMessageActionRow,
  APIMentionableSelectComponent,
  APIMessage,
  APIMessageComponent,
  APIMessageTopLevelComponent,
  APIRoleSelectComponent,
  APISelectMenuComponent,
  APIStringSelectComponent,
  APITextInputComponent,
  APIUserSelectComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import { type StorableComponent, generateId } from "store";
import { MinimumKVComponentState } from "../components.js";
import { Env } from "../types/env.js";

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
  components?: { id: bigint; data: StorableComponent }[],
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

export const onlyActionRows = (components: APIMessageTopLevelComponent[]) =>
  components.filter(isActionRow);

export const isComponentsV2 = (message: Pick<APIMessage, "flags">): boolean =>
  new MessageFlagsBitField(message.flags ?? 0).has(MessageFlags.IsComponentsV2);
