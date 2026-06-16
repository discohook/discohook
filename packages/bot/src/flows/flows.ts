import type { REST, RouteLike } from "@discordjs/rest";
import {
  type APIGuildMember,
  type APIMessage,
  type APIMessageChannelSelectInteractionData,
  type APIMessageComponentInteraction,
  type APIMessageMentionableSelectInteractionData,
  type APIMessageRoleSelectInteractionData,
  type APIMessageUserSelectInteractionData,
  type APIUser,
  ChannelType,
  GuildPremiumTier,
  InteractionType,
  PermissionFlagsBits,
  type RESTError,
  type RESTGetAPIChannelResult,
  type RESTPostAPIChannelThreadsJSONBody,
  type RESTPostAPIChannelThreadsResult,
  type RESTPostAPIGuildForumThreadsJSONBody,
  Routes,
} from "discord-api-types/v10";
import { MessageFlagsBitField, PermissionsBitField } from "discord-bitflag";
import { SignJWT } from "jose";
import {
  type AnonymousVariable,
  type DBWithSchema,
  type DraftFlow,
  type FlowAction,
  type FlowActionAddRole,
  type FlowActionCheckFunction,
  FlowActionCheckFunctionType,
  type FlowActionCreateThread,
  type FlowActionRemoveRole,
  type FlowActionSendMessage,
  type FlowActionSendWebhookMessage,
  type FlowActionSetVariable,
  FlowActionSetVariableType,
  type FlowActionToggleRole,
  FlowActionType,
  getchTriggerGuild,
  getDb,
  makeSnowflake,
  messageLogEntries,
  type TriggerKVGuild,
  webhooks,
} from "store";
import z from "zod";
import { getWebhook } from "../commands/webhooks/webhookInfo.js";
import { InteractionContext } from "../interactions.js";
import type { Env } from "../types/env.js";
import { isDiscordError } from "../util/error.js";
import { isThreadMessage } from "../util/messages.js";
import { createREST } from "../util/rest.js";
import { sleep } from "../util/sleep.js";
import {
  getReplacements,
  insertReplacements,
  processQueryData,
} from "./backup.js";

export interface LiveVariables {
  member?: APIGuildMember;
  user?: APIUser;
  guild?: TriggerKVGuild;
  selected_values?: string[];
  selected_resolved?: (
    | APIMessageChannelSelectInteractionData
    | APIMessageMentionableSelectInteractionData
    | APIMessageRoleSelectInteractionData
    | APIMessageUserSelectInteractionData
  )["resolved"];
}

export class FlowFailure extends Error {
  constructor(
    public message: string,
    public discordError?: RESTError,
  ) {
    super();
  }
}

export class FlowStop extends Error {
  constructor() {
    super("Halt due to stop-type action");
  }
}

// export class FlowPause extends Error {
//   constructor(until: Date) {
//     const sec = Math.floor((until.valueOf() - new Date().valueOf()) / 1000);
//     super(
//       `Paused due to wait-type action, thus ended in this process. Flow will resume in ${sec} seconds`,
//     );
//   }
// }

export interface FlowResult {
  status: "success" | "failure";
  stopped?: boolean;
  paused?: boolean;
  message: string;
  discordError?: RESTError;
}

type SetVariables = Record<string, string | boolean>;

type SentMessages = Record<string, { route: RouteLike }>;

const TriggerKVGuildScheme: z.ZodType<TriggerKVGuild> = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  owner_id: z.string(),
  members: z.number(),
  online_members: z.number(),
  roles: z.number(),
  boosts: z.number(),
  boost_level: z.enum(GuildPremiumTier),
  vanity_code: z.string().nullable(),
  emoji_limit: z.number().optional(),
  sticker_limit: z.number().optional(),
  _roles: z
    .object({
      id: z.string(),
      position: z.number(),
      permissions: z.string(),
    })
    .array()
    .optional(),
});

const ResponsibleUser = z.object({
  id: z.string(),
  username: z.string(),
  guild_permissions: z.string(),
  /** role ids */
  roles: z.string().array(),
  /** why the user is considered responsible (usually that they were the latest to edit something) */
  reason: z.string().optional(),
});

export type ResponsibleUser = z.infer<typeof ResponsibleUser>;

const BouncerPayloadScheme = z.object({
  liveVars: z.object({
    member: z
      .object({ user: z.object({ id: z.string() }).loose() })
      .loose()
      .optional(),
    user: z.object({ id: z.string() }).loose().loose().optional(),
    guild: TriggerKVGuildScheme.optional(),
    selected_values: z.string().array().optional(),
    selected_resolved: z.record(z.string(), z.object({}).loose()).optional(),
  }) as z.ZodType<LiveVariables>,
  setVars: (
    z.record(
      z.string(),
      z.union([z.string(), z.boolean()]),
    ) satisfies z.ZodType<SetVariables>
  ).optional(),
  sentMessages: (
    z.record(
      z.string(),
      z.object({ route: z.string().regex(/^\//) as z.ZodType<RouteLike> }),
    ) satisfies z.ZodType<SentMessages>
  ).optional(),
  lastReturnValue: z.any().optional(),
  recursion: z.number().int().min(0).optional(),
  interaction: (
    (
      z.object({
        type: z.literal(InteractionType.MessageComponent),
        id: z.string(),
        token: z.string(),
        guild_id: z.string().optional(),
      }) satisfies z.ZodType<
        Pick<
          APIMessageComponentInteraction,
          "id" | "token" | "guild_id" | "type"
        >
      >
    ).loose() as unknown as z.ZodType<APIMessageComponentInteraction>
  ).optional(),
  flow: z.looseObject({
    actions: z
      .looseObject({
        type: z.enum(FlowActionType),
      })
      .array(),
  }) as z.ZodType<Pick<DraftFlow, "actions">>,
  responsibleUser: ResponsibleUser.optional(),
});

export const bounceFlow = async (
  env: Env,
  payload: z.infer<typeof BouncerPayloadScheme>,
  until?: Date,
) => {
  if (!env.BOUNCER_ORIGIN || !env.BOUNCER_JWT_KEY) {
    throw Error("Worker is not configured with bouncer details");
  }

  const key = new TextEncoder().encode(env.BOUNCER_JWT_KEY);
  const jwt = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("discohook:bot")
    .setAudience("discohook:bouncer")
    .setExpirationTime("1 minute")
    .sign(key);
  await fetch(`${env.BOUNCER_ORIGIN}/flow/pause`, {
    method: "POST",
    body: JSON.stringify({
      until: until ? until.valueOf() : undefined,
      payload,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  });
};

export const resumeFlowFromBouncer = async (
  env: Env,
  raw: unknown,
): Promise<FlowResult> => {
  const parsed = await z.object({ payload: BouncerPayloadScheme }).spa(raw);
  if (!parsed.success) {
    return {
      status: "failure",
      message: `Invalid payload to resume: ${JSON.stringify(z.treeifyError(parsed.error))}`,
    };
  }
  const { payload } = parsed.data;

  const db = getDb(env.HYPERDRIVE);
  const rest = createREST(env);
  const ctx = payload.interaction
    ? new InteractionContext(rest, payload.interaction, env)
    : undefined;

  // console.log("running from bounce", payload.flow);
  return await executeFlow({
    env,
    flow: payload.flow,
    rest,
    db,
    liveVars: payload.liveVars,
    setVars: payload.setVars,
    ctx,
    recursion: payload.recursion,
    lastReturnValue: payload.lastReturnValue,
    sentMessages: payload.sentMessages,
    responsibleUser: payload.responsibleUser,
  });
};

export const getResponsibleUser = async (
  rest: REST,
  guild: Pick<TriggerKVGuild, "id" | "_roles">,
  userId: string,
  reason?: string,
): Promise<ResponsibleUser | undefined> => {
  let member: APIGuildMember;
  try {
    member = (await rest.get(
      Routes.guildMember(guild.id, userId),
    )) as APIGuildMember;
  } catch {
    return undefined;
  }
  const guildPermissions = new PermissionsBitField();
  if (guild._roles) {
    for (const roleId of member.roles) {
      const role = guild._roles.find((r) => r.id === roleId);
      if (!role) continue;
      guildPermissions.add(BigInt(role.permissions));
    }
  }

  return {
    id: member.user.id,
    username: member.user.username,
    roles: member.roles.sort((a, b) => {
      const aRole = guild._roles?.find((r) => r.id === a);
      const bRole = guild._roles?.find((r) => r.id === b);
      return (bRole?.position ?? 0) - (aRole?.position ?? 0);
    }),
    guild_permissions: String(guildPermissions.value),
    reason,
  };
};

export const executeFlow = async (options: {
  env: Env;
  flow: Pick<DraftFlow, "actions">;
  rest: REST;
  db: DBWithSchema;
  liveVars: LiveVariables;
  setVars?: SetVariables;
  ctx?: InteractionContext<APIMessageComponentInteraction>;
  recursion?: number;
  lastReturnValue?: any;
  sentMessages?: SentMessages;
  deferred?: boolean;
  responsibleUser?: ResponsibleUser;
  /** WARNING: do not pass to recursive executions. only level 0 should handle this. */
  responsibleUserId?: string;
  /** WARNING: do not pass to recursive executions. only level 0 should handle this. */
  responsibilityReason?: string;
}): Promise<FlowResult> => {
  const {
    env,
    flow,
    rest,
    db,
    liveVars,
    setVars,
    ctx,
    recursion = 0,
    lastReturnValue: lastReturnValue_,
    sentMessages: sentMessages_,
    deferred = false,
    responsibleUser: responsibleUser_,
    responsibleUserId,
    responsibilityReason,
  } = options;
  if (recursion > 50) {
    return {
      status: "failure",
      message: `Too much recursion (${recursion} layers)`,
    };
  }
  let responsibleUser = responsibleUser_;
  if (
    !responsibleUser &&
    responsibleUserId &&
    liveVars.guild &&
    recursion === 0
  ) {
    // console.log(
    //   "Resolving responsible user",
    //   liveVars.guild.id,
    //   responsibleUserId,
    // );
    responsibleUser = await getResponsibleUser(
      rest,
      liveVars.guild,
      responsibleUserId,
      responsibilityReason,
    );
  }
  // console.log("Responsible:", responsibleUser);

  const responsibleOwner =
    !!responsibleUser && liveVars.guild?.owner_id === responsibleUser?.id;
  const responsibleGuildPermissions = new PermissionsBitField(
    BigInt(responsibleUser?.guild_permissions ?? 0),
  );
  const checkRoleIdManageable = async (roleId: string, quiet = false) => {
    if (!responsibleUser) {
      if (quiet) return false;
      throw new FlowFailure(
        "A responsible user could not be determined for this flow, so out of safety the role cannot be managed.",
      );
    }
    if (liveVars.guild?.owner_id === responsibleUser.id) return true;
    if (!responsibleGuildPermissions.has(PermissionFlagsBits.ManageRoles)) {
      if (quiet) return false;
      throw new FlowFailure(
        "The responsible user for this flow does not have the Manage Roles permission.",
      );
    }
    let incoming = liveVars.guild?._roles?.find((r) => r.id === roleId);
    if (!incoming && liveVars.guild) {
      // Refresh cache in case it's a new role or there is no roles cache
      try {
        liveVars.guild = await getchTriggerGuild(rest, env, liveVars.guild.id);
        incoming = liveVars.guild._roles?.find((r) => r.id === roleId);
      } catch {}
    }
    if (!incoming) {
      if (quiet) return false;
      throw new FlowFailure(
        "The role to be managed could not be found in the server.",
      );
    }
    if (liveVars.guild?._roles) {
      const responsibleRoles = responsibleUser.roles
        .map((r) => liveVars.guild?._roles?.find((guildR) => r === guildR.id))
        .filter((v) => !!v)
        .sort((a, b) => b.position - a.position);
      if (responsibleRoles.length === 0) return false;

      const responsibleHighestRole = responsibleRoles[0];
      const canManage = incoming.position < responsibleHighestRole.position;
      if (!canManage) {
        if (quiet) return false;
        throw new FlowFailure(
          "The responsible user for this flow has a highest role that is lower or equal to the role to be added or removed. Out of safety, the role cannot be managed.",
        );
      }
      return true;
    }
    // At minimum, disallow management of roles the user does not already have
    const hasRole = responsibleUser.roles.includes(roleId);
    if (!hasRole) {
      if (quiet) return false;
      throw new FlowFailure(
        "The responsible user for this flow may not be able to add or remove this role. Out of safety, it cannot be managed.",
      );
    }
    return true;
  };

  try {
    if (
      recursion === 0 &&
      deferred &&
      env.BOUNCER_ORIGIN &&
      env.BOUNCER_JWT_KEY
    ) {
      // console.log("Calculating if bounce is required");
      const processWait = (action: FlowAction): number => {
        switch (action.type) {
          case FlowActionType.Wait:
            return action.seconds;
          case FlowActionType.Check: {
            // only one branch can happen, but we don't know which yet,
            // so we take the maximum
            const thenWait = action.then
              .map(processWait)
              .reduce((a, b) => a + b, 0);
            const elseWait = action.else
              .map(processWait)
              .reduce((a, b) => a + b, 0);
            return Math.max(thenWait, elseWait);
          }
          default:
            return 0;
        }
      };

      let cumulativeWait = 0;
      for (const action of flow.actions) {
        cumulativeWait += processWait(action);
      }
      // console.log({ message: "Calculated possible wait", cumulativeWait });

      // May need to lower or raise this
      if (cumulativeWait >= 30) {
        // console.log("Bouncing to", env.BOUNCER_ORIGIN);
        await bounceFlow(env, {
          liveVars,
          setVars,
          recursion: recursion + 1,
          interaction: ctx?.interaction,
          flow,
          responsibleUser,
        });
        return {
          status: "success",
          message: `Flow bounced to another process due to ≤${cumulativeWait}s of waiting time. Unfortunately Discohook is currently unable to give detailed feedback on this flow.`,
          paused: true,
          // TODO: some sort of job ID/a way to, at least, send a message in a channel to give feedback
        };
      }
    }
  } catch (e) {
    console.error(e);
    // try to continue without bouncing
  }

  // For now, this exists for more efficient operation of the delete message
  // action. This lets us use the webhook routes when appropriate, without
  // storing the whole context.
  const sentMessages: SentMessages = sentMessages_ ?? {};

  const vars = setVars ?? {};
  let lastReturnValue: any = lastReturnValue_;
  const resolveSetVariable = (
    v: FlowActionSetVariable | AnonymousVariable,
  ): string | boolean => {
    if (v.varType === FlowActionSetVariableType.Adaptive) {
      if (!lastReturnValue) {
        throw new FlowFailure(
          `Adaptive variable \`${
            "name" in v ? v.name : "[anonymous]"
          }\` was attempted to be assigned with attribute \`${
            v.value
          }\`, but there was no previous return value.`,
        );
      }
      return lastReturnValue[String(v.value)];
    } else if (v.varType === FlowActionSetVariableType.Get) {
      const replacements = getReplacements(liveVars, vars);
      return (
        Object.fromEntries(
          Object.entries(replacements).map((entry) => [entry[0], entry[1]]),
        )[v.value.toString()] ?? ""
      ).toString();
    }
    return v.value;
  };

  const reason = getReason(responsibleUser);
  let subActionsCompleted = 0;
  try {
    for (const action of flow.actions) {
      switch (action.type) {
        case FlowActionType.Dud:
          break;
        case FlowActionType.Wait:
          await sleep(action.seconds * 1000);
          break;
        case FlowActionType.SetVariable:
          vars[action.name] = resolveSetVariable(action);
          break;
        case FlowActionType.Check: {
          /** Get the boolean results of all functions provided */
          const recurseFunctions = (
            functions: FlowActionCheckFunction[],
          ): boolean[] => {
            const results: boolean[] = [];
            for (const func of functions) {
              switch (func.type) {
                case FlowActionCheckFunctionType.And: {
                  results.push(
                    recurseFunctions(func.conditions).filter((r) => r !== true)
                      .length === 0,
                  );
                  break;
                }
                case FlowActionCheckFunctionType.Or: {
                  results.push(
                    recurseFunctions(func.conditions).filter((r) => r === true)
                      .length >= 1,
                  );
                  break;
                }
                case FlowActionCheckFunctionType.Not: {
                  results.push(
                    recurseFunctions(func.conditions).filter((r) => r === true)
                      .length === 0,
                  );
                  break;
                }
                case FlowActionCheckFunctionType.In: {
                  let arr: unknown[];
                  try {
                    const raw =
                      func.array.varType === FlowActionSetVariableType.Static
                        ? func.array.value
                        : resolveSetVariable(func.array);
                    arr = JSON.parse(raw.toString());
                    if (!Array.isArray(arr)) {
                      throw Error("Not an array");
                    }
                  } catch {
                    throw new FlowFailure(
                      "Provided `array` value could not be parsed as an array.",
                    );
                  }
                  const resolved = resolveSetVariable(func.element);
                  results.push(arr.includes(resolved));
                  break;
                }
                case FlowActionCheckFunctionType.Equals: {
                  const a = resolveSetVariable(func.a);
                  const b = resolveSetVariable(func.b);
                  // I thought the `loose` option might be useful in the future.
                  // It defaults to false since non-strict equality can be confusing.
                  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
                  // biome-ignore lint/suspicious/noDoubleEquals: ^
                  results.push(func.loose ? a == b : a === b);
                  break;
                }
                default:
                  // This shouldn't happen, but we want to keep the return array length the same
                  results.push(false);
                  break;
              }
            }
            return results;
          };

          const checkResult = recurseFunctions([action.function])[0];
          if (checkResult) {
            const result = await executeFlow({
              env,
              flow: { actions: action.then ?? [] },
              rest,
              db,
              liveVars,
              setVars: vars,
              ctx,
              recursion: recursion + 1,
              lastReturnValue,
              sentMessages,
              responsibleUser,
            });
            if (result.status === "success") {
              subActionsCompleted += action.then?.length ?? 0;
              if (result.stopped) throw new FlowStop();
            }
          } else {
            const result = await executeFlow({
              env,
              flow: { actions: action.else ?? [] },
              rest,
              db,
              liveVars,
              setVars: vars,
              ctx,
              recursion: recursion + 1,
              lastReturnValue,
              sentMessages,
              responsibleUser,
            });
            if (result.status === "success") {
              subActionsCompleted += action.else?.length ?? 0;
              if (result.stopped) throw new FlowStop();
            }
          }
          break;
        }
        case FlowActionType.SendMessage:
          if (!vars.channelId) {
            throw new FlowFailure(
              "No `channelId` variable was set, so the message could not be sent.",
            );
          }
          lastReturnValue = await executeSendMessage(
            action,
            rest,
            db,
            vars as { channelId: string },
            liveVars,
            ctx,
          );
          sentMessages[lastReturnValue.id] = {
            // prefer deleting with the interaction credentials
            route: ctx
              ? Routes.webhookMessage(
                  ctx.interaction.application_id,
                  ctx.interaction.token,
                  lastReturnValue.id,
                )
              : Routes.channelMessage(
                  vars.channelId as string,
                  lastReturnValue.id,
                ),
          };
          break;
        case FlowActionType.SendWebhookMessage: {
          const returned = await executeSendWebhookMessage(
            action,
            rest,
            db,
            vars,
            liveVars,
            env,
          );
          lastReturnValue = returned.message;
          sentMessages[lastReturnValue.id] = {
            // delete with the webhook credentials
            route: Routes.webhookMessage(
              returned.webhook.id,
              returned.webhook.token,
              lastReturnValue.id,
            ),
          };
          break;
        }
        case FlowActionType.DeleteMessage: {
          if (!vars.messageId) {
            throw new FlowFailure(
              "No `messageId` variable was set, so no message could be deleted.",
            );
          }
          const msg = sentMessages[vars.messageId as string];
          if (msg) {
            await executeDeleteMessage(rest, msg.route, reason);
          } else {
            if (!vars.channelId) {
              throw new FlowFailure(
                "No `channelId` variable was set, so no message could be deleted.",
              );
            }
            await executeDeleteMessage(
              rest,
              Routes.channelMessage(
                vars.channelId as string,
                vars.messageId as string,
              ),
              reason,
            );
          }
          break;
        }
        case FlowActionType.AddRole:
          if (!liveVars.guild) {
            throw new FlowFailure(
              "No server was provided to the flow executor.",
            );
          }
          await checkRoleIdManageable(action.roleId);
          await executeAddRole(
            rest,
            action,
            liveVars.guild.id,
            vars as { userId: string },
            reason,
          );
          break;
        case FlowActionType.RemoveRole:
          if (!liveVars.guild) {
            throw new FlowFailure(
              "No server was provided to the flow executor.",
            );
          }
          await checkRoleIdManageable(action.roleId);
          await executeRemoveRole(
            rest,
            action,
            liveVars.guild.id,
            vars as { userId: string },
            reason,
          );
          break;
        case FlowActionType.ToggleRole:
          if (!liveVars.guild) {
            throw new FlowFailure(
              "No server was provided to the flow executor.",
            );
          }
          await checkRoleIdManageable(action.roleId);
          await executeToggleRole(
            rest,
            action,
            liveVars.guild.id,
            vars as { userId: string },
            reason,
          );
          break;
        case FlowActionType.CreateThread: {
          if (!responsibleOwner) {
            if (
              action.threadType === ChannelType.PrivateThread &&
              !responsibleGuildPermissions.has(
                PermissionFlagsBits.CreatePrivateThreads,
              )
            ) {
              throw new FlowFailure(
                "The responsible user for this flow does not have the Create Private Threads permission.",
              );
            }
            if (
              !responsibleGuildPermissions.has(
                PermissionFlagsBits.CreatePublicThreads,
              )
            ) {
              throw new FlowFailure(
                "The responsible user for this flow does not have the Create Public Threads permission.",
              );
            }
          }

          const channelId =
            resolveSetVariable(action.channel)?.toString() ?? vars.channelId;
          lastReturnValue = await executeCreateThread(
            rest,
            action,
            { channelId },
            liveVars,
            reason,
            undefined,
          );
          break;
        }
        case FlowActionType.Stop:
          if (action.message && !!action.message.content?.trim()) {
            try {
              const { body } = await processQueryData(
                { messages: [{ data: action.message }] },
                liveVars,
                vars,
              );
              if (ctx) {
                await ctx.followup.send(body);
              } else {
                const { channelId } = vars;
                if (channelId && typeof channelId === "string") {
                  await rest.post(Routes.channelMessages(channelId), {
                    body,
                  });
                }
              }
            } catch (e) {
              console.error(e);
              throw httpFlowFailure(e, "Failed to send the message.");
            }
          }
          throw new FlowStop();
        default:
          break;
      }
    }
  } catch (e) {
    if (e instanceof FlowStop) {
      return {
        status: "success",
        stopped: true,
        message: `${
          flow.actions.length + subActionsCompleted
        } actions completed successfully`,
      };
      // } else if (e instanceof FlowPause) {
      //   return {
      //     status: "success",
      //     paused: true,
      //     message: `${
      //       flow.actions.length + subActionsCompleted
      //     } actions completed prior to pause due to wait action - flow will resume automatically`,
      //   };
    } else {
      if (e instanceof FlowFailure) {
        return {
          status: "failure",
          message: e.message,
          discordError: e.discordError,
        };
      }
      console.error(e);
      return {
        status: "failure",
        message: String(e),
      };
    }
  }
  return {
    status: "success",
    message: `${
      flow.actions.length + subActionsCompleted
    } actions completed successfully`,
  };
};

const httpFlowFailure = (e: unknown, message: string) => {
  if (isDiscordError(e)) {
    return new FlowFailure(message, e.rawError);
  }
  return new FlowFailure(message);
};

const getReason = (user: ResponsibleUser | undefined) => {
  if (user === undefined) return "Action in a flow";
  const base = `Flow action, responsibility of ${user.username} (${user.id})`;
  return user.reason ? `${base}: ${user.reason}` : base;
};

const executeSendMessage = async (
  action: FlowActionSendMessage,
  rest: REST,
  db: DBWithSchema,
  setVars: {
    channelId: string;
  },
  liveVars: LiveVariables,
  ctx?: InteractionContext<APIMessageComponentInteraction>,
): Promise<APIMessage> => {
  const backup = await db.query.backups.findFirst({
    where: (backups, { eq }) => eq(backups.id, makeSnowflake(action.backupId)),
    columns: {
      data: true,
    },
  });
  if (!backup) {
    throw new FlowFailure(
      "No backup was found with the stored ID, so there was no data to send the message.",
    );
  }
  if (backup.data.messages.length === 0) {
    throw new FlowFailure("The backup contains no messages.");
  }

  let message: APIMessage;
  try {
    const { body } = await processQueryData(
      backup.data,
      liveVars,
      setVars,
      action.backupMessageIndex,
    );
    const flags = Number(
      new MessageFlagsBitField(body.flags ?? 0, action.flags ?? 0).value,
    );

    if (
      ctx &&
      (!setVars.channelId ||
        setVars.channelId === ctx.interaction.channel.id) &&
      !ctx.isExpired()
    ) {
      message = await ctx.followup.send({ ...body, flags });
    } else {
      message = (await rest.post(Routes.channelMessages(setVars.channelId), {
        body: { ...body, flags },
      })) as APIMessage;
    }
  } catch (e) {
    console.error(e);
    throw httpFlowFailure(e, "Failed to send the message.");
  }
  return message;
};

const executeSendWebhookMessage = async (
  action: FlowActionSendWebhookMessage,
  rest: REST,
  db: DBWithSchema,
  vars: SetVariables,
  liveVars: LiveVariables,
  env: Env,
): Promise<{ webhook: { id: string; token: string }; message: APIMessage }> => {
  let webhook = await db.query.webhooks.findFirst({
    where: (webhooks, { eq, and }) =>
      and(eq(webhooks.platform, "discord"), eq(webhooks.id, action.webhookId)),
    columns: {
      id: true,
      token: true,
      discordGuildId: true,
      channelId: true,
      applicationId: true,
    },
  });
  if (!webhook || !webhook.token) {
    try {
      const retryWebhook = await getWebhook(
        action.webhookId,
        env,
        webhook?.applicationId ?? undefined,
      );
      webhook = {
        id: retryWebhook.id,
        token: retryWebhook.token ?? null,
        discordGuildId: retryWebhook.guild_id
          ? BigInt(retryWebhook.guild_id)
          : null,
        channelId: retryWebhook.channel_id,
        applicationId: retryWebhook.application_id,
      };
      if (webhook?.token) {
        await db
          .insert(webhooks)
          .values({
            ...webhook,
            name: retryWebhook.name ?? "Webhook",
            platform: "discord",
          })
          .onConflictDoUpdate({
            target: [webhooks.platform, webhooks.id],
            set: webhook,
          });
      }
    } catch {}
  }
  if (!webhook || !webhook.token) {
    throw new FlowFailure(
      "No webhook was found with the stored ID or it did not have a token associated with it.",
    );
  }

  const backup = await db.query.backups.findFirst({
    where: (backups, { eq }) => eq(backups.id, makeSnowflake(action.backupId)),
    columns: {
      data: true,
    },
  });
  if (!backup) {
    throw new FlowFailure(
      "No backup was found with the stored ID, so there was no data to send the message.",
    );
  }
  if (backup.data.messages.length === 0) {
    throw new FlowFailure("The backup contains no messages.");
  }

  let message: APIMessage;
  try {
    const { query, body } = await processQueryData(
      backup.data,
      liveVars,
      vars,
      action.backupMessageIndex,
    );
    query.set("wait", "true");
    if (typeof vars.threadId === "string" && vars.threadId) {
      query.set("thread_id", vars.threadId);
    }
    const flags = Number(
      new MessageFlagsBitField(body.flags ?? 0, action.flags ?? 0).value,
    );

    message = (await rest.post(Routes.webhook(webhook.id, webhook.token), {
      query,
      body: { ...body, flags },
    })) as APIMessage;
  } catch (e) {
    console.error(e);
    throw httpFlowFailure(e, "Failed to send the message.");
  }
  try {
    const msg = backup.data.messages[action.backupMessageIndex ?? 0].data;
    await db.insert(messageLogEntries).values({
      type: "send",
      webhookId: webhook.id,
      channelId: webhook.channelId,
      messageId: message.id,
      threadId: isThreadMessage(message) ? message.channel_id : undefined,
      discordGuildId: webhook.discordGuildId,
      hasContent: !!msg.content,
      embedCount: msg.embeds?.length,
      notifiedEveryoneHere: message.mention_everyone,
      notifiedUsers: message.mentions?.map((u) => u.id),
      notifiedRoles: message.mention_roles,
    });
  } catch {}
  return {
    // not expanding causes TS to think token is nullable
    webhook: { id: webhook.id, token: webhook.token },
    message,
  };
};

const executeDeleteMessage = async (
  rest: REST,
  route: RouteLike,
  reason: string,
): Promise<void> => {
  try {
    await rest.delete(route, { reason });
  } catch (e) {
    throw httpFlowFailure(e, "Failed to delete the message.");
  }
};

const executeAddRole = async (
  rest: REST,
  action: FlowActionAddRole,
  guildId: string,
  setVars: { userId: string },
  reason: string,
) => {
  if (!setVars.userId) {
    throw new FlowFailure("No user ID was set.");
  }
  try {
    await rest.put(
      Routes.guildMemberRole(guildId, setVars.userId, action.roleId),
      { reason },
    );
  } catch (e) {
    throw httpFlowFailure(e, "Failed to add the role.");
  }
};

const executeRemoveRole = async (
  rest: REST,
  action: FlowActionRemoveRole,
  guildId: string,
  setVars: { userId: string },
  reason: string,
) => {
  if (!setVars.userId) {
    throw new FlowFailure("No user ID was set.");
  }
  try {
    await rest.delete(
      Routes.guildMemberRole(guildId, setVars.userId, action.roleId),
      { reason },
    );
  } catch (e) {
    throw httpFlowFailure(e, "Failed to remove the role.");
  }
};

const executeToggleRole = async (
  rest: REST,
  action: FlowActionToggleRole,
  guildId: string,
  setVars: { userId: string },
  reason: string,
) => {
  if (!setVars.userId) {
    throw new FlowFailure("No user ID was set.");
  }
  try {
    const member = (await rest.get(
      Routes.guildMember(guildId, setVars.userId),
    )) as APIGuildMember;
    if (member.roles.includes(action.roleId)) {
      await rest.delete(
        Routes.guildMemberRole(guildId, setVars.userId, action.roleId),
        { reason },
      );
    } else {
      await rest.put(
        Routes.guildMemberRole(guildId, setVars.userId, action.roleId),
        { reason },
      );
    }
  } catch (e) {
    throw httpFlowFailure(e, "Failed to toggle the role.");
  }
};

const executeCreateThread = async (
  rest: REST,
  action: FlowActionCreateThread,
  setVars: { channelId: string },
  liveVars: LiveVariables,
  reason: string,
  ctx?: InteractionContext,
) => {
  const channelId = setVars.channelId;
  if (!channelId) {
    throw new FlowFailure("No channel ID was set.");
  }
  let channelType: ChannelType | undefined;
  if (ctx && ctx.interaction.channel?.id === channelId) {
    channelType = ctx.interaction.channel.type;
  }

  if (!channelType) {
    try {
      ({ type: channelType } = (await rest.get(
        Routes.channel(channelId),
      )) as RESTGetAPIChannelResult);
    } catch (e) {
      throw httpFlowFailure(
        e,
        "Failed to fetch the parent channel for the thread.",
      );
    }
  }

  let messageId: string | undefined;
  if (channelType !== ChannelType.GuildForum && action.message) {
    try {
      ({ id: messageId } = (await rest.post(Routes.channelMessages(channelId), {
        body: action.message,
      })) as APIMessage);
    } catch (e) {
      throw httpFlowFailure(e, "Failed to create a message for the thread.");
    }
  }

  const replacements = getReplacements(liveVars, setVars);
  const name = insertReplacements({ _: action.name }, { replacements })._.slice(
    0,
    100,
  );
  try {
    const thread = (await rest.post(Routes.threads(channelId, messageId), {
      body:
        channelType === ChannelType.GuildForum
          ? ({
              name,
              message: action.message
                ? insertReplacements(action.message, { replacements })
                : { content: "No message" },
              applied_tags: action.appliedTags,
              auto_archive_duration: action.autoArchiveDuration,
              rate_limit_per_user: action.rateLimitPerUser,
            } satisfies RESTPostAPIGuildForumThreadsJSONBody)
          : ({
              name,
              auto_archive_duration: action.autoArchiveDuration,
              rate_limit_per_user: action.rateLimitPerUser,
              type: action.threadType,
              invitable: action.invitable,
            } satisfies RESTPostAPIChannelThreadsJSONBody),
      reason,
    })) as RESTPostAPIChannelThreadsResult;
    return thread;
  } catch (e) {
    throw httpFlowFailure(e, "Failed to create the thread.");
  }
};
