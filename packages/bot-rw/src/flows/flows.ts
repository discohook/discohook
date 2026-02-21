import type { RouteLike } from "@discordjs/rest";
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
  Routes,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import {
  type AnonymousVariable,
  type DraftFlow,
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
  makeSnowflake,
  messageLogEntries,
  type TriggerKVGuild,
  webhooks,
} from "store";
import type { Client } from "../client.js";
import { getWebhook } from "../commands/webhooks/webhookInfo.js";
import type { InteractionContext } from "../interactions.js";
import { isDiscordError } from "../util/error.js";
import { isThreadMessage } from "../util/messages.js";
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
    public override message: string,
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

export const executeFlow = async (options: {
  client: Client;
  flow: Pick<DraftFlow, "actions">;
  liveVars: LiveVariables;
  setVars?: SetVariables;
  ctx?: InteractionContext<APIMessageComponentInteraction>;
  recursion?: number;
  lastReturnValue?: any;
  sentMessages?: SentMessages;
  deferred?: boolean;
}): Promise<FlowResult> => {
  const {
    client,
    flow,
    liveVars,
    setVars,
    ctx,
    recursion = 0,
    lastReturnValue: lastReturnValue_,
    sentMessages: sentMessages_,
    // deferred = false,
  } = options;
  if (recursion > 50) {
    return {
      status: "failure",
      message: `Too much recursion (${recursion} layers)`,
    };
  }

  // shouldn't be required in gateway paradigm
  // try {
  //   if (
  //     recursion === 0 &&
  //     deferred &&
  //     env.BOUNCER_ORIGIN &&
  //     env.BOUNCER_JWT_KEY
  //   ) {
  //     // console.log("Calculating if bounce is required");
  //     const processWait = (action: FlowAction): number => {
  //       switch (action.type) {
  //         case FlowActionType.Wait:
  //           return action.seconds;
  //         case FlowActionType.Check: {
  //           // only one branch can happen, but we don't know which yet,
  //           // so we take the maximum
  //           const thenWait = action.then
  //             .map(processWait)
  //             .reduce((a, b) => a + b, 0);
  //           const elseWait = action.else
  //             .map(processWait)
  //             .reduce((a, b) => a + b, 0);
  //           return Math.max(thenWait, elseWait);
  //         }
  //         default:
  //           return 0;
  //       }
  //     };

  //     let cumulativeWait = 0;
  //     for (const { data: action } of flow.actions) {
  //       cumulativeWait += processWait(action);
  //     }
  //     // console.log({ message: "Calculated possible wait", cumulativeWait });

  //     // May need to lower or raise this
  //     if (cumulativeWait >= 30) {
  //       // console.log("Bouncing to", env.BOUNCER_ORIGIN);
  //       await bounceFlow(env, {
  //         liveVars,
  //         setVars,
  //         recursion: recursion + 1,
  //         interaction: ctx?.interaction,
  //         flow,
  //       });
  //       return {
  //         status: "success",
  //         message: `Flow bounced to another process due to ≤${cumulativeWait}s of waiting time. Unfortunately Discohook is currently unable to give detailed feedback on this flow.`,
  //         paused: true,
  //         // TODO: some sort of job ID/a way to, at least, send a message in a channel to give feedback
  //       };
  //     }
  //   }
  // } catch (e) {
  //   console.error(e);
  //   // try to continue without bouncing
  // }

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
    for (const action of flow.actions) {
      switch (action.type) {
        case FlowActionType.Dud:
          break;
        case FlowActionType.Wait:
          await Bun.sleep(action.seconds * 1000);
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
              client,
              flow: { actions: action.then ?? [] },
              liveVars,
              setVars: vars,
              ctx,
              recursion: recursion + 1,
              lastReturnValue,
              sentMessages,
            });
            if (result.status === "success") {
              subActionsCompleted += action.then?.length ?? 0;
              if (result.stopped) throw new FlowStop();
            }
          } else {
            const result = await executeFlow({
              client,
              flow: { actions: action.else ?? [] },
              liveVars,
              setVars: vars,
              ctx,
              recursion: recursion + 1,
              lastReturnValue,
              sentMessages,
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
            client,
            action,
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
            client,
            action,
            vars,
            liveVars,
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
            await executeDeleteMessage(client, msg.route);
          } else {
            if (!vars.channelId) {
              throw new FlowFailure(
                "No `channelId` variable was set, so no message could be deleted.",
              );
            }
            await executeDeleteMessage(
              client,
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
            client,
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
            client,
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
            client,
            action,
            liveVars.guild.id,
            vars as { userId: string },
          );
          break;
        case FlowActionType.CreateThread:
          {
            const channelId =
              resolveSetVariable(action.channel)?.toString() ?? vars.channelId;
            lastReturnValue = await executeCreateThread(
              client,
              action,
              { channelId },
              liveVars,
            );
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
                  await client.api.channels.createMessage(channelId, body);
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

const reason = "Action in a flow";

export const executeSendMessage = async (
  client: Client,
  action: FlowActionSendMessage,
  setVars: {
    channelId: string;
  },
  liveVars: LiveVariables,
  ctx?: InteractionContext<APIMessageComponentInteraction>,
): Promise<APIMessage> => {
  const db = client.getDb();
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
      message = await client.api.channels.createMessage(setVars.channelId, {
        ...body,
        flags,
      });
    }
  } catch (e) {
    console.error(e);
    throw httpFlowFailure(e, "Failed to send the message.");
  }
  return message;
};

export const executeSendWebhookMessage = async (
  client: Client,
  action: FlowActionSendWebhookMessage,
  vars: SetVariables,
  liveVars: LiveVariables,
): Promise<{ webhook: { id: string; token: string }; message: APIMessage }> => {
  const db = client.getDb();
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
        client,
        action.webhookId,
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

    message = await client.api.webhooks.execute(webhook.id, webhook.token, {
      ...body,
      flags,
      wait: true,
      thread_id:
        typeof vars.threadId === "string" && vars.threadId
          ? vars.threadId
          : undefined,
    });
  } catch (e) {
    console.error(e);
    throw httpFlowFailure(e, "Failed to send the message.");
  }
  try {
    const msg = backup.data.messages[action.backupMessageIndex ?? 0]?.data;
    await db.insert(messageLogEntries).values({
      type: "send",
      webhookId: webhook.id,
      channelId: webhook.channelId,
      messageId: message.id,
      threadId: isThreadMessage(message) ? message.channel_id : undefined,
      discordGuildId: webhook.discordGuildId,
      hasContent: !!msg?.content,
      embedCount: msg?.embeds?.length ?? 0,
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
  client: Client,
  route: RouteLike,
): Promise<void> => {
  try {
    await client.rest.delete(route, { reason });
  } catch (e) {
    throw httpFlowFailure(e, "Failed to delete the message.");
  }
};

export const executeAddRole = async (
  client: Client,
  action: FlowActionAddRole,
  guildId: string,
  setVars: { userId: string },
) => {
  if (!setVars.userId) {
    throw new FlowFailure("No user ID was set.");
  }
  try {
    await client.api.guilds.addRoleToMember(
      guildId,
      setVars.userId,
      action.roleId,
      { reason },
    );
  } catch (e) {
    throw httpFlowFailure(e, "Failed to add the role.");
  }
};

export const executeRemoveRole = async (
  client: Client,
  action: FlowActionRemoveRole,
  guildId: string,
  setVars: { userId: string },
) => {
  if (!setVars.userId) {
    throw new FlowFailure("No user ID was set.");
  }
  try {
    await client.api.guilds.removeRoleFromMember(
      guildId,
      setVars.userId,
      action.roleId,
      { reason },
    );
  } catch (e) {
    throw httpFlowFailure(e, "Failed to remove the role.");
  }
};

export const executeToggleRole = async (
  client: Client,
  action: FlowActionToggleRole,
  guildId: string,
  setVars: { userId: string },
) => {
  if (!setVars.userId) {
    throw new FlowFailure("No user ID was set.");
  }
  try {
    const member = await client.api.guilds.getMember(guildId, setVars.userId);
    if (member.roles.includes(action.roleId)) {
      await client.api.guilds.removeRoleFromMember(
        guildId,
        setVars.userId,
        action.roleId,
        { reason },
      );
    } else {
      await client.api.guilds.addRoleToMember(
        guildId,
        setVars.userId,
        action.roleId,
        { reason },
      );
    }
  } catch (e) {
    throw httpFlowFailure(e, "Failed to toggle the role.");
  }
};

export const executeCreateThread = async (
  client: Client,
  action: FlowActionCreateThread,
  setVars: { channelId: string },
  liveVars: LiveVariables,
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
      ({ type: channelType } = await client.api.channels.get(channelId));
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
      ({ id: messageId } = await client.api.channels.createMessage(
        channelId,
        action.message,
      ));
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
    if (channelType === ChannelType.GuildForum) {
      const thread = await client.api.channels.createForumThread(
        channelId,
        {
          name,
          message: action.message
            ? insertReplacements(action.message, { replacements })
            : { content: "No message" },
          applied_tags: action.appliedTags,
          auto_archive_duration: action.autoArchiveDuration,
          rate_limit_per_user: action.rateLimitPerUser,
        },
        { reason },
      );
      return thread;
    }
    const thread = await client.api.channels.createThread(
      channelId,
      {
        name,
        auto_archive_duration: action.autoArchiveDuration,
        rate_limit_per_user: action.rateLimitPerUser,
        type: action.threadType,
        invitable: action.invitable,
      },
      messageId,
      { reason },
    );
    return thread;
  } catch (e) {
    throw httpFlowFailure(e, "Failed to create the thread.");
  }
};
