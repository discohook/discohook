export interface Flow {
  name: string;
  actions: FlowAction[];
}

export enum FlowActionType {
  /** Does nothing */
  Dud = 0,
  /** Sleeps for a predefined amount of time */
  Wait,
  /** Adds a role to the invoking member */
  AddRole,
  /** Removes a role from the invoking member */
  RemoveRole,
  /** Toggles a role for the invoking member */
  ToggleRole,
  /** Sends a custom message as the bot */
  SendMessage,
  /** Sends a custom message as a webhook */
  SendWebhookMessage,
  // /** Shows a custom modal to the user */
  // SendModal,
}

export interface FlowActionBase {
  type: FlowActionType;
  /** This action can finalize an interaction flow */
  isResponse?: boolean;
  /** This action must happen after a response */
  mustFollow?: boolean;
}

export interface FlowActionDud extends FlowActionBase {
  type: FlowActionType.Dud;
  isResponse: true;
}

export interface FlowActionWait extends FlowActionBase {
  type: FlowActionType.Wait;
  mustFollow: true;
  seconds: number;
}

export interface FlowActionAddRole extends FlowActionBase {
  type: FlowActionType.AddRole;
  roleId: string;
}

export interface FlowActionRemoveRole extends FlowActionBase {
  type: FlowActionType.RemoveRole;
  roleId: string;
}

export interface FlowActionToggleRole extends FlowActionBase {
  type: FlowActionType.ToggleRole;
  roleId: string;
}

export interface FlowActionSendMessage extends FlowActionBase {
  type: FlowActionType.SendMessage;
  isResponse: true;
  backupId: number;
}

export interface FlowActionSendWebhookMessage extends FlowActionBase {
  type: FlowActionType.SendWebhookMessage;
  webhookId: string;
  backupId: number;
}

export type FlowAction =
  | FlowActionDud
  | FlowActionWait
  | FlowActionAddRole
  | FlowActionRemoveRole
  | FlowActionToggleRole
  | FlowActionSendMessage
  | FlowActionSendWebhookMessage;
