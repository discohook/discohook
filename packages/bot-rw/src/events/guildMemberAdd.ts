import { GatewayDispatchEvents } from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import {
  backups,
  ensureTriggerFlow,
  type FlowAction,
  type FlowActionCheck,
  FlowActionCheckFunctionType,
  type FlowActionDeleteMessage,
  flowActions,
  type FlowActionSendMessage,
  type FlowActionSendWebhookMessage,
  type FlowActionSetVariable,
  FlowActionSetVariableType,
  FlowActionType,
  type FlowActionWait,
  flows,
  makeSnowflake,
  TriggerEvent,
  type TriggerKVGuild,
  triggers,
  upsertDiscordUser,
  upsertGuild,
  webhooks,
  welcomer_goodbye,
  welcomer_hello,
} from "store";
import type { Client } from "../client.js";
import { executeFlow, type FlowResult } from "../flows/flows.js";
import { createHandler } from "./handler";

export const getWelcomerConfigurations = async (
  client: Client,
  type: "add" | "remove",
  guild: TriggerKVGuild,
) => {
  const db = client.getDb();

  let configs = await db.query.triggers.findMany({
    columns: {
      id: true,
      disabled: true,
      flow: true,
      flowId: true,
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
      let backupId: bigint | undefined;
      const dUserId = oldConfiguration[0].lastModifiedById
        ? String(oldConfiguration[0].lastModifiedById)
        : guild.owner_id;

      let userId = 0n;

      if (
        oldConfiguration[0].messageData ||
        oldConfiguration[0].lastModifiedById
      ) {
        const user = await client.api.users.get(dUserId);
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
          const webhook = await client.api.webhooks.get(
            String(oldConfiguration[0].webhookId),
            String(oldConfiguration[0].webhookToken),
          );
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

      const flow = (
        await db
          .insert(flows)
          .values({
            name: `Welcomer (${type})`,
          })
          .returning()
      )[0];
      const actions: FlowAction[] = backupId
        ? [
            ...(oldConfiguration[0].ignoreBots
              ? [
                  {
                    type: FlowActionType.Check,
                    function: {
                      type: FlowActionCheckFunctionType.Equals,
                      a: {
                        varType: FlowActionSetVariableType.Get,
                        value: "member.bot",
                      },
                      b: {
                        varType: FlowActionSetVariableType.Static,
                        value: true,
                      },
                    },
                    // biome-ignore lint/suspicious/noThenProperty: see note in quick.ts about this
                    then: [{ type: FlowActionType.Stop }],
                    else: [],
                  } satisfies FlowActionCheck,
                ]
              : []),
            ...(oldConfiguration[0].webhookId && !webhookInvalid
              ? [
                  {
                    type: FlowActionType.SendWebhookMessage,
                    webhookId: String(oldConfiguration[0].webhookId),
                    backupId: backupId.toString(),
                  } satisfies FlowActionSendWebhookMessage,
                  {
                    type: FlowActionType.SetVariable,
                    varType: FlowActionSetVariableType.Adaptive,
                    name: "channelId",
                    value: "channel_id",
                  } satisfies FlowActionSetVariable,
                ]
              : [
                  {
                    type: FlowActionType.SetVariable,
                    name: "channelId",
                    value: String(oldConfiguration[0].channelId),
                  } satisfies FlowActionSetVariable,
                  {
                    type: FlowActionType.SendMessage,
                    backupId: backupId.toString(),
                  } satisfies FlowActionSendMessage,
                ]),
            ...(oldConfiguration[0].deleteMessagesAfter
              ? [
                  {
                    type: FlowActionType.SetVariable,
                    varType: FlowActionSetVariableType.Adaptive,
                    name: "messageId",
                    value: "id",
                  } satisfies FlowActionSetVariable,
                  {
                    type: FlowActionType.Wait,
                    seconds: oldConfiguration[0].deleteMessagesAfter,
                  } satisfies FlowActionWait,
                  {
                    type: FlowActionType.DeleteMessage,
                  } satisfies FlowActionDeleteMessage,
                ]
              : []),
          ]
        : [];
      if (actions.length !== 0) {
        await db.insert(flowActions).values(
          actions.map((action) => ({
            flowId: flow.id,
            type: action.type,
            data: action,
          })),
        );
      }

      const protoConfigs = await db
        .insert(triggers)
        .values({
          platform: "discord",
          event:
            type === "add" ? TriggerEvent.MemberAdd : TriggerEvent.MemberRemove,
          discordGuildId: makeSnowflake(guild.id),
          updatedById: userId || undefined,
          updatedAt: oldConfiguration[0].lastModifiedAt
            ? new Date(oldConfiguration[0].lastModifiedAt)
            : undefined,
          disabled: oldConfiguration[0].overrideDisabled ?? undefined,
          flowId: flow.id,
        })
        .onConflictDoNothing()
        .returning({
          id: triggers.id,
          // flowId: triggers.flowId,
          disabled: triggers.disabled,
        });
      configs = [
        {
          ...protoConfigs[0],
          flow: {
            ...flow,
            actions: actions.map((data) => ({
              id: 0n, // this might need to be real in the future for diagnostics
              flowId: flow.id,
              type: data.type,
              data,
            })),
          },
        },
      ];
      await db.delete(oldTable).where(eq(oldTable.id, oldConfiguration[0].id));
    }
  } else {
    for (const trigger of configs) {
      await ensureTriggerFlow(trigger, db);
    }
  }
  return configs;
};

export type Trigger = Awaited<
  ReturnType<typeof getWelcomerConfigurations>
>[number];

export default createHandler(
  GatewayDispatchEvents.GuildMemberAdd,
  async ({ data, client }) => {
    // Don't like this. We really should store all triggers per guild id,
    // but I did this to fit with the way getWelcomerConfiguration works
    const key = `cache:triggers-${TriggerEvent.MemberAdd}-${data.guild_id}`;
    let triggers = await client.KV.get<Trigger[]>(key, "json");
    if (triggers && triggers.length === 0) {
      return;
    }

    const guild = await client.getchTriggerGuild(data.guild_id);
    const db = client.getDb();
    if (!triggers) {
      triggers = await getWelcomerConfigurations(client, "add", guild);
      await client.KV.put(key, JSON.stringify(triggers), {
        expirationTtl: 1200,
      });
    }

    const applicable = triggers.filter((t) => !!t.flow && !t.disabled);
    const results: FlowResult[] = [];
    for (const trigger of applicable) {
      results.push(
        await executeFlow({
          env,
          flow: trigger.flow,
          rest: client.rest,
          db,
          liveVars: { member: payload, user: payload.user, guild },
          deferred,
        }),
      );
    }
    return results;
  },
);
