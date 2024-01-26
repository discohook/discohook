import { REST } from "@discordjs/rest";
import {
  APIGuildMember,
  APIMessage,
  APIUser,
  Routes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { DBWithSchema } from "store";
import { backups, webhooks } from "store/src/schema";
import {
  Flow,
  FlowActionSendMessage,
  FlowActionSendWebhookMessage,
  FlowActionSetVariableType,
  FlowActionType,
} from "store/src/types/components.js";
import { TriggerKVGuild } from "store/src/types/guild.js";
import { sleep } from "../util/sleep.js";

export interface LiveVariables {
  member?: APIGuildMember;
  user?: APIUser;
  guild?: TriggerKVGuild;
}

export class FlowFailure extends Error {}

export interface FlowResult {
  status: "success" | "failure";
  message: string;
}

export const executeFlow = async (
  flow: Flow,
  rest: REST,
  db: DBWithSchema,
  liveVars: LiveVariables,
  setVars?: Record<string, string | boolean>,
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
        default:
          break;
      }
    }
  } catch (e) {
    if (e instanceof FlowFailure) {
      return {
        status: "failure",
        message: e.message,
      };
    }
    console.error(e);
  }
  return {
    status: "success",
    message: `${flow.actions.length} actions completed successfully`,
  };
};

export const executeSendMessage = async (
  action: FlowActionSendMessage,
  rest: REST,
  db: DBWithSchema,
  setVars: {
    channelId: string;
  },
  liveVars: LiveVariables,
): Promise<APIMessage> => {
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, action.backupId),
  });
  if (!backup) {
    throw new FlowFailure(
      "No backup was found with the stored ID, so there was no data to send the message.",
    );
  }
  try {
    const message = (await rest.post(
      Routes.channelMessages(setVars.channelId),
      {},
    )) as APIMessage;
    return message;
  } catch (e) {
    console.error(e);
  }
  throw new FlowFailure("Failed to send the message.");
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
    },
  });
  if (!webhook || !webhook.token) {
    throw new FlowFailure(
      "No webhook was found with the stored ID or it did not have a token associated with it.",
    );
  }
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, action.backupId),
  });
  if (!backup) {
    throw new FlowFailure(
      "No backup was found with the stored ID, so there was no data to send the message.",
    );
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
  try {
    const message = (await rest.post(
      Routes.webhook(webhook.id, webhook.token),
      { query },
    )) as APIMessage;
    return message;
  } catch (e) {
    console.error(e);
  }
  throw new FlowFailure("Failed to send the message.");
};

export const executeDeleteMessage = async (
  rest: REST,
  setVars: {
    channelId: string;
    messageId: string;
  },
): Promise<APIMessage> => {
  try {
    await rest.delete(
      Routes.channelMessage(setVars.channelId, setVars.messageId),
    );
  } catch {}
  throw new FlowFailure("Failed to delete the message.");
};
