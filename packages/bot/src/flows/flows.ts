import { REST } from "@discordjs/rest";
import {
  APIGuildMember,
  APIMessage,
  APIMessageComponentInteraction,
  APIUser,
  ChannelType,
  RESTError,
  RESTGetAPIChannelResult,
  RESTPostAPIChannelThreadsJSONBody,
  RESTPostAPIChannelThreadsResult,
  RESTPostAPIGuildForumThreadsJSONBody,
  Routes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { DBWithSchema } from "store";
import {
  backups,
  makeSnowflake,
  messageLogEntries,
  webhooks,
} from "store/src/schema";
import {
  Flow,
  FlowActionAddRole,
  FlowActionCreateThread,
  FlowActionRemoveRole,
  FlowActionSendMessage,
  FlowActionSendWebhookMessage,
  FlowActionSetVariableType,
  FlowActionToggleRole,
  FlowActionType,
} from "store/src/types/components.js";
import { TriggerKVGuild } from "store/src/types/guild.js";
import { InteractionContext } from "../interactions.js";
import { isDiscordError } from "../util/error.js";
import { sleep } from "../util/sleep.js";
import { processQueryData } from "./backup.js";

export interface LiveVariables {
  member?: APIGuildMember;
  user?: APIUser;
  guild?: TriggerKVGuild;
}

export class FlowFailure extends Error {
  constructor(
    public message: string,
    public discordError?: RESTError,
  ) {
    super();
  }
}

export interface FlowResult {
  status: "success" | "failure";
  message: string;
  discordError?: RESTError;
}

export const executeFlow = async (
  flow: Flow,
  rest: REST,
  db: DBWithSchema,
  liveVars: LiveVariables,
  setVars?: Record<string, string | boolean>,
  ctx?: InteractionContext<APIMessageComponentInteraction>,
): Promise<FlowResult> => {
  const vars = setVars ?? {};
  let lastReturnValue: any = undefined;
  try {
    for (const action of flow.actions) {
      switch (action.type) {
        case FlowActionType.Wait:
          await sleep(action.seconds * 1000);
          break;
        case FlowActionType.SetVariable:
          if (action.varType === FlowActionSetVariableType.Adaptive) {
            if (!lastReturnValue) {
              throw new FlowFailure(
                `Adaptive variable \`${action.name}\` was attempted to be assigned with attribute \`${action.value}\`, but there was no previous return value.`,
              );
            }
            vars[action.name] = lastReturnValue[String(action.value)];
          } else {
            vars[action.name] = action.value;
          }
          break;
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
          break;
        case FlowActionType.SendWebhookMessage:
          lastReturnValue = await executeSendWebhookMessage(
            action,
            rest,
            db,
            vars,
            liveVars,
          );
          break;
        case FlowActionType.DeleteMessage:
          if (!vars.channelId) {
            throw new FlowFailure(
              "No `channelId` variable was set, so no message could be deleted.",
            );
          }
          if (!vars.messageId) {
            throw new FlowFailure(
              "No `messageId` variable was set, so no message could be deleted.",
            );
          }
          await executeDeleteMessage(
            rest,
            vars as { channelId: string; messageId: string },
          );
          break;
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
          lastReturnValue = await executeCreateThread(
            rest,
            action,
            vars as { channelId?: string },
          );
          break;
        default:
          break;
      }
    }
  } catch (e) {
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
  return {
    status: "success",
    message: `${flow.actions.length} actions completed successfully`,
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
    where: eq(backups.id, makeSnowflake(action.backupId)),
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
    const body = await processQueryData(
      backup.data,
      liveVars,
      setVars,
      action.backupMessageIndex,
    );
    if (ctx && action.response) {
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
  vars: {
    threadId?: string;
    threadName?: string;
  },
  liveVars: LiveVariables,
): Promise<APIMessage> => {
  const webhook = await db.query.webhooks.findFirst({
    where: and(
      eq(webhooks.platform, "discord"),
      eq(webhooks.id, action.webhookId),
    ),
    columns: {
      id: true,
      token: true,
      discordGuildId: true,
      channelId: true,
    },
  });
  if (!webhook || !webhook.token) {
    throw new FlowFailure(
      "No webhook was found with the stored ID or it did not have a token associated with it.",
    );
  }
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, makeSnowflake(action.backupId)),
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

  const query = new URLSearchParams({
    wait: "true",
  });
  if (vars.threadId) {
    query.set("thread_id", vars.threadId);
  }
  if (vars.threadName) {
    query.set("thread_name", vars.threadName);
  }
  let message: APIMessage;
  try {
    message = (await rest.post(Routes.webhook(webhook.id, webhook.token), {
      query,
      body: await processQueryData(
        backup.data,
        liveVars,
        vars,
        action.backupMessageIndex,
      ),
    })) as APIMessage;
  } catch (e) {
    console.error(e);
    throw httpFlowFailure(e, "Failed to send the message.");
  }
  try {
    const msg = backup.data.messages[action.backupMessageIndex ?? 0].data;
    await db.insert(messageLogEntries).values([
      {
        type: "send",
        webhookId: webhook.id,
        channelId: webhook.channelId,
        messageId: message.id,
        threadId: vars.threadId,
        discordGuildId: webhook.discordGuildId,
        hasContent: !!msg.content,
        embedCount: msg.embeds?.length,
        notifiedEveryoneHere: message.mention_everyone,
        notifiedUsers: message.mentions?.map((u) => u.id),
        notifiedRoles: message.mention_roles,
      },
    ]);
  } catch {}
  return message;
};

export const executeDeleteMessage = async (
  rest: REST,
  setVars: {
    channelId: string;
    messageId: string;
  },
): Promise<void> => {
  try {
    await rest.delete(
      Routes.channelMessage(setVars.channelId, setVars.messageId),
      { reason },
    );
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
  setVars: { channelId?: string },
  ctx?: InteractionContext,
) => {
  const channelId = action.channelId ?? setVars.channelId;
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
