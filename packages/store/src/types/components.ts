import {
  APIMessageComponentEmoji,
  APISelectMenuDefaultValue,
  APISelectMenuOption,
  ButtonStyle,
  ChannelType,
  ComponentType,
  MessageFlags,
  RESTPostAPIGuildForumThreadsJSONBody,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";

export type StorableComponent =
  | {
      type: ComponentType.Button;
      style:
        | ButtonStyle.Primary
        | ButtonStyle.Secondary
        | ButtonStyle.Success
        | ButtonStyle.Danger;
      label?: string;
      emoji?: APIMessageComponentEmoji;
      flow: Flow;
      disabled?: boolean;
    }
  | {
      type: ComponentType.Button;
      style: ButtonStyle.Link;
      label?: string;
      emoji?: APIMessageComponentEmoji;
      url: string;
      disabled?: boolean;
    }
  | {
      type: ComponentType.StringSelect;
      flows: Record<string, Flow>;
      options: APISelectMenuOption[];
      placeholder?: string;
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    }
  | {
      type:
        | ComponentType.UserSelect
        | ComponentType.RoleSelect
        | ComponentType.MentionableSelect
        | ComponentType.ChannelSelect;
      flow: Flow;
      placeholder?: string;
      minValues?: number;
      maxValues?: number;
      defaultValues?: APISelectMenuDefaultValue<SelectMenuDefaultValueType>[];
      disabled?: boolean;
    };

export interface Flow {
  name: string;
  actions: FlowAction[];
}

export enum FlowActionType {
  /** Do nothing */
  Dud = 0,
  /** Sleep for a predefined amount of time */
  Wait = 1,
  /** Ensure that a condition is true before proceeding */
  Check = 2,
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
  /** Create a new thread */
  CreateThread = 8,
  // /** Delete a message with ID `messageId` */
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

export interface FlowActionCheck extends FlowActionBase {
  type: FlowActionType.Check;
}

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
}

export interface FlowActionSetVariable extends FlowActionBase {
  type: FlowActionType.SetVariable;
  varType?: FlowActionSetVariableType;
  name: string;
  value: string | boolean;
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
  backupId: string;
  backupMessageIndex?: number;
  response?: boolean;
  flags?: MessageFlags;
}

export interface FlowActionSendWebhookMessage extends FlowActionBase {
  type: FlowActionType.SendWebhookMessage;
  webhookId: string;
  backupId: string;
  backupMessageIndex?: number;
  flags?: MessageFlags;
}

export interface FlowActionCreateThread extends FlowActionBase {
  type: FlowActionType.CreateThread;
  /** Should be present only if it should be constant
   * (e.g. a channel other than the one in context) */
  channelId?: string;
  name: string;
  autoArchiveDuration?: 60 | 1440 | 4320 | 10080;
  rateLimitPerUser?: number;
  // Text/voice/... only
  // messageId?: string;
  threadType?: ChannelType.PublicThread | ChannelType.PrivateThread;
  invitable?: boolean;
  // Forum/media only
  message?: RESTPostAPIGuildForumThreadsJSONBody["message"];
  appliedTags?: string[];
}

export interface FlowActionDeleteMessage extends FlowActionBase {
  type: FlowActionType.DeleteMessage;
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
  | FlowActionCreateThread
  | FlowActionDeleteMessage;
