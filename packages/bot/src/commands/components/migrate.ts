import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import {
  APIActionRowComponent,
  APIMessage,
  APIMessageActionRowComponent,
  APIUser,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  RESTGetAPIGuildEmojisResult,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  Routes,
} from "discord-api-types/v10";
import { and, count, eq, notInArray } from "drizzle-orm";
import { t } from "i18next";
import {
  DBWithSchema,
  getDb,
  getchTriggerGuild,
  launchComponentDurableObject,
  upsertDiscordUser,
} from "store";
import {
  backups,
  buttons,
  discordMessageComponents,
  discordMessageComponentsToFlows,
  flowActions,
  flows,
  generateId,
  makeSnowflake,
} from "store/src/schema";
import {
  FlowActionSendMessage,
  FlowActionStop,
  FlowActionToggleRole,
  FlowActionType,
  QueryData,
  StorableButtonWithCustomId,
  StorableButtonWithUrl,
} from "store/src/types";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { AutoComponentCustomId, ButtonCallback } from "../../components.js";
import { Env } from "../../types/env.js";
import { hasCustomId, parseAutoComponentId } from "../../util/components.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import { resolveMessageLink } from "./entry.js";

export const migrateLegacyButtons = async (
  env: Env,
  rest: REST,
  db: DBWithSchema,
  guildId: string,
  message: APIMessage,
) => {
  const guild = await getchTriggerGuild(rest, env.KV, guildId);
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
  const inserted = await db.transaction(async (tx) => {
    const backupInsertValues: (typeof backups.$inferInsert)[] =
      oldMessageButtons
        .filter(
          (b) =>
            !!getOldCustomId(b) &&
            !!(
              b.customPublicMessageData ||
              b.customEphemeralMessageData ||
              b.customDmMessageData
            ),
        )
        .map((b) => {
          // biome-ignore lint/style/noNonNullAssertion: At least one must be non-null according to filter
          const dataStr = (b.customPublicMessageData ??
            b.customEphemeralMessageData ??
            b.customDmMessageData)!;
          return {
            name: `Button: ${b.id}`,
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
          (b) => b.name === `Button: ${b.id}`,
        )?.id;

        flowId = generateId();
        await tx.insert(flows).values({ id: BigInt(flowId) });

        const actions = [
          ...(button.roleId
            ? [
                {
                  type: FlowActionType.ToggleRole,
                  roleId: String(button.roleId),
                } satisfies FlowActionToggleRole,
                {
                  type: FlowActionType.Stop,
                  message: {
                    content: t("toggledRole", {
                      replace: { role: `<@&${button.roleId}>` },
                    }),
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
                    primary: ButtonStyle.Primary,
                    secondary: ButtonStyle.Secondary,
                    success: ButtonStyle.Success,
                    danger: ButtonStyle.Danger,
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
  });

  // TODO verify emojis for this
  const rows = message.components?.map((row) => ({
    ...row,
    components: row.components.map((component) => {
      if (component.type !== ComponentType.Button || !hasCustomId(component)) {
        return component;
      }

      const button = inserted.find(
        (b) => String(b.id) === oldIdMap[component.custom_id],
      );
      return {
        ...component,
        disabled: !button,
        // This shouldn't happen, but fall back anyway to avoid failure
        custom_id: button ? `p_${button.id}` : component.custom_id,
      };
    }),
  })) as APIActionRowComponent<APIMessageActionRowComponent>[];
  // await ctx.followup.editOriginalMessage({ components: rows });
  return { inserted, rows, guild, oldIdMap };
};

export const migrateComponentsChatEntry: ChatInputAppCommandCallback<true> =
  async (ctx) => {
    const message = await resolveMessageLink(
      ctx.rest,
      ctx.getStringOption("message").value,
    );
    if (typeof message === "string") {
      return ctx.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });
    }
    if (!message.webhook_id) {
      return ctx.reply({
        content: "This is not a webhook message.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const db = getDb(ctx.env.HYPERDRIVE.connectionString);
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
        flags: MessageFlags.Ephemeral,
      });
    }
    return ctx.reply({
      content: `This will replace ALL components on this message with ${result.count} migrated legacy buttons. Positions may be altered, but can be changed later. Are you sure you want to do this?`,
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
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
          )
          .toJSON(),
      ],
      flags: MessageFlags.Ephemeral,
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

  const db = getDb(ctx.env.DATABASE_URL);
  return [
    ctx.defer(),
    async () => {
      const message = (await ctx.rest.get(
        Routes.channelMessage(channelId, messageId),
      )) as APIMessage;

      // biome-ignore lint/style/noNonNullAssertion: Checked before this callback
      const webhook = await getWebhook(message.webhook_id!, ctx.env);
      if (!webhook.token) {
        await ctx.followup.editOriginalMessage({
          content: "The webhook's token was inaccessible.",
          components: [],
        });
        return;
      }

      const { inserted } = await migrateLegacyButtons(
        ctx.env,
        ctx.rest,
        db,
        guildId,
        message,
      );
      const emojis = (await ctx.rest.get(
        Routes.guildEmojis(guildId),
      )) as RESTGetAPIGuildEmojisResult;

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      let i = -1;
      for (const component of inserted) {
        i += 1;
        if (rows.length >= 5) break;
        if (component.data.type === ComponentType.Button) {
          if (!rows[i] || rows[i].components.length >= 5) {
            rows.push(new ActionRowBuilder());
          }
          const data = { ...component.data };
          if (
            "emoji" in data &&
            data.emoji?.id &&
            !emojis.find((e) => e.id === data.emoji?.id)
          ) {
            data.emoji = data.label ? undefined : { name: "🌫️" };
          }
          let customId: string | undefined;
          if (
            component.data.style !== ButtonStyle.Link &&
            component.data.style !== ButtonStyle.Premium
          ) {
            customId = `p_${component.id}`;
            // @ts-expect-error
            data.custom_id = customId;
            await launchComponentDurableObject(ctx.env, {
              messageId: message.id,
              componentId: component.id,
              customId,
            });
          }
          rows[i].addComponents(new ButtonBuilder(data));
        }
      }
      await ctx.rest.patch(
        Routes.webhookMessage(webhook.id, webhook.token, message.id),
        {
          body: {
            components: rows.map((r) => r.toJSON()),
          } satisfies RESTPatchAPIWebhookWithTokenMessageJSONBody,
        },
      );
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
      await ctx.followup.editOriginalMessage({
        content: "Migrated successfully - enjoy!",
        components: [],
      });
    },
  ];
};

export const migrateComponentsCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    content: "No changes have been made.",
    components: [],
  });
};
