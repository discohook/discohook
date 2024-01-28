import { REST } from "@discordjs/rest";
import {
  APIUser,
  APIWebhook,
  GatewayGuildMemberAddDispatchData,
  Routes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import {
  DBWithSchema,
  getDb,
  getchTriggerGuild,
  upsertDiscordUser,
  upsertGuild,
} from "store";
import {
  backups,
  makeSnowflake,
  triggers,
  webhooks,
  welcomer_goodbye,
  welcomer_hello,
} from "store/src/schema";
import {
  FlowActionSetVariableType,
  FlowActionType,
  TriggerEvent,
  TriggerKVGuild,
} from "store/src/types";
import { GatewayEventCallback } from "../events.js";
import { executeFlow } from "../flows/flows.js";

export const getWelcomerConfigurations = async (
  db: DBWithSchema,
  type: "add" | "remove",
  rest: REST,
  guild: TriggerKVGuild,
) => {
  let configs = await db.query.triggers.findMany({
    columns: {
      id: true,
      flow: true,
      ignoreBots: true,
      disabled: true,
    },
    where: and(
      eq(triggers.platform, "discord"),
      eq(triggers.discordGuildId, makeSnowflake(guild.id)),
      eq(
        triggers.event,
        type === "add" ? TriggerEvent.MemberAdd : TriggerEvent.MemberRemove,
      ),
    ),
  });
  if (configs.length === 0) {
    const oldTable = type === "add" ? welcomer_hello : welcomer_goodbye;
    const oldConfiguration = await db
      .select({
        id: oldTable.id,
        channelId: oldTable.channelId,
        deleteMessagesAfter: oldTable.deleteMessagesAfter,
        lastModifiedAt: oldTable.lastModifiedAt,
        lastModifiedById: oldTable.lastModifiedById,
        webhookId: oldTable.webhookId,
        webhookToken: oldTable.webhookToken,
        messageData: oldTable.messageData,
        overrideDisabled: oldTable.overrideDisabled,
        ignoreBots: oldTable.ignoreBots,
      })
      .from(oldTable)
      .where(eq(oldTable.guildId, BigInt(guild.id)));

    if (oldConfiguration.length !== 0) {
      let backupId: number | undefined = undefined;
      const dUserId = oldConfiguration[0].lastModifiedById
        ? String(oldConfiguration[0].lastModifiedById)
        : guild.owner_id;

      let userId = 0;

      if (
        oldConfiguration[0].messageData ||
        oldConfiguration[0].lastModifiedById
      ) {
        const user = (await rest.get(Routes.user(dUserId))) as APIUser;
        userId = (await upsertDiscordUser(db, user)).id;
      }

      if (oldConfiguration[0].messageData) {
        const backup = await db
          .insert(backups)
          .values({
            name: `Welcomer (${type})`,
            data: {
              version: "d2",
              messages: [
                {
                  data: JSON.parse(oldConfiguration[0].messageData),
                },
              ],
            },
            dataVersion: "d2",
            ownerId: userId,
          })
          .returning({ id: backups.id });
        backupId = backup[0].id;
      }
      let webhookInvalid = false;
      if (oldConfiguration[0].webhookId && oldConfiguration[0].webhookToken) {
        try {
          const webhook = (await rest.get(
            Routes.webhook(
              String(oldConfiguration[0].webhookId),
              String(oldConfiguration[0].webhookToken),
            ),
          )) as APIWebhook;
          await db
            .insert(webhooks)
            .values({
              platform: "discord",
              id: String(oldConfiguration[0].webhookId),
              token: String(oldConfiguration[0].webhookToken),
              name: webhook.name ?? "Unknown Welcomer Webhook",
              channelId: webhook.channel_id,
              discordGuildId: makeSnowflake(webhook.guild_id ?? guild.id),
              applicationId: webhook.application_id,
              avatar: webhook.avatar,
            })
            .onConflictDoUpdate({
              target: [webhooks.platform, webhooks.id],
              set: {
                name: webhook.name ?? undefined,
                channelId: webhook.channel_id,
                avatar: webhook.avatar,
              },
            });
        } catch {
          webhookInvalid = true;
        }
      }
      await upsertGuild(db, guild);
      configs = await db
        .insert(triggers)
        .values({
          platform: "discord",
          event:
            type === "add" ? TriggerEvent.MemberAdd : TriggerEvent.MemberRemove,
          discordGuildId: makeSnowflake(guild.id),
          lastModifiedById: userId || undefined,
          lastModifiedAt: oldConfiguration[0].lastModifiedAt
            ? new Date(oldConfiguration[0].lastModifiedAt)
            : undefined,
          // I want to turn this into a Check action but I'm not
          // quite sure yet how I want to format them.
          ignoreBots: oldConfiguration[0].ignoreBots ?? undefined,
          disabled: oldConfiguration[0].overrideDisabled ?? undefined,
          flow: backupId
            ? {
                name: `Welcomer (${type})`,
                actions: [
                  ...(oldConfiguration[0].webhookId && !webhookInvalid
                    ? [
                        {
                          type: FlowActionType.SendWebhookMessage,
                          webhookId: String(oldConfiguration[0].webhookId),
                          backupId,
                        },
                      ]
                    : [
                        {
                          type: FlowActionType.SetVariable,
                          name: "channelId",
                          value: String(oldConfiguration[0].channelId),
                        },
                        {
                          type: FlowActionType.SendMessage,
                          backupId,
                        },
                      ]),
                  ...(oldConfiguration[0].deleteMessagesAfter
                    ? [
                        {
                          type: FlowActionType.SetVariable,
                          varType: FlowActionSetVariableType.Adaptive,
                          name: "messageId",
                          value: "id",
                        },
                        {
                          type: FlowActionType.Wait,
                          seconds: oldConfiguration[0].deleteMessagesAfter,
                        },
                        {
                          type: FlowActionType.DeleteMessage,
                        },
                      ]
                    : []),
                ],
              }
            : undefined,
        })
        .onConflictDoNothing()
        .returning({
          flow: triggers.flow,
          ignoreBots: triggers.ignoreBots,
          disabled: triggers.disabled,
        });
      await db.delete(oldTable).where(eq(oldTable.id, oldConfiguration[0].id));
    }
  }
  return configs;
};

export const guildMemberAddCallback: GatewayEventCallback = async (
  env,
  payload: GatewayGuildMemberAddDispatchData,
) => {
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  const db = getDb(env.DATABASE_URL);
  const guild = await getchTriggerGuild(rest, env.KV, payload.guild_id);
  const triggers = await getWelcomerConfigurations(db, "add", rest, guild);
  const applicable = triggers.filter(
    (t) =>
      !!t.flow && !t.disabled && (payload.user?.bot ? !t.ignoreBots : true),
  );

  for (const trigger of applicable) {
    // biome-ignore lint/style/noNonNullAssertion: Filtered above
    await executeFlow(trigger.flow!, rest, db, {
      member: payload,
      user: payload.user,
      guild,
    });
  }
};
