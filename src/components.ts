import { APIInteractionResponse, APIMessageComponentButtonInteraction, APIMessageComponentInteraction, APIMessageComponentSelectMenuInteraction } from "discord-api-types/v10";
import { InteractionContext } from "./interactions.js";
import { continueComponentFlow, reopenCustomizeModal } from "./commands/components/add.js";

export interface MinimumKVComponentState {
  componentTimeout: number;
  componentRoutingId: ComponentRoutingId;
}

export type ComponentCallbackT<T extends APIMessageComponentInteraction> = (ctx: InteractionContext<T>) => Promise<APIInteractionResponse | [APIInteractionResponse, () => Promise<void>]>
export type ButtonCallback = ComponentCallbackT<APIMessageComponentButtonInteraction>;
export type SelectMenuCallback = ComponentCallbackT<APIMessageComponentSelectMenuInteraction>;
// export type ModalCallback = ComponentCallbackT<APIModalSubmitInteraction>;

export type ComponentCallback =
  | ButtonCallback
  | SelectMenuCallback;
  // | ModalCallback;

export type StoredComponentData = {
  handler: ComponentCallback;
};

export type ComponentRoutingId =
  | "add-component-flow"
  | "add-component-flow_customize-modal";

export const componentStore: Record<ComponentRoutingId, StoredComponentData> = {
  "add-component-flow": {
    handler: continueComponentFlow,
  },
  "add-component-flow_customize-modal": {
    handler: reopenCustomizeModal,
  }
};
