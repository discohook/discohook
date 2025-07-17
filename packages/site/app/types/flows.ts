import { ChannelType, ThreadAutoArchiveDuration } from "discord-api-types/v10";
import { z } from "zod";
import type {
  AnonymousVariable,
  DBFlowAction,
  DraftFlow,
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
  FlowActionSendRawMessage,
  FlowActionSendWebhookMessage,
  FlowActionSetVariable,
  FlowActionStop,
  FlowActionToggleRole,
  FlowActionWait,
} from "~/store.server";
import { ZodMessageFlags } from "./discord";
import { ZodQueryDataMessageDataRaw } from "./QueryData-raw";
import { futureSchema } from "./zod";

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
  /** Send a custom message using raw data (no backup) */
  SendRawMessage = 12,
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

export const ZodFlowActionType = z.nativeEnum(FlowActionType);

export const ZodFlowActionDud = z.object({
  type: z.literal(FlowActionType.Dud),
}) satisfies z.ZodType<FlowActionDud>;

export const ZodFlowActionWait = z.object({
  type: z.literal(FlowActionType.Wait),
  seconds: z.number().min(0).max(60),
}) satisfies z.ZodType<FlowActionWait>;

export const ZodFlowActionSetVariable = z.object({
  type: z.literal(FlowActionType.SetVariable),
  varType: z.nativeEnum(FlowActionSetVariableType).optional(),
  name: z.string().max(100),
  value: z.string().max(500).or(z.boolean()),
}) satisfies z.ZodType<FlowActionSetVariable>;

export const ZodAnonymousVariable = ZodFlowActionSetVariable.omit({
  type: true,
  name: true,
}) satisfies z.ZodType<AnonymousVariable>;

export const ZodFlowActionCheckFunctionConditional = z.object({
  type: z.union([
    z.literal(FlowActionCheckFunctionType.And),
    z.literal(FlowActionCheckFunctionType.Or),
    z.literal(FlowActionCheckFunctionType.Not),
  ]),
  conditions: futureSchema(() => ZodFlowActionCheckFunction).array(),
}) satisfies z.ZodType<FlowActionCheckFunctionConditional>;

export const ZodFlowActionCheckFunctionIn = z.object({
  type: z.literal(FlowActionCheckFunctionType.In),
  element: ZodAnonymousVariable,
  array: ZodAnonymousVariable,
}) satisfies z.ZodType<FlowActionCheckFunctionIn>;

export const ZodFlowActionCheckFunctionEquals = z.object({
  type: z.literal(FlowActionCheckFunctionType.Equals),
  a: ZodAnonymousVariable,
  b: ZodAnonymousVariable,
  loose: z.oboolean(),
}) satisfies z.ZodType<FlowActionCheckFunctionEquals>;

export const ZodFlowActionCheckFunction: z.ZodType<FlowActionCheckFunction> =
  z.union([
    ZodFlowActionCheckFunctionConditional,
    ZodFlowActionCheckFunctionIn,
    ZodFlowActionCheckFunctionEquals,
  ]);

export const ZodFlowActionCheck = z.object({
  type: z.literal(FlowActionType.Check),
  function: ZodFlowActionCheckFunction,
  then: futureSchema(() => ZodFlowAction).array(),
  else: futureSchema(() => ZodFlowAction).array(),
}) satisfies z.ZodType<FlowActionCheck>;

export const ZodFlowActionStop = z.object({
  type: z.literal(FlowActionType.Stop),
  message: z
    .object({
      content: z.string().max(2000).optional(),
      flags: ZodMessageFlags.optional(),
    })
    .optional(),
}) satisfies z.ZodType<FlowActionStop>;

export const ZodFlowActionAddRole = z.object({
  type: z.literal(FlowActionType.AddRole),
  roleId: z.string(),
}) satisfies z.ZodType<FlowActionAddRole>;

export const ZodFlowActionRemoveRole = z.object({
  type: z.literal(FlowActionType.RemoveRole),
  roleId: z.string(),
}) satisfies z.ZodType<FlowActionRemoveRole>;

export const ZodFlowActionToggleRole = z.object({
  type: z.literal(FlowActionType.ToggleRole),
  roleId: z.string(),
}) satisfies z.ZodType<FlowActionToggleRole>;

export const ZodFlowActionSendMessage = z.object({
  type: z.literal(FlowActionType.SendMessage),
  backupId: z.string(),
  backupMessageIndex: z.number().nullable().optional(),
  // Better calculated during flow execution?
  // response: z.oboolean(),
  flags: ZodMessageFlags.optional(),
}) satisfies z.ZodType<FlowActionSendMessage>;

export const ZodFlowActionSendWebhookMessage = z.object({
  type: z.literal(FlowActionType.SendWebhookMessage),
  webhookId: z.string(),
  backupId: z.string(),
  backupMessageIndex: z.number().nullable().optional(),
  flags: ZodMessageFlags.optional(),
}) satisfies z.ZodType<FlowActionSendWebhookMessage>;

export const ZodFlowActionSendRawMessage = z.object({
  type: z.literal(FlowActionType.SendRawMessage),
  webhookId: z.ostring(),
  channelId: z.ostring(),
  message: ZodQueryDataMessageDataRaw,
  flags: ZodMessageFlags.optional(),
}) satisfies z.ZodType<FlowActionSendRawMessage>;

export const ZodFlowActionCreateThread = z.object({
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
  appliedTags: z.string().array().max(5).optional(),
}) satisfies z.ZodType<FlowActionCreateThread>;

export const ZodFlowActionDeleteMessage = z.object({
  type: z.literal(FlowActionType.DeleteMessage),
}) satisfies z.ZodType<FlowActionDeleteMessage>;

export const ZodFlowAction: z.ZodType<FlowAction> = z.discriminatedUnion(
  "type",
  [
    ZodFlowActionDud,
    ZodFlowActionCheck,
    ZodFlowActionStop,
    ZodFlowActionWait,
    ZodFlowActionSetVariable,
    ZodFlowActionAddRole,
    ZodFlowActionRemoveRole,
    ZodFlowActionToggleRole,
    ZodFlowActionSendMessage,
    ZodFlowActionSendWebhookMessage,
    ZodFlowActionCreateThread,
    ZodFlowActionDeleteMessage,
  ],
);

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

export const ZodDraftFlow: z.ZodType<DraftFlow> = z.object({
  name: z.string().nullable().optional(),
  actions: ZodFlowAction.array(),
});

export const refineZodDraftFlowMax = (premium: boolean) =>
  z.object({
    name: z.string().nullable().optional(),
    actions: ZodFlowAction.array().superRefine((actions, ctx) => {
      const flattenAction = (a: FlowAction): FlowAction[] =>
        a.type === 2
          ? [...(a.then ?? []), ...(a.else ?? [])].flatMap(flattenAction)
          : [a];
      const allActions = actions.flatMap(flattenAction);
      const counted = allActions.filter(
        (a) =>
          a.type !== FlowActionType.Check && a.type !== FlowActionType.Stop,
      );
      const messageActions = allActions.filter(
        (a) =>
          a.type === FlowActionType.SendMessage ||
          a.type === FlowActionType.SendWebhookMessage,
      );

      if (messageActions.length > 15) {
        ctx.addIssue({
          code: "custom",
          message: "Cannot have more than 15 message actions.",
        });
        return z.NEVER;
      }
      const max = premium ? 40 : 10;
      if (counted.length > max) {
        ctx.addIssue({
          code: "custom",
          message: `Cannot have more than ${max} counted actions${
            !premium ? " for non-premium users" : ""
          }.`,
        });
        return z.NEVER;
      }
    }),
  });
