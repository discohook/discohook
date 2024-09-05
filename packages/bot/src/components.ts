import {
  APIInteractionResponse,
  APIMessageComponentButtonInteraction,
  APIMessageComponentInteraction,
  APIMessageComponentSelectMenuInteraction,
  APIModalSubmitInteraction,
} from "discord-api-types/v10";
import {
  continueComponentFlow,
  reopenCustomizeModal,
  submitCustomizeModal,
} from "./commands/components/add.js";
import {
  deleteComponentButtonEntry,
  deleteComponentCancel,
  deleteComponentConfirm,
  deleteComponentFlowPickCallback,
} from "./commands/components/delete.js";
import {
  editComponentButtonEntry,
  editComponentFlowModalCallback,
  editComponentFlowModalResendCallback,
  editComponentFlowModeCallback,
  editComponentFlowPickCallback,
} from "./commands/components/edit.js";
import {
  migrateComponentsCancel,
  migrateComponentsConfirm,
} from "./commands/components/migrate.js";
import { deleteReactionRoleButtonCallback } from "./commands/reactionRoles.js";
import { selectRestoreOptionsCallback } from "./commands/restore.js";
import {
  webhookDeleteCancel,
  webhookDeleteConfirm,
} from "./commands/webhooks/webhookDelete.js";
import {
  webhookInfoShowUrlCallback,
  webhookInfoUseCallback,
} from "./commands/webhooks/webhookInfo.js";
import { InteractionContext } from "./interactions.js";

export interface MinimumKVComponentState {
  /** The total number of seconds that the component/modal should be stored. */
  componentTimeout: number;
  /** Where the server should look for a registered callback in the
   * component/modal store. */
  componentRoutingId: StorableRoutingId;
  /** If `true`, the handler will no longer be called after its
   * first successful response. This is not immune to race conditions, e.g.
   * two users pressing a button at the same time. */
  componentOnce?: boolean;
}

export type ComponentCallbackT<T extends APIMessageComponentInteraction> = (
  ctx: InteractionContext<T>,
) => Promise<
  APIInteractionResponse | [APIInteractionResponse, () => Promise<void>]
>;
export type ButtonCallback =
  ComponentCallbackT<APIMessageComponentButtonInteraction>;
export type SelectMenuCallback =
  ComponentCallbackT<APIMessageComponentSelectMenuInteraction>;
export type ModalCallback = (
  ctx: InteractionContext<APIModalSubmitInteraction>,
) => Promise<
  APIInteractionResponse | [APIInteractionResponse, () => Promise<void>]
>;

export type ComponentCallback = ButtonCallback | SelectMenuCallback;

export type StoredComponentData = { handler: ComponentCallback };
export type StoredModalData = { handler: ModalCallback };

export type ModalRoutingId =
  | "add-component-flow-customize-modal"
  | "edit-component-flow-modal";

export type ComponentRoutingId =
  | "add-component-flow"
  | "add-component-flow-customize-modal-resend"
  | "edit-component-flow-ctx"
  | "edit-component-flow-pick"
  | "edit-component-flow-mode"
  | "edit-component-flow-modal-resend"
  | "delete-component-pick-ctx"
  | "delete-component-pick"
  | "delete-component-confirm"
  | "delete-component-cancel"
  | "delete-reaction-role"
  | "select-restore-options"
  | "webhook-info-use"
  | "webhook-info-show-url"
  | "webhook-delete-confirm"
  | "webhook-delete-cancel"
  | "migrate-buttons-confirm"
  | "migrate-buttons-cancel";

export type StorableRoutingId = ComponentRoutingId | ModalRoutingId;

export type AutoComponentCustomId = `a_${ComponentRoutingId}_${string}`;

export type AutoModalCustomId = `a_${ModalRoutingId}_${string}`;

export const componentStore: Record<ComponentRoutingId, StoredComponentData> = {
  "add-component-flow": {
    handler: continueComponentFlow,
  },
  "add-component-flow-customize-modal-resend": {
    handler: reopenCustomizeModal,
  },
  "edit-component-flow-ctx": {
    handler: editComponentButtonEntry,
  },
  "edit-component-flow-pick": {
    handler: editComponentFlowPickCallback,
  },
  "edit-component-flow-mode": {
    handler: editComponentFlowModeCallback,
  },
  "edit-component-flow-modal-resend": {
    handler: editComponentFlowModalResendCallback,
  },
  "delete-component-pick": {
    handler: deleteComponentFlowPickCallback,
  },
  "delete-component-pick-ctx": {
    handler: deleteComponentButtonEntry,
  },
  "delete-component-confirm": {
    handler: deleteComponentConfirm,
  },
  "delete-component-cancel": {
    handler: deleteComponentCancel,
  },
  "delete-reaction-role": {
    handler: deleteReactionRoleButtonCallback,
  },
  "select-restore-options": {
    handler: selectRestoreOptionsCallback,
  },
  "webhook-info-use": { handler: webhookInfoUseCallback },
  "webhook-info-show-url": { handler: webhookInfoShowUrlCallback },
  "webhook-delete-confirm": { handler: webhookDeleteConfirm },
  "webhook-delete-cancel": { handler: webhookDeleteCancel },
  "migrate-buttons-confirm": { handler: migrateComponentsConfirm },
  "migrate-buttons-cancel": { handler: migrateComponentsCancel },
};

export const modalStore: Record<ModalRoutingId, StoredModalData> = {
  "add-component-flow-customize-modal": {
    handler: submitCustomizeModal,
  },
  "edit-component-flow-modal": {
    handler: editComponentFlowModalCallback,
  },
};
