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
  type RESTError,
  type RESTGetAPIChannelResult,
  type RESTPostAPIChannelThreadsJSONBody,
  type RESTPostAPIChannelThreadsResult,
  type RESTPostAPIGuildForumThreadsJSONBody,
  Routes,
} from "discord-api-types/v10";
import {
  type AnonymousVariable,
  type DBWithSchema,
  type Flow,
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
  type TriggerKVGuild,
  makeSnowflake,
  messageLogEntries,
  webhooks,
} from "store";
import { getWebhook } from "../commands/webhooks/webhookInfo.js";
import type { InteractionContext } from "../interactions.js";
import type { Env } from "../types/env.js";
import { isDiscordError } from "../util/error.js";
import { sleep } from "../util/sleep.js";
import { getReplacements, processQueryData } from "./backup.js";

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

export interface FlowResult {
  status: "success" | "failure";
  stopped?: boolean;
  message: string;
  discordError?: RESTError;
}

type SetVariables = Record<string, string | boolean>;

type SentMessages = Record<string, { route: RouteLike }>;

export const executeFlow = async (
  env: Env,
  flow: Pick<Flow, "actions">,
  rest: REST,
  db: DBWithSchema,
  liveVars: LiveVariables,
  setVars?: SetVariables,
  ctx?: InteractionContext<APIMessageComponentInteraction>,
  recursion = 0,
  lastReturnValue_?: any,
  sentMessages_?: SentMessages,
): Promise<FlowResult> => {
  if (recursion > 50) {
    return {
      status: "failure",
      message: `Too much recursion (${recursion} layers)`,
    };
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

  let subActionsCompleted = 0;
  try {
    for (const { data: action } of flow.actions) {
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
            const result = await executeFlow(
              env,
              {
                actions: (action.then ?? []).map((data) => ({
                  data,
                  type: data.type,
                  flowId: 0n,
                  id: 0n,
                })),
              },
              rest,
              db,
              liveVars,
              vars,
              ctx,
              recursion + 1,
              lastReturnValue,
              sentMessages,
            );
            if (result.status === "success") {
              subActionsCompleted += action.then?.length ?? 0;
              if (result.stopped) throw new FlowStop();
            }
          } else {
            const result = await executeFlow(
              env,
              {
                actions: (action.else ?? []).map((data) => ({
                  data,
                  type: data.type,
                  flowId: 0n,
                  id: 0n,
                })),
              },
              rest,
              db,
              liveVars,
              vars,
              ctx,
              recursion + 1,
              lastReturnValue,
              sentMessages,
            );
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
            await executeDeleteMessage(rest, msg.route);
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
          await executeAddRole(
            rest,
            action,
            liveVars.guild.id,
            vars as { userId: string },
          );
          break;
        case FlowActionType.RemoveRole:
          if (!liveVars.guild) {
            throw new FlowFailure(
              "No server was provided to the flow executor.",
            );
          }
          await executeRemoveRole(
            rest,
            action,
            liveVars.guild.id,
            vars as { userId: string },
          );
          break;
        case FlowActionType.ToggleRole:
          if (!liveVars.guild) {
            throw new FlowFailure(
              "No server was provided to the flow executor.",
            );
          }
          await executeToggleRole(
            rest,
            action,
            liveVars.guild.id,
            vars as { userId: string },
          );
          break;
        case FlowActionType.CreateThread:
          {
            const channelId =
              resolveSetVariable(action.channel)?.toString() ?? vars.channelId;
            lastReturnValue = await executeCreateThread(rest, action, {
              channelId,
            });
          }
          break;
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

const reason = "Action in a flow";

export const executeSendMessage = async (
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
    if (
      ctx &&
      (!setVars.channelId ||
        setVars.channelId === ctx.interaction.channel.id) &&
      !ctx.isExpired()
    ) {
      message = await ctx.followup.send({ ...body, flags: action.flags });
    } else {
      message = (await rest.post(Routes.channelMessages(setVars.channelId), {
        body: { ...body, flags: action.flags },
      })) as APIMessage;
    }
  } catch (e) {
    console.error(e);
    throw httpFlowFailure(e, "Failed to send the message.");
  }
  return message;
};

export const executeSendWebhookMessage = async (
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

    message = (await rest.post(Routes.webhook(webhook.id, webhook.token), {
      query,
      body,
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
      threadId: message.position !== undefined ? message.channel_id : undefined,
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

export const executeDeleteMessage = async (
  rest: REST,
  route: RouteLike,
): Promise<void> => {
  try {
    await rest.delete(route, { reason });
  } catch (e) {
    throw httpFlowFailure(e, "Failed to delete the message.");
  }
};

export const executeAddRole = async (
  rest: REST,
  action: FlowActionAddRole,
  guildId: string,
  setVars: { userId: string },
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

export const executeRemoveRole = async (
  rest: REST,
  action: FlowActionRemoveRole,
  guildId: string,
  setVars: { userId: string },
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

export const executeToggleRole = async (
  rest: REST,
  action: FlowActionToggleRole,
  guildId: string,
  setVars: { userId: string },
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
      );
    } else {
      await rest.put(
        Routes.guildMemberRole(guildId, setVars.userId, action.roleId),
      );
    }
  } catch (e) {
    throw httpFlowFailure(e, "Failed to toggle the role.");
  }
};

export const executeCreateThread = async (
  rest: REST,
  action: FlowActionCreateThread,
  setVars: { channelId: string },
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

  try {
    const thread = (await rest.post(Routes.threads(channelId, messageId), {
      body:
        channelType === ChannelType.GuildForum
          ? ({
              name: action.name,
              message: action.message ?? { content: "No message" },
              applied_tags: action.appliedTags,
              auto_archive_duration: action.autoArchiveDuration,
              rate_limit_per_user: action.rateLimitPerUser,
            } satisfies RESTPostAPIGuildForumThreadsJSONBody)
          : ({
              name: action.name,
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
