import { EmbedBuilder, bold } from "@discordjs/builders";
import dedent from "dedent-js";
import { APIWebhook, MessageFlags } from "discord-api-types/v10";
import { getDb, getchTriggerGuild } from "store";
import {
  FlowAction,
  FlowActionType,
  FlowActionWait,
} from "store/src/types/components.js";
import { TriggerEvent } from "store/src/types/triggers.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { EmojiManagerCache, emojiToString, getEmojis } from "../../emojis.js";
import { getWelcomerConfigurations } from "../../events/guildMemberAdd.js";
import { Env } from "../../types/env.js";
import { color } from "../../util/meta.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import { WelcomerTriggerEvent } from "./set.js";

export interface AutoWelcomerConfig {
  webhookId?: string;
  channelId?: string;
  backupId?: string;
  backupMessageIndex?: number | null;
  flags?: MessageFlags;
  deleteAfter?: number;
}

export const getWelcomerConfigFromActions = (
  actions: FlowAction[],
): AutoWelcomerConfig => {
  const current: AutoWelcomerConfig = {};

  let i = -1;
  for (const action of actions) {
    i += 1;
    switch (action.type) {
      case FlowActionType.SendWebhookMessage: {
        current.webhookId = action.webhookId;
        current.backupId = action.backupId;
        current.backupMessageIndex = action.backupMessageIndex;
        current.flags = action.flags;
        break;
      }
      case FlowActionType.SendMessage: {
        current.backupId = action.backupId;
        current.backupMessageIndex = action.backupMessageIndex;
        current.flags = action.flags;
        break;
      }
      case FlowActionType.SetVariable: {
        if (
          action.name === "channelId" &&
          !action.varType &&
          typeof action.value === "string"
        ) {
          current.channelId = action.value;
        }
        break;
      }
      case FlowActionType.DeleteMessage: {
        // This action isn't our `deleteAfter` because the message hasn't been sent yet
        if (!current.backupId) break;

        const waitAction = actions.find(
          (a, ai): a is FlowActionWait =>
            a.type === FlowActionType.Wait && ai < i,
        );
        if (waitAction) {
          current.deleteAfter = waitAction.seconds;
        }
        break;
      }
      default:
        break;
    }
  }

  return current;
};

export const getWelcomerConfigEmbed = (
  env: Env,
  config: AutoWelcomerConfig,
  rich?: {
    backup?: { name: string };
    webhook?: Pick<APIWebhook, "name" | "channel_id">;
    emojis?: EmojiManagerCache;
  },
) => {
  const emojis = rich?.emojis ?? new EmojiManagerCache([]);
  const trueEmoji = emojiToString(emojis.get("true", true));
  const falseEmoji = emojiToString(emojis.get("false", true));
  const nullEmoji = emojiToString(emojis.get("null", true));

  const backupUrl = config.backupId
    ? `${env.DISCOHOOK_ORIGIN}/?backup=${config.backupId}`
    : undefined;

  return new EmbedBuilder()
    .setColor(color)
    .setTitle("Welcomer")
    .addFields(
      {
        name: "Destination",
        value: config.webhookId
          ? rich?.webhook
            ? `${trueEmoji} ${
                rich.webhook.name ? bold(rich.webhook.name) : "Webhook"
              } in <#${rich.webhook.channel_id}>`
            : `${trueEmoji} Webhook`
          : config.channelId
            ? `${trueEmoji} <#${config.channelId}>`
            : `${falseEmoji} Not set`,
        inline: true,
      },
      {
        name: "Message data",
        value: config.backupId
          ? `${trueEmoji} ${
              rich?.backup
                ? `${rich.backup.name} ([edit](${backupUrl}))`
                : `[Edit](${backupUrl})`
            }`
          : `${falseEmoji} Not set`,
        inline: true,
      },
      {
        name: "Cleanup",
        value: config.deleteAfter
          ? `${trueEmoji} Messages are deleted after ${config.deleteAfter} seconds`
          : `${nullEmoji} Not set`,
        inline: true,
      },
      {
        name: "Troubleshooting",
        value: dedent`
          If your welcome messages aren't being sent, make sure <@${
            env.DISCORD_APPLICATION_ID
          }> has permission to ${
            config.webhookId
              ? `manage webhooks${
                  rich?.webhook ? ` in <#${rich.webhook.channel_id}>` : ""
                }`
              : `send messages and embed links${
                  config.channelId ? ` in <#${config.channelId}>` : ""
                }`
          } and that the backup still exists. ${
            config.deleteAfter && config.webhookId
              ? `If the message is not being deleted, make sure the bot has permission to manage messages${
                  rich?.webhook ? ` in <#${rich.webhook.channel_id}>` : ""
                }.`
              : ""
          }
        `,
        inline: false,
      },
    );
};

export const welcomerViewEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const event = ctx.getIntegerOption("event").value as WelcomerTriggerEvent;

  const guild = await getchTriggerGuild(
    ctx.rest,
    ctx.env.KV,
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

  if (triggers.length === 0) {
    return ctx.reply({
      content: "This server has no triggers with that event.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const config = getWelcomerConfigFromActions(
    triggers[0].flow.actions.map((a) => a.data),
  );

  let webhook: APIWebhook | undefined;
  if (config.webhookId) {
    try {
      // We don't need the token here but this function uses cache
      webhook = await getWebhook(config.webhookId, ctx.env);
    } catch {}
  }

  const emojis = await getEmojis(ctx.env);
  return ctx.reply({
    embeds: [
      getWelcomerConfigEmbed(ctx.env, config, { webhook, emojis })
        .setTitle(`Welcomer (${addRemove})`)
        .toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};
