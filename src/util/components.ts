import { ButtonBuilder, ChannelSelectMenuBuilder, MentionableSelectMenuBuilder, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "@discordjs/builders";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { Env } from "../types/env.js";
import { MinimumKVComponentState } from "../components.js";

export const getCustomId = (temporary = false) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = temporary ? "t_" : "p_";
  for (let i = 0; i < 98; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

type Builder =
  | ButtonBuilder
  | StringSelectMenuBuilder
  | RoleSelectMenuBuilder
  | UserSelectMenuBuilder
  | ChannelSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ModalBuilder;

export const storeComponents = async <T extends [Builder, MinimumKVComponentState][]>(kv: Env["KV"], ...components: T): Promise<T[number][0][]> => {
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
    }
  }
  return components.map(c => c[0]);
}
