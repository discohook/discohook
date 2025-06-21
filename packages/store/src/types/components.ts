import type {
  APIMessageComponentEmoji,
  APISelectMenuDefaultValue,
  APISelectMenuOption,
  ButtonStyle,
  ChannelType,
  ComponentType,
  MessageFlags,
  RESTPostAPIChannelMessageJSONBody,
  SelectMenuDefaultValueType,
  ThreadAutoArchiveDuration,
} from "discord-api-types/v10";
import type { flowActions, flows } from "../schema/schema.js";
import type { QueryData } from "./backups.js";

export interface StorableButtonWithCustomId {
  type: ComponentType.Button;
  style:
    | ButtonStyle.Primary
    | ButtonStyle.Secondary
    | ButtonStyle.Success
    | ButtonStyle.Danger;
  flowId: string;
  label?: string;
  emoji?: APIMessageComponentEmoji;
  disabled?: boolean;
}

export type StorableButtonWithCustomIdResolved = Omit<
  StorableButtonWithCustomId,
  "flowId"
> & {
  flow: DraftFlow;
};

export interface StorableButtonWithUrl {
  type: ComponentType.Button;
  style: ButtonStyle.Link;
  label?: string;
  emoji?: APIMessageComponentEmoji;
  url: string;
  disabled?: boolean;
}

export interface StorableButtonWithSkuId {
  type: ComponentType.Button;
  style: ButtonStyle.Premium;
  sku_id: string;
  disabled?: boolean;
}

export interface StorableStringSelect {
  type: ComponentType.StringSelect;
  // Considering: this could be reduced by automatically assigning flow
  // IDs to be option values (and vice versa) - so the submitted value
  // tells the application which flow to execute. The only holdoff on this
  // is that, when users are able to have a `maxValue > 1`, they will need
  // to be able to conveniently refer to option values
  flowIds: Record<string, string>;
  options: APISelectMenuOption[];
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

export type StorableStringSelectResolved = Omit<
  StorableStringSelect,
  "flowIds"
> & {
  flows: Record<string, DraftFlow>;
};

export interface StorableAutopopulatedSelect {
  type:
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;
  flowId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  defaultValues?: APISelectMenuDefaultValue<SelectMenuDefaultValueType>[];
  disabled?: boolean;
}

export type StorableAutopopulatedSelectResolved = Omit<
  StorableAutopopulatedSelect,
  "flowId"
> & {
  flow: DraftFlow;
};

export type StorableComponent =
  | StorableButtonWithCustomId
  | StorableButtonWithUrl
  | StorableButtonWithSkuId
  | StorableStringSelect
  | StorableAutopopulatedSelect;

export type DraftComponent =
  | StorableButtonWithCustomIdResolved
  | StorableButtonWithUrl
  | StorableButtonWithSkuId
  | StorableStringSelectResolved
  | StorableAutopopulatedSelectResolved;

export type Flow = typeof flows.$inferSelect & {
  actions: DBFlowAction[];
};

export interface DraftFlow {
  name?: string | null;
  actions: FlowAction[];
}

export type DBFlowAction = typeof flowActions.$inferSelect;

export enum FlowActionType {
  /** Do nothing */
  Dud = 0,
  /** Sleep for a predefined amount of time */
  Wait = 1,
  /** Ensure that a condition is true before proceeding */
  Check = 2,
  /** Halt execution and optionally attempt to send a simple error message */
  Stop = 11,
  /** Set a variable for use in a later action */
  SetVariable = 9,
  /** Add a role to the invoking member */
  AddRole = 3,
  /** Remove a role from the invoking member */
  RemoveRole = 4,
  /** Toggle a role for the invoking member */
  ToggleRole = 5,
  /** Send a custom message as the bot */
  SendMessage = 6,
  /** Send a custom message as a webhook */
  SendWebhookMessage = 7,
  /** Send a custom message using raw data (no backup) */
  SendRawMessage = 12,
  /** Create a new thread */
  CreateThread = 8,
  /** Delete a message with ID `messageId` */
  DeleteMessage = 10,
  // /** Show a custom modal to the user */
  // SendModal,
}

export interface FlowActionBase {
  type: FlowActionType;
}

export interface FlowActionDud extends FlowActionBase {
  type: FlowActionType.Dud;
}

export interface FlowActionWait extends FlowActionBase {
  type: FlowActionType.Wait;
  seconds: number;
}

export enum FlowActionCheckFunctionType {
  /** All conditions must be true. */
  And = 0,
  /** One or more conditions must be true. */
  Or = 1,
  /** Exactly one condition must be true. */
  // Xor = 2,
  /** All conditions must be false, a.k.a. NOR. */
  Not = 3,
  /** The provided element A must be contained in array B. */
  In = 4,
  /** The provided element A must equal element B. */
  Equals = 5,
  // We should support numbers before adding support for gt/lt
  // Less,
  // Greater,
  // Sum,
}

export interface FlowActionCheck extends FlowActionBase {
  type: FlowActionType.Check;
  function: FlowActionCheckFunction;
  then: FlowAction[];
  else: FlowAction[];
}

export interface FlowActionCheckFunctionConditional {
  type:
    | FlowActionCheckFunctionType.And
    | FlowActionCheckFunctionType.Or
    | FlowActionCheckFunctionType.Not;
  conditions: FlowActionCheckFunction[];
}

export interface FlowActionCheckFunctionIn {
  type: FlowActionCheckFunctionType.In;
  element: AnonymousVariable;
  array: AnonymousVariable;
}

export interface FlowActionCheckFunctionEquals {
  type: FlowActionCheckFunctionType.Equals;
  a: AnonymousVariable;
  b: AnonymousVariable;
  /** Whether to use loose equality (==) */
  loose?: boolean;
}

export type FlowActionCheckFunction =
  | FlowActionCheckFunctionConditional
  | FlowActionCheckFunctionIn
  | FlowActionCheckFunctionEquals;

export enum FlowActionSetVariableType {
  /** A static variable is a value that does not change. */
  Static = 0,
  /**
   * An adaptive variable is calculated based on the return value of the
   * previous action. If the previous action was a `SendMessage` and the
   * adaptive variable value is `channel_id`, then the resolved value of
   * this variable will be the channel ID of the message that was sent.
   */
  Adaptive = 1,
  /** Resolves the value of a previous variable. */
  Get = 2,
}

export interface FlowActionSetVariable extends FlowActionBase {
  type: FlowActionType.SetVariable;
  varType?: FlowActionSetVariableType;
  name: string;
  value: string | boolean;
}

export type AnonymousVariable = Pick<
  FlowActionSetVariable,
  "varType" | "value"
>;

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
  backupId: string;
  backupMessageIndex?: number | null;
  response?: boolean;
  flags?: MessageFlags;
}

export interface FlowActionSendWebhookMessage extends FlowActionBase {
  type: FlowActionType.SendWebhookMessage;
  webhookId: string;
  backupId: string;
  backupMessageIndex?: number | null;
  flags?: MessageFlags;
}

export interface FlowActionSendRawMessage extends FlowActionBase {
  type: FlowActionType.SendRawMessage;
  webhookId?: string;
  channelId?: string;
  message: QueryData["messages"][number]["data"];
  flags?: MessageFlags;
}

export interface FlowActionCreateThread extends FlowActionBase {
  type: FlowActionType.CreateThread;
  channel: AnonymousVariable;
  name: string;
  autoArchiveDuration?: ThreadAutoArchiveDuration;
  rateLimitPerUser?: number;
  // Text/voice/... only
  // messageId?: string;
  threadType?: ChannelType.PublicThread | ChannelType.PrivateThread;
  invitable?: boolean;
  // Forum/media only
  message?: RESTPostAPIChannelMessageJSONBody;
  appliedTags?: string[];
}

export interface FlowActionDeleteMessage extends FlowActionBase {
  type: FlowActionType.DeleteMessage;
}

export interface FlowActionStop extends FlowActionBase {
  type: FlowActionType.Stop;
  message?: Pick<RESTPostAPIChannelMessageJSONBody, "content" | "flags">;
}

export type FlowAction =
  | FlowActionDud
  | FlowActionWait
  | FlowActionCheck
  | FlowActionSetVariable
  | FlowActionAddRole
  | FlowActionRemoveRole
  | FlowActionToggleRole
  | FlowActionSendMessage
  | FlowActionSendWebhookMessage
  | FlowActionSendRawMessage
  | FlowActionCreateThread
  | FlowActionDeleteMessage
  | FlowActionStop;
