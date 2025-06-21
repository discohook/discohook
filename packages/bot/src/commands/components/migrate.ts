import {
  ActionRowBuilder,
  ButtonBuilder,
  messageLink,
} from "@discordjs/builders";
import type { REST } from "@discordjs/rest";
import {
  type APIActionRowComponent,
  type APIComponentInMessageActionRow,
  type APIMessage,
  type APIUser,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type RESTGetAPIGuildEmojisResult,
  type RESTPatchAPIWebhookWithTokenMessageJSONBody,
  Routes,
} from "discord-api-types/v10";
import { and, count, eq, notInArray } from "drizzle-orm";
import { t } from "i18next";
import {
  type DBWithSchema,
  type FlowActionCheck,
  FlowActionCheckFunctionType,
  type FlowActionDud,
  type FlowActionSendMessage,
  FlowActionSetVariableType,
  type FlowActionStop,
  type FlowActionToggleRole,
  FlowActionType,
  type QueryData,
  type StorableButtonWithCustomId,
  type StorableButtonWithUrl,
  autoRollbackTx,
  backups,
  buttons,
  discordMessageComponents,
  discordMessageComponentsToFlows,
  flowActions,
  flows,
  generateId,
  getDb,
  getchTriggerGuild,
  launchComponentDurableObject,
  makeSnowflake,
  upsertDiscordUser,
} from "store";
import type { ChatInputAppCommandCallback } from "../../commands.js";
import type {
  AutoComponentCustomId,
  ButtonCallback,
} from "../../components.js";
import type { Env } from "../../types/env.js";
import {
  hasCustomId,
  isActionRow,
  parseAutoComponentId,
} from "../../util/components.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import { resolveMessageLink } from "./entry.js";

export const migrateLegacyButtons = async (
  env: Env,
  rest: REST,
  db: DBWithSchema,
  guildId: string,
  message: APIMessage,
) => {
  const guild = await getchTriggerGuild(rest, env, guildId);
  // Not sure if it's better for RL reasons to use guildMember instead?
  const owner = (await rest.get(Routes.user(guild.owner_id))) as APIUser;
  const ownerUser = await upsertDiscordUser(db, owner);

  const oldMessageButtons = await db.query.buttons.findMany({
    where: (buttons, { eq }) =>
      eq(buttons.messageId, makeSnowflake(message.id)),
    columns: {
      id: true,
      roleId: true,
      customId: true,
      customLabel: true,
      emoji: true,
      style: true,
      customDmMessageData: true,
      customEphemeralMessageData: true,
      customPublicMessageData: true,
      type: true,
      url: true,
    },
  });
  if (oldMessageButtons.length === 0) {
    throw Error(t("noMigratableComponents"));
  }

  const getOldCustomId = (button: {
    roleId: bigint | null;
    customId: string | null;
  }): string | undefined => {
    if (button.roleId) {
      return `button_role:${message.id}-${button.roleId}`;
    } else if (button.customId) {
      return button.customId;
    }
  };

  const oldIdMap: Record<string, string> = {};
  const inserted = await db.transaction(
    autoRollbackTx(async (tx) => {
      const oldIdToBackupName: Record<string, string> = {};
      const backupInsertValues: (typeof backups.$inferInsert)[] =
        oldMessageButtons
          .filter(
            (button) =>
              !!getOldCustomId(button) &&
              !!(
                button.customPublicMessageData ||
                button.customEphemeralMessageData ||
                button.customDmMessageData
              ),
          )
          .map((button) => {
            const name = `Button (${
              button.customPublicMessageData ? "public" : "hidden"
            } message) ${Math.floor(Math.random() * 1000000)}`;
            // biome-ignore lint/style/noNonNullAssertion: Filter
            oldIdToBackupName[getOldCustomId(button)!] = name;
            // biome-ignore lint/style/noNonNullAssertion: At least one must be non-null according to filter
            const dataStr = (button.customPublicMessageData ??
              button.customEphemeralMessageData ??
              button.customDmMessageData)!;
            return {
              name,
              ownerId: ownerUser.id,
              data: {
                messages: [{ data: JSON.parse(dataStr) }],
              } satisfies QueryData,
              dataVersion: "d2",
            };
          });
      const insertedBackups =
        backupInsertValues.length === 0
          ? []
          : await tx
              .insert(backups)
              .values(backupInsertValues)
              .returning({ id: backups.id, name: backups.name });

      const values: (typeof discordMessageComponents.$inferInsert)[] = [];
      for (const button of oldMessageButtons) {
        const old = getOldCustomId(button);
        const newId = generateId();
        const newCustomId = `p_${newId}`;
        if (old) {
          oldIdMap[old] = newId;
        }

        let flowId: string | undefined;
        if (!button.url) {
          const backupId = insertedBackups.find(
            old && oldIdToBackupName[old]
              ? (backup) => backup.name === oldIdToBackupName[old]
              : () => false,
          )?.id;

          flowId = generateId();
          await tx.insert(flows).values({ id: BigInt(flowId) });

          const actions = [
            ...(button.roleId
              ? [
                  {
                    type: FlowActionType.Check,
                    function: {
                      type: FlowActionCheckFunctionType.In,
                      array: {
                        varType: FlowActionSetVariableType.Get,
                        value: "member.role_ids",
                      },
                      element: {
                        varType: FlowActionSetVariableType.Static,
                        value: String(button.roleId),
                      },
                    },
                    then: [
                      {
                        type: FlowActionType.SetVariable,
                        name: "response",
                        value: `Removed the <@&${button.roleId}> role from you.`,
                      },
                    ],
                    else: [
                      {
                        type: FlowActionType.SetVariable,
                        name: "response",
                        value: `Gave you the <@&${button.roleId}> role.`,
                      },
                    ],
                  } satisfies FlowActionCheck,
                  {
                    type: FlowActionType.ToggleRole,
                    roleId: String(button.roleId),
                  } satisfies FlowActionToggleRole,
                  {
                    type: FlowActionType.Stop,
                    message: {
                      content: "{response}",
                      flags: MessageFlags.Ephemeral,
                    },
                  } satisfies FlowActionStop,
                ]
              : backupId
                ? [
                    {
                      type: FlowActionType.SendMessage,
                      backupId: backupId.toString(),
                      backupMessageIndex: 0,
                      response: true,
                      flags:
                        button.customEphemeralMessageData ||
                        button.customDmMessageData
                          ? MessageFlags.Ephemeral
                          : undefined,
                    } satisfies FlowActionSendMessage,
                  ]
                : button.type === "do_nothings"
                  ? [{ type: FlowActionType.Dud } satisfies FlowActionDud]
                  : []),
          ];
          if (actions.length !== 0) {
            await tx.insert(flowActions).values(
              actions.map((action) => ({
                // biome-ignore lint/style/noNonNullAssertion: non-null by this point
                flowId: BigInt(flowId!),
                type: action.type,
                data: action,
              })),
            );
          }
        }

        const data = {
          type: ComponentType.Button,
          label: button.customLabel ?? undefined,
          emoji: button.emoji
            ? button.emoji.startsWith("<")
              ? {
                  id: button.emoji.split(":")[2].replace(/\>$/, ""),
                  name: button.emoji.split(":")[1],
                  animated: button.emoji.split(":")[0] === "<a",
                }
              : {
                  name: button.emoji,
                }
            : undefined,
          ...(button.url
            ? {
                url: button.url,
                style: ButtonStyle.Link,
              }
            : {
                customId: newCustomId,
                // biome-ignore lint/style/noNonNullAssertion: non-null by this point
                flowId: flowId!,
                style:
                  (
                    {
                      // ??? what was I on?
                      primary: ButtonStyle.Primary,
                      blurple: ButtonStyle.Primary,
                      secondary: ButtonStyle.Secondary,
                      gray: ButtonStyle.Secondary,
                      link: ButtonStyle.Secondary,
                      success: ButtonStyle.Success,
                      green: ButtonStyle.Success,
                      danger: ButtonStyle.Danger,
                      red: ButtonStyle.Danger,
                    } as const
                  )[button.style ?? "primary"] ?? ButtonStyle.Primary,
              }),
        } satisfies StorableButtonWithCustomId | StorableButtonWithUrl;

        values.push({
          id: BigInt(newId),
          channelId: makeSnowflake(message.channel_id),
          guildId: makeSnowflake(guildId),
          messageId: makeSnowflake(message.id),
          draft: false,
          type: ComponentType.Button,
          data,
        });
      }

      if (values.length === 0) return [];
      const inserted = await tx
        .insert(discordMessageComponents)
        .values(values)
        .onConflictDoNothing()
        .returning({
          id: discordMessageComponents.id,
          data: discordMessageComponents.data,
        });
      const withFlowId = inserted.filter(
        (i): i is { id: bigint; data: StorableButtonWithCustomId } =>
          "flowId" in i.data && !!i.data.flowId,
      );
      if (withFlowId.length !== 0) {
        await tx
          .insert(discordMessageComponentsToFlows)
          .values(
            withFlowId.map((component) => ({
              discordMessageComponentId: component.id,
              flowId: BigInt(component.data.flowId),
            })),
          )
          .onConflictDoNothing();
      }

      return inserted;
    }),
  );

  const emojis = (await rest.get(
    Routes.guildEmojis(guildId),
  )) as RESTGetAPIGuildEmojisResult;

  // In the very specific context of this command, the message should always
  // be CV1, so we're just lazily type guarding for new components here.
  const rows = message.components?.map((row) => {
    if (!isActionRow(row)) return row;
    return {
      ...row,
      components: row.components.map((component) => {
        if (
          component.type !== ComponentType.Button ||
          component.style === ButtonStyle.Premium
        ) {
          return component;
        }

        // Remove likely-inaccessible emojis
        const subdata = { ...component };
        if (
          subdata.emoji?.id &&
          !emojis.find((e) => e.id === subdata.emoji?.id)
        ) {
          subdata.emoji = subdata.label ? undefined : { name: "🌫️" };
        }
        if (!hasCustomId(subdata)) return subdata;

        const button = inserted.find(
          (b) => String(b.id) === oldIdMap[subdata.custom_id],
        );
        return {
          ...subdata,
          disabled: !button,
          // This shouldn't happen, but fall back anyway to avoid failure
          custom_id: button ? `p_${button.id}` : subdata.custom_id,
        };
      }),
    };
  }) as APIActionRowComponent<APIComponentInMessageActionRow>[];
  // await ctx.followup.editOriginalMessage({ components: rows });
  return { inserted, rows, guild, emojis, oldIdMap };
};

export const migrateComponentsChatEntry: ChatInputAppCommandCallback<
  true
> = async (ctx) => {
  const message = await resolveMessageLink(
    ctx.rest,
    ctx.getStringOption("message").value,
    ctx.interaction.guild_id,
  );
  if (typeof message === "string") {
    return ctx.reply({
      content: message,
      ephemeral: true,
    });
  }
  if (!message.webhook_id) {
    return ctx.reply({
      content: "This is not a webhook message.",
      ephemeral: true,
    });
  }

  const db = getDb(ctx.env.HYPERDRIVE);
  const result = (
    await db
      .select({
        count: count(),
      })
      .from(buttons)
      .where(eq(buttons.messageId, makeSnowflake(message.id)))
  )[0];
  if (result.count === 0) {
    return ctx.reply({
      content: "There are no buttons on this message to migrate.",
      ephemeral: true,
    });
  }
  return ctx.reply({
    content: `This will replace ALL components on ${messageLink(
      message.channel_id,
      message.id,
      ctx.interaction.guild_id,
    )} with ${
      result.count
    } migrated legacy buttons. Positions may be altered, but can be changed later. Are you sure you want to do this?`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(
            `a_migrate-buttons-confirm_${message.channel_id}:${message.id}` satisfies AutoComponentCustomId,
          )
          .setLabel("Migrate")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(
            "a_migrate-buttons-cancel_" satisfies AutoComponentCustomId,
          )
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary),
      ),
    ],
    ephemeral: true,
  });
};

export const migrateComponentsConfirm: ButtonCallback = async (ctx) => {
  const { channelId, messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
  );
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error();

  const message = (await ctx.rest.get(
    Routes.channelMessage(channelId, messageId),
  )) as APIMessage;

  // biome-ignore lint/style/noNonNullAssertion: Checked before this callback
  const webhook = await getWebhook(message.webhook_id!, ctx.env);
  if (!webhook.token) {
    return ctx.updateMessage({
      content: "The webhook's token was inaccessible.",
      components: [],
    });
  }

  const db = getDb(ctx.env.HYPERDRIVE);
  return [
    ctx.updateMessage({ content: "Migrating...", components: [] }),
    async () => {
      console.log("[migrating] Start followup");
      const { inserted, emojis } = await migrateLegacyButtons(
        ctx.env,
        ctx.rest,
        db,
        guildId,
        message,
      );

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      for (const component of inserted) {
        if (rows.length >= 5) break;
        if (component.data.type === ComponentType.Button) {
          let row = rows[rows.length - 1];
          if (!row || row.components.length >= 5) {
            row = new ActionRowBuilder();
            rows.push(row);
          }
          const button = new ButtonBuilder().setStyle(component.data.style);
          const { data } = component;
          if ("emoji" in data && data.emoji) {
            if (
              data.emoji.id &&
              !emojis.find((e) => e.id === data.emoji?.id) &&
              !data.label
            ) {
              button.setEmoji({ name: "🌫️" });
            } else {
              button.setEmoji(data.emoji);
            }
          }
          if (data.style !== ButtonStyle.Premium && data.label) {
            button.setLabel(data.label);
          }
          if (
            component.data.style !== ButtonStyle.Link &&
            component.data.style !== ButtonStyle.Premium
          ) {
            const customId = `p_${component.id}`;
            button.setCustomId(customId);
            await launchComponentDurableObject(ctx.env, {
              messageId: message.id,
              componentId: component.id,
              customId,
            });
          }
          row.addComponents(button);
        }
      }
      console.log("[migrating] Compiled rows");
      await ctx.rest.patch(
        // biome-ignore lint/style/noNonNullAssertion: Stopped if null
        Routes.webhookMessage(webhook.id, webhook.token!, message.id),
        {
          query:
            message.position !== undefined
              ? new URLSearchParams({ thread_id: message.channel_id })
              : undefined,
          body: {
            components: rows.map((r) => r.toJSON()),
          } satisfies RESTPatchAPIWebhookWithTokenMessageJSONBody,
        },
      );
      console.log("[migrating] Updated message");

      // Clean up
      const insertedIds = inserted.map((i) => i.id);
      if (insertedIds.length !== 0) {
        await db
          .delete(discordMessageComponents)
          .where(
            and(
              eq(discordMessageComponents.messageId, BigInt(message.id)),
              notInArray(discordMessageComponents.id, insertedIds),
            ),
          );
      }
      console.log("[migrating] Cleaned up residue");

      await ctx.followup.editOriginalMessage({
        content: "Migrated successfully - enjoy!",
      });
      console.log("[migrating] End followup");
    },
  ];
};

export const migrateComponentsCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    content: "No changes have been made.",
    components: [],
  });
};
