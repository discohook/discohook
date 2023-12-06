import { APIInteractionResponse, APIMessageComponentButtonInteraction, APIMessageComponentInteraction, APIMessageComponentSelectMenuInteraction } from "discord-api-types/v10";
import { InteractionContext } from "./interactions.js";
import { continueComponentFlow, reopenCustomizeModal } from "./commands/components/add.js";

export interface MinimumKVComponentState {
  /** The total number of seconds that the component should be stored. */
  componentTimeout: number;
  /** Where the server should look for a registered callback in the
   * component store. */
  componentRoutingId: ComponentRoutingId;
  /** If `true`, the component handler will no longer be called after its
   * first successful response. This is not immune to race conditions, e.g.
   * two users pressing a button at the same time. */
  componentOnce?: boolean;
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
  },
};
