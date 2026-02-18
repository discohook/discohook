import type { REST } from "@discordjs/rest";
import {
  type APIUser,
  type APIWebhook,
  type GatewayGuildMemberAddDispatchData,
  Routes,
} from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import {
  backups,
  type DBWithSchema,
  type DraftFlow,
  ensureTriggerFlow,
  FlowActionCheckFunctionType,
  FlowActionSetVariableType,
  FlowActionType,
  getchTriggerGuild,
  getDb,
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
import type { GatewayEventCallback } from "../events.js";
import { executeFlow, type FlowResult } from "../flows/flows.js";
import { createREST } from "../util/rest.js";

export const getWelcomerConfigurations = async (
  db: DBWithSchema,
  type: "add" | "remove",
  rest: REST,
  guild: TriggerKVGuild,
) => {
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

      const flow: DraftFlow = { actions: [] };
      if (backupId !== undefined) {
        if (oldConfiguration[0].ignoreBots) {
          flow.actions.push({
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
          });
        }
        if (oldConfiguration[0].webhookId && !webhookInvalid) {
          flow.actions.push(
            {
              type: FlowActionType.SendWebhookMessage,
              webhookId: String(oldConfiguration[0].webhookId),
              backupId: backupId.toString(),
            },
            {
              type: FlowActionType.SetVariable,
              varType: FlowActionSetVariableType.Adaptive,
              name: "channelId",
              value: "channel_id",
            },
          );
        } else {
          flow.actions.push(
            {
              type: FlowActionType.SetVariable,
              name: "channelId",
              value: String(oldConfiguration[0].channelId),
            },
            {
              type: FlowActionType.SendMessage,
              backupId: backupId.toString(),
            },
          );
        }
        if (oldConfiguration[0].deleteMessagesAfter) {
          flow.actions.push(
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
            { type: FlowActionType.DeleteMessage },
          );
        }
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
          flow,
        })
        .onConflictDoNothing()
        .returning({
          id: triggers.id,
          disabled: triggers.disabled,
        });
      configs = [{ ...protoConfigs[0], flow, flowId: null }];
      await db.delete(oldTable).where(eq(oldTable.id, oldConfiguration[0].id));
    }
  } else {
    for (const trigger of configs) {
      await ensureTriggerFlow(trigger, db);
    }
  }

  return configs.map(({ flowId: _, ...c }) => ({
    ...c,
    flow: c.flow ?? { actions: [] },
  }));
};

export type Trigger = Awaited<
  ReturnType<typeof getWelcomerConfigurations>
>[number];

export const guildMemberAddCallback: GatewayEventCallback = async (
  env,
  payload: GatewayGuildMemberAddDispatchData,
  deferred = false,
) => {
  const rest = createREST(env);

  // Don't like this. We really should store all triggers per guild id,
  // but I did this to fit with the way getWelcomerConfiguration works
  const key = `cache:triggers-${TriggerEvent.MemberAdd}-${payload.guild_id}`;
  let triggers = await env.KV.get<Trigger[]>(key, "json");
  if (triggers && triggers.length === 0) {
    return;
  }

  const guild = await getchTriggerGuild(rest, env, payload.guild_id);
  const db = getDb(env.HYPERDRIVE);
  if (!triggers) {
    triggers = await getWelcomerConfigurations(db, "add", rest, guild);
    await env.KV.put(key, JSON.stringify(triggers), { expirationTtl: 1200 });
  }

  const applicable = triggers.filter((t) => !!t.flow && !t.disabled);
  const results: FlowResult[] = [];
  for (const trigger of applicable) {
    results.push(
      await executeFlow({
        env,
        flow: trigger.flow,
        rest,
        db,
        liveVars: { member: payload, user: payload.user, guild },
        deferred,
      }),
    );
  }
  return results;
};
