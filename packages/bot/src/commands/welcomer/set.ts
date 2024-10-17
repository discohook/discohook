import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import { APIWebhook } from "discord-api-types/v10";
import { eq, sql } from "drizzle-orm";
import { getDb, getchTriggerGuild, putGeneric, upsertDiscordUser } from "store";
import {
  backups,
  flowActions,
  flows,
  generateId,
  triggers as dTriggers,
} from "store/src/schema/schema.js";
import {
  FlowAction,
  FlowActionSetVariableType,
  FlowActionType,
} from "store/src/types/components.js";
import { TriggerEvent } from "store/src/types/triggers.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { AutoComponentCustomId } from "../../components.js";
import { getShareLink } from "../../durable/share-links.js";
import { getEmojis } from "../../emojis.js";
import { getErrorMessage } from "../../errors.js";
import { getWelcomerConfigurations } from "../../events/guildMemberAdd.js";
import { isDiscordError } from "../../util/error.js";
import { parseShareLink } from "../components/quick.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import {
  AutoWelcomerConfig,
  getWelcomerConfigComponents,
  getWelcomerConfigEmbed,
  getWelcomerConfigFromActions,
} from "./view.js";

export type WelcomerTriggerEvent =
  | TriggerEvent.MemberAdd
  | TriggerEvent.MemberRemove;

const buildSimpleWelcomer = (
  props: AutoWelcomerConfig & { backupId: string },
) => {
  const {
    webhookId,
    channelId,
    backupId,
    backupMessageIndex,
    flags,
    deleteAfter,
  } = props;

  const actions: FlowAction[] = [];
  if (webhookId) {
    actions.push({
      type: FlowActionType.SendWebhookMessage,
      webhookId,
      backupId,
      backupMessageIndex,
      flags,
    });
    if (deleteAfter) {
      actions.push({
        type: FlowActionType.SetVariable,
        varType: FlowActionSetVariableType.Adaptive,
        name: "channelId",
        value: "channel_id",
      });
    }
  } else if (channelId) {
    actions.push(
      {
        type: FlowActionType.SetVariable,
        name: "channelId",
        value: channelId,
      },
      {
        type: FlowActionType.SendMessage,
        backupId,
        backupMessageIndex,
        flags,
      },
    );
  }
  if (deleteAfter) {
    actions.push(
      {
        type: FlowActionType.SetVariable,
        varType: FlowActionSetVariableType.Adaptive,
        name: "messageId",
        value: "id",
      },
      { type: FlowActionType.Wait, seconds: deleteAfter },
      { type: FlowActionType.DeleteMessage },
    );
  }

  return actions;
};

export const welcomerSetupEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const event = ctx.getIntegerOption("event").value as WelcomerTriggerEvent;
  const channel = ctx.getChannelOption("channel") ?? undefined;
  const deleteAfter = ctx.getIntegerOption("delete-after").value;
  const shareLink = ctx.getStringOption("share-link").value || undefined;

  return [
    ctx.defer({ ephemeral: true }),
    async () => {
      let shareId: string | undefined;
      if (shareLink) {
        try {
          shareId = await parseShareLink(ctx.env, shareLink);
        } catch (e) {
          await ctx.followup.editOriginalMessage({
            content: String(e),
          });
          return;
        }
      }

      const webhookValue = ctx.getStringOption("webhook").value || undefined;
      let webhook: APIWebhook | undefined;
      if (webhookValue) {
        try {
          webhook = await getWebhook(webhookValue, ctx.env);
        } catch (e) {
          const def = { content: String(e) };
          await ctx.followup.editOriginalMessage(
            isDiscordError(e)
              ? getErrorMessage(ctx, e.rawError)?.data ?? def
              : def,
          );
          return;
        }
        if (!webhook.token) {
          await ctx.followup.editOriginalMessage({
            content:
              "I cannot access that webhook's token. Choose a different webhook or use a channel instead.",
          });
          return;
        }
      }

      const isModified =
        !!channel || !!webhook || deleteAfter !== -1 || !!shareId;
      const guild = await getchTriggerGuild(
        ctx.rest,
        ctx.env,
        ctx.interaction.guild_id,
      );

      const db = getDb(ctx.env.HYPERDRIVE);
      const addRemove = event === TriggerEvent.MemberAdd ? "add" : "remove";
      const triggers = await getWelcomerConfigurations(
        db,
        addRemove,
        ctx.rest,
        guild,
      );

      const emojis = await getEmojis(ctx.env);
      if (triggers.length > 1) {
        await ctx.followup.editOriginalMessage({
          content: `This server has ${triggers.length} triggers with this event. Please choose which one you would like to modify in the select menu, or [modify the trigger online](${ctx.env.DISCOHOOK_ORIGIN}/s/${ctx.interaction.guild_id}).`,
          components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
              new StringSelectMenuBuilder()
                .setCustomId(
                  "a_edit-trigger-select_" satisfies AutoComponentCustomId,
                )
                .setOptions(
                  triggers.slice(0, 25).map((trigger, i) =>
                    i === 24 && triggers.length > 25
                      ? new StringSelectMenuOptionBuilder()
                          .setLabel("Too many options")
                          .setValue("overflow")
                          .setDescription(
                            "Please visit the link for more options",
                          )
                      : new StringSelectMenuOptionBuilder()
                          .setLabel(`${i + 1}. ${trigger.flow.name}`)
                          .setValue(`${trigger.id}`)
                          .setEmoji(
                            emojis.getC(
                              event === TriggerEvent.MemberAdd
                                ? "User_Add"
                                : "User_Remove",
                              true,
                            ),
                          ),
                  ),
                ),
            ),
          ],
        });
        return;
      }

      let currentFlow: (typeof triggers)[number]["flow"];
      if (triggers.length === 0) {
        currentFlow = {
          id: BigInt(generateId()),
          name: `Welcomer (${addRemove})`,
          actions: [],
        };
      } else {
        currentFlow = triggers[0].flow;
        // Possible shenanigans
        if (currentFlow.id === 0n) {
          currentFlow.id = BigInt(generateId());
        }
      }

      const current = getWelcomerConfigFromActions(
        currentFlow.actions.map((a) => a.data),
      );

      if (deleteAfter === 0) {
        current.deleteAfter = undefined;
      } else if (deleteAfter && deleteAfter > 0) {
        current.deleteAfter = deleteAfter;
      }

      if (!current.backupId && !shareId) {
        await ctx.followup.editOriginalMessage({
          content:
            "Please provide message data with the **share-link** option.",
        });
        return;
      }

      if (webhook) {
        current.webhookId = webhook.id;
        current.channelId = undefined;
      } else if (channel) {
        current.channelId = channel.id;
        current.webhookId = undefined;
      }
      if (!current.webhookId && !current.channelId) {
        await ctx.followup.editOriginalMessage({
          content:
            "Please select a destination with either the **webhook** or **channel** option.",
        });
        return;
      }

      const user = await upsertDiscordUser(db, ctx.user);

      let backupName: string | undefined;
      if (shareId) {
        const { data } = await getShareLink(ctx.env, shareId);
        current.backupId = generateId();
        backupName = `Welcomer (${addRemove}) - ${guild.name}`.slice(0, 100);
        await db.insert(backups).values({
          id: BigInt(current.backupId),
          ownerId: user.id,
          name: backupName,
          dataVersion: "d2",
          data,
        });
      }

      if (isModified) {
        const actions = buildSimpleWelcomer({
          ...current,
          // biome-ignore lint/style/noNonNullAssertion: Checked above or re-assigned
          backupId: current.backupId!,
        });
        await db.transaction(async (tx) => {
          const flowId = currentFlow.id;
          if (triggers.length === 0) {
            await tx
              .insert(flows)
              .values({ id: flowId, name: currentFlow.name })
              .onConflictDoNothing();
            await tx.insert(dTriggers).values({
              platform: "discord",
              discordGuildId: BigInt(ctx.interaction.guild_id),
              flowId,
              event,
            });
          } else {
            await tx
              .update(dTriggers)
              .set({
                flowId,
                updatedAt: sql`NOW()`,
                updatedById: user.id,
              })
              .where(eq(dTriggers.id, triggers[0].id));
          }
          await tx.delete(flowActions).where(eq(flowActions.flowId, flowId));
          const newActions = await tx
            .insert(flowActions)
            .values(
              actions.map((action) => ({
                flowId,
                type: action.type,
                data: action,
              })),
            )
            .returning();

          triggers.splice(0, 1, {
            ...(triggers[0] ?? { id: flowId, disabled: false }),
            flow: { ...currentFlow, actions: newActions },
          });
          await putGeneric(
            ctx.env,
            `cache:triggers-${event}-${ctx.interaction.guild_id}`,
            triggers,
            { expirationTtl: 1200 },
          );
        });
      }

      await ctx.followup.editOriginalMessage({
        embeds: [
          getWelcomerConfigEmbed(ctx.env, current, {
            backup: backupName ? { name: backupName } : undefined,
            webhook,
            emojis,
          }).setTitle(currentFlow.name),
        ],
        components: [
          getWelcomerConfigComponents(
            ctx.env,
            current,
            event,
            ctx.interaction.guild_id,
          ),
        ],
      });
    },
  ];
};
