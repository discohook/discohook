import { ChannelType, ThreadAutoArchiveDuration } from "discord-api-types/v10";
import { z } from "zod";
import type {
  AnonymousVariable,
  DBFlowAction,
  Flow,
  FlowAction,
  FlowActionAddRole,
  FlowActionCheck,
  FlowActionCheckFunction,
  FlowActionCheckFunctionConditional,
  FlowActionCheckFunctionEquals,
  FlowActionCheckFunctionIn,
  FlowActionCreateThread,
  FlowActionDeleteMessage,
  FlowActionDud,
  FlowActionRemoveRole,
  FlowActionSendMessage,
  FlowActionSendWebhookMessage,
  FlowActionSetVariable,
  FlowActionToggleRole,
  FlowActionWait,
} from "~/store.server";
import { ZodMessageFlags } from "./discord";

// This should match FlowActionType from the store package
// We can't import it at runtime in the client so we re-implement it here
export enum FlowActionType {
  /** Do nothing */
  Dud = 0,
  /** Sleep for a predefined amount of time */
  Wait = 1,
  /** Ensure that a condition is true before proceeding */
  Check = 2,
  /** Set a variable for use in a later action */
  SetVariable = 9,
  Stop = 11,
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
  /** Delete a message with ID `messageId` */
  DeleteMessage = 10,
  // /** Show a custom modal to the user */
  // SendModal,
}

// See above
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
  Get = 2,
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

// For when we can't use the schema directly because it's used to construct the type we're parsing with
const futureSchema = <T extends z.ZodType<any>>(schema: () => T) =>
  z
    .any()
    .refine((obj) => schema().safeParse(obj).success)
    .transform((obj) => schema().parse(obj));

export const ZodFlowActionType = z.nativeEnum(FlowActionType);

export const ZodFlowActionDud: z.ZodType<FlowActionDud> = z.object({
  type: z.literal(FlowActionType.Dud),
});

export const ZodFlowActionWait: z.ZodType<FlowActionWait> = z.object({
  type: z.literal(FlowActionType.Wait),
  seconds: z.number().min(0).max(60),
});

export const ZodFlowActionSetVariable = z.object({
  type: z.literal(FlowActionType.SetVariable),
  varType: z.nativeEnum(FlowActionSetVariableType).optional(),
  name: z.string().max(100),
  value: z.string().max(500).or(z.boolean()),
}) satisfies z.ZodType<FlowActionSetVariable>;

export const ZodAnonymousVariable: z.ZodType<AnonymousVariable> =
  ZodFlowActionSetVariable.omit({
    type: true,
    name: true,
  });

export const ZodFlowActionCheckFunctionConditional: z.ZodType<FlowActionCheckFunctionConditional> =
  z.object({
    type: z.union([
      z.literal(FlowActionCheckFunctionType.And),
      z.literal(FlowActionCheckFunctionType.Or),
      z.literal(FlowActionCheckFunctionType.Not),
    ]),
    conditions: futureSchema(() => ZodFlowActionCheckFunction).array(),
  });

export const ZodFlowActionCheckFunctionIn: z.ZodType<FlowActionCheckFunctionIn> =
  z.object({
    type: z.literal(FlowActionCheckFunctionType.In),
    element: ZodAnonymousVariable,
    array: ZodAnonymousVariable,
  });

export const ZodFlowActionCheckFunctionEquals: z.ZodType<FlowActionCheckFunctionEquals> =
  z.object({
    type: z.literal(FlowActionCheckFunctionType.Equals),
    a: ZodAnonymousVariable,
    b: ZodAnonymousVariable,
    loose: z.oboolean(),
  });

export const ZodFlowActionCheckFunction: z.ZodType<FlowActionCheckFunction> =
  z.union([
    ZodFlowActionCheckFunctionConditional,
    ZodFlowActionCheckFunctionIn,
    ZodFlowActionCheckFunctionEquals,
  ]);

export const ZodFlowActionCheck: z.ZodType<FlowActionCheck> = z.object({
  type: z.literal(FlowActionType.Check),
  function: ZodFlowActionCheckFunction,
  then: futureSchema(() => ZodFlowAction).array(),
  else: futureSchema(() => ZodFlowAction).array(),
});

export const ZodFlowActionAddRole: z.ZodType<FlowActionAddRole> = z.object({
  type: z.literal(FlowActionType.AddRole),
  roleId: z.string(),
});

export const ZodFlowActionRemoveRole: z.ZodType<FlowActionRemoveRole> =
  z.object({
    type: z.literal(FlowActionType.RemoveRole),
    roleId: z.string(),
  });

export const ZodFlowActionToggleRole: z.ZodType<FlowActionToggleRole> =
  z.object({
    type: z.literal(FlowActionType.ToggleRole),
    roleId: z.string(),
  });

export const ZodFlowActionSendMessage: z.ZodType<FlowActionSendMessage> =
  z.object({
    type: z.literal(FlowActionType.SendMessage),
    backupId: z.string(),
    backupMessageId: z.number().nullable().optional(),
    // Better calculated during flow execution?
    // response: z.oboolean(),
    flags: ZodMessageFlags.optional(),
  });

export const ZodFlowActionSendWebhookMessage: z.ZodType<FlowActionSendWebhookMessage> =
  z.object({
    type: z.literal(FlowActionType.SendWebhookMessage),
    webhookId: z.string(),
    backupId: z.string(),
    backupMessageId: z.number().nullable().optional(),
    flags: ZodMessageFlags.optional(),
  });

export const ZodFlowActionCreateThread: z.ZodType<FlowActionCreateThread> =
  z.object({
    type: z.literal(FlowActionType.CreateThread),
    channel: ZodAnonymousVariable,
    name: z.string(),
    autoArchiveDuration: z
      .union([
        z.literal(ThreadAutoArchiveDuration.OneHour),
        z.literal(ThreadAutoArchiveDuration.OneDay),
        z.literal(ThreadAutoArchiveDuration.ThreeDays),
        z.literal(ThreadAutoArchiveDuration.OneWeek),
      ])
      .optional(),
    rateLimitPerUser: z.onumber(),
    threadType: z
      .union([
        z.literal(ChannelType.PublicThread),
        z.literal(ChannelType.PrivateThread),
      ])
      .optional(),
    invitable: z.oboolean(),
    // message: z.any(),
    appliedTags: z.string().array().max(5),
  });

export const ZodFlowActionDeleteMessage: z.ZodType<FlowActionDeleteMessage> =
  z.object({
    type: z.literal(FlowActionType.DeleteMessage),
  });

export const ZodFlowAction: z.ZodType<FlowAction> = z.union([
  ZodFlowActionDud,
  ZodFlowActionWait,
  ZodFlowActionSetVariable,
  ZodFlowActionAddRole,
  ZodFlowActionRemoveRole,
  ZodFlowActionToggleRole,
  ZodFlowActionSendMessage,
  ZodFlowActionSendWebhookMessage,
  ZodFlowActionCreateThread,
  ZodFlowActionDeleteMessage,
]);

export const ZodFlowDBAction: z.ZodType<DBFlowAction> = z.object({
  id: z.bigint(),
  flowId: z.bigint(),
  data: ZodFlowAction,
  type: ZodFlowActionType,
});

export const ZodFlow: z.ZodType<Flow> = z.object({
  id: z.bigint(),
  name: z.string().nullable(),
  actions: ZodFlowDBAction.array(),
});

export const ZodFlowWithMax = (max: number): z.ZodType<Flow> =>
  z.object({
    id: z.bigint(),
    name: z.string().nullable(),
    actions: ZodFlowDBAction.array().max(max),
  });

export const ZodDraftFlow = z.object({
  name: z.string().nullable().optional(),
  actions: ZodFlowAction.array(),
});

export type DraftFlow = z.infer<typeof ZodDraftFlow>;

export const ZodDraftFlowWithMax = (max: number) =>
  z.object({
    name: z.string().nullable().optional(),
    actions: ZodFlowAction.array().max(max),
  });
