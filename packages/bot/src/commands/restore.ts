import {
  ActionRowBuilder,
  EmbedBuilder,
  messageLink,
  SelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  time,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  AllowedMentionsTypes,
  type APIAllowedMentions,
  type APIGuildChannel,
  type APIMessage,
  type APIMessageTopLevelComponent,
  type APIWebhook,
  ChannelType,
  ComponentType,
  type GuildChannelType,
  MessageFlags,
  MessageReferenceType,
  PermissionFlagsBits,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { MessageFlagsBitField, PermissionFlags } from "discord-bitflag";
import { getDb, type QueryData, shareLinks, upsertDiscordUser } from "store";
import type {
  ChatInputAppCommandCallback,
  MessageAppCommandCallback,
} from "../commands.js";
import type {
  AutoComponentCustomId,
  SelectMenuCallback,
} from "../components.js";
import { getShareLinkExists, putShareLink } from "../durable/share-links.js";
import type { Env } from "../types/env.js";
import { isComponentsV2, parseAutoComponentId } from "../util/components.js";
import { isDiscordError } from "../util/error.js";
import { isThread } from "../util/guards.js";
import { boolEmoji, color } from "../util/meta.js";
import { base64UrlEncode, randomString } from "../util/text.js";
import { getUserTag } from "../util/user.js";
import { resolveMessageLink } from "./components/entry.js";
import { getWebhook } from "./webhooks/webhookInfo.js";

// essentially flattens all content components
const getAllComponentContent = (
  components: APIMessageTopLevelComponent[],
): string[] => {
  const content: string[] = [];
  for (const component of components) {
    switch (component.type) {
      case ComponentType.Container:
      case ComponentType.Section:
        content.push(...getAllComponentContent(component.components));
        break;
      case ComponentType.TextDisplay:
        content.push(component.content);
        break;
      default:
        break;
    }
  }
  return content;
};

const allowedMentionsIsBlank = (am: APIAllowedMentions) =>
  !Object.entries(am)
    .map(([, val]) => !val || val.length === 0)
    .includes(false);

export const inferAllowedMentions = (
  message: Pick<
    APIMessage,
    | "author"
    | "content"
    | "components"
    | "flags"
    | "mentions"
    | "mention_everyone"
    | "mention_roles"
  >,
) => {
  if (!message.author.bot) {
    // only bots can specify allowed mentions
    return;
  }
  const allContent = isComponentsV2(message)
    ? getAllComponentContent(message.components ?? []).join("\n")
    : message.content;

  // our strategy here ignores code blocks
  const mentionEveryone =
    allContent.includes("@everyone") || allContent.includes("@here");
  const mentionedUserIds = [...allContent.matchAll(/<@!?(\d+)>/g)]
    .map((mention) => mention[1])
    .filter((id, i, a) => a.indexOf(id) === i);
  const mentionedRoleIds = [...allContent.matchAll(/<@&(\d+)>/g)]
    .map((mention) => mention[1])
    .filter((id, i, a) => a.indexOf(id) === i);

  if (
    mentionedUserIds.length === message.mentions.length &&
    mentionedRoleIds.length === message.mention_roles.length &&
    mentionEveryone === message.mention_everyone
  ) {
    // everything is identical (barring code blocks), so
    // allowed_mentions probably was not used
    return;
  }

  const data: APIAllowedMentions = {
    parse: [],
    users: [],
    roles: [],
  };
  if (mentionedUserIds.length === message.mentions.length) {
    data.parse?.push(AllowedMentionsTypes.User);
  } else {
    data.users = message.mentions.map((u) => u.id);
  }
  if (mentionedRoleIds.length === message.mention_roles.length) {
    data.parse?.push(AllowedMentionsTypes.Role);
  } else {
    data.roles = message.mention_roles;
  }
  if (message.mention_everyone && allowedMentionsIsBlank(data)) {
    return;
  } else if (message.mention_everyone) {
    data.parse?.push(AllowedMentionsTypes.Everyone);
  }

  if (allowedMentionsIsBlank(data)) return;
  return data;
};

export const messageToQueryData = (
  ...messages: Pick<
    APIMessage,
    | "author"
    | "content"
    | "embeds"
    | "components"
    | "webhook_id"
    | "attachments"
    | "flags"
    // restore from fwd
    | "message_reference"
    | "message_snapshots"
    // recreate allowed mentions
    | "mentions"
    | "mention_everyone"
    | "mention_roles"
  >[]
): QueryData => {
  return {
    version: "d2",
    messages: messages.map((msg) => {
      // Messages that forward other messages have no content outside of the
      // snapshot, so we can reasonably assume that the user wants to restore
      // the forwarded message.
      const isForward =
        msg.message_reference?.type === MessageReferenceType.Forward &&
        !!msg.message_snapshots?.length;
      const innerMsg = isForward
        ? (msg.message_snapshots?.[0]?.message ?? msg)
        : msg;

      return {
        data: {
          content: innerMsg.content || undefined,
          embeds: !innerMsg.embeds?.length ? undefined : innerMsg.embeds,
          components: innerMsg.components,
          webhook_id: isForward ? undefined : msg.webhook_id,
          attachments: innerMsg.attachments,
          allowed_mentions: isForward ? undefined : inferAllowedMentions(msg),
          flags:
            Number(
              new MessageFlagsBitField(innerMsg.flags ?? 0).mask(
                MessageFlags.IsComponentsV2,
                MessageFlags.SuppressEmbeds,
                MessageFlags.SuppressNotifications,
              ),
            ) || undefined,
        },
      };
    }),
  };
};

// export const messageToLinkQueryData = (embeds: APIEmbed[]): LinkQueryData => {

//   return {
//     version: 1
//     embed: {
//       data: {
//         author: embed.author,
//         color: embed.color,
//         description: embed.description,
//         images:
//       },
//       redirect_url: embed.url
//     },
//   };
// };

export const getShareEmbed = (
  data: Awaited<ReturnType<typeof createShareLink>>,
  safe?: boolean,
) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle("Restored message")
    .setDescription(data.url)
    .addFields({
      name: "Expires",
      value: `${time(data.expires, "d")} (${time(data.expires, "R")})`,
      inline: true,
    });
  if (safe !== undefined) {
    embed.addFields({
      name: "Safe",
      value: `${boolEmoji(safe)} ${
        safe
          ? "This link is safe to share - it does not include a webhook URL."
          : "This link **may not be** safe to share - it includes the webhook's URL."
      }`,
      inline: true,
    });
  }
  return embed;
};

export const generateUniqueShortenKey = async (
  env: Env,
  length: number,
  tries = 10,
): Promise<string> => {
  for (const _ of Array(tries)) {
    const shareId = randomString(length);
    const exists = await getShareLinkExists(env, shareId);
    if (!exists) {
      return shareId;
    }
  }
  return await generateUniqueShortenKey(env, length + 1);
};

export const createLongDiscohookUrl = (origin: string, data: QueryData) =>
  `${origin}/?${new URLSearchParams({
    data: base64UrlEncode(JSON.stringify(data)),
  })}`;

const createShareLink = async (
  env: Env,
  data: QueryData,
  options?: {
    /** Expiration from now in milliseconds */
    ttl?: number;
    userId?: bigint;
    origin?: string;
  },
) => {
  const { userId } = options ?? {};
  const origin = options?.origin ?? env.DISCOHOOK_ORIGIN;
  const ttl = options?.ttl ?? 604800000;
  const expires = new Date(new Date().getTime() + ttl);

  delete data.backup_id;
  const shareId = await generateUniqueShortenKey(env, 8);
  await putShareLink(env, shareId, data, expires, options?.origin);
  if (userId) {
    const db = getDb(env.HYPERDRIVE);
    await db.insert(shareLinks).values({
      userId,
      shareId,
      expiresAt: expires,
      origin: options?.origin,
    });
  }

  return {
    id: shareId,
    origin,
    url: `${origin}/?share=${shareId}`,
    expires,
  };
};

/**
 * Returns whether a message could be feasibly edited using webhook credentials
 * that the bot can obtain. This does not determine whether a message absolutely
 * _can_ be edited, because it doesn't take into account whether the webhook is
 * deleted.
 */
export const isMessageWebhookEditable = (
  env: Env,
  message: Pick<
    APIMessage,
    "webhook_id" | "application_id" | "interaction_metadata" | "flags"
  >,
) => {
  const flags = new MessageFlagsBitField(message.flags ?? 0);
  if (
    message.interaction_metadata ||
    // incoming webhooks have no credentials
    flags.has(MessageFlags.IsCrosspost)
  ) {
    return false;
  }
  if (
    message.webhook_id &&
    (!message.application_id ||
      Object.keys(env.APPLICATIONS).includes(message.application_id))
  ) {
    return true;
  }
  return false;
};

export const restoreMessageEntry: MessageAppCommandCallback = async (ctx) => {
  const user = await upsertDiscordUser(getDb(ctx.env.HYPERDRIVE), ctx.user);
  const message = ctx.getMessage();

  if (!isMessageWebhookEditable(ctx.env, message)) {
    const data = messageToQueryData(message);
    const share = await createShareLink(ctx.env, data, { userId: user.id });
    return ctx.reply({
      embeds: [getShareEmbed(share, true)],
      components: [],
      ephemeral: true,
    });
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(
      `a_select-restore-options_${user.id}:${message.id}:${
        message.webhook_id ?? ""
      }` satisfies AutoComponentCustomId,
    )
    .setMaxValues(1)
    .addOptions(
      new SelectMenuOptionBuilder()
        .setLabel("Don't include edit options")
        .setDescription("The share link won't show the message's webhook URL")
        .setValue("none")
        .setEmoji({ name: "💬" }),
    );

  if (
    message.webhook_id &&
    ctx.userPermissons.has(PermissionFlagsBits.ManageWebhooks)
  ) {
    select.addOptions(
      new SelectMenuOptionBuilder()
        .setLabel("Include edit options")
        .setDescription("The share link will show the message's webhook URL")
        .setValue("edit")
        .setEmoji({ name: "🔗" }),
    );
  }

  // if (message.embeds && message.embeds.length !== 0) {
  //   select.addOptions(
  //     new SelectMenuOptionBuilder()
  //       .setLabel("[Deluxe] Restore as a link embed")
  //       .setDescription("You will be taken to the link embed editor")
  //       .setValue("link")
  //       .setEmoji({ name: "✨" }),
  //   );
  // }

  return ctx.reply({
    components: [new ActionRowBuilder<typeof select>().addComponents(select)],
    ephemeral: true,
  });
};

export const selectRestoreOptionsCallback: SelectMenuCallback = async (ctx) => {
  const { userId, messageId, webhookId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "userId",
    "messageId",
    "webhookId",
  );

  let threadId = [
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.AnnouncementThread,
  ].includes(ctx.interaction.channel.type)
    ? ctx.interaction.channel.id
    : undefined;

  let message: APIMessage | undefined;
  let webhook: APIWebhook | null | undefined;
  let webhookErrorMsg: string | undefined;
  if (webhookId) {
    try {
      webhook = await getWebhook(webhookId, ctx.env);
    } catch (e) {
      if (isDiscordError(e)) webhookErrorMsg = e.rawError.message;
      webhook = null;
    }
    if (webhook?.token) {
      message = (await ctx.rest.get(
        Routes.webhookMessage(webhook.id, webhook.token, messageId),
        {
          query: threadId
            ? new URLSearchParams({ thread_id: threadId })
            : undefined,
        },
      )) as APIMessage;
    }
  }
  if (!message) {
    message = (await ctx.rest.get(
      Routes.channelMessage(ctx.interaction.channel.id, messageId),
    )) as APIMessage;
  }

  const value = (
    ctx.interaction.data.values as ("none" | "edit" | "link")[]
  )[0];

  if (
    value === "edit" &&
    !ctx.userPermissons.has(PermissionFlags.ManageWebhooks)
  ) {
    return ctx.reply({
      content:
        "You must have the manage webhooks permission to restore a message in edit mode.",
      ephemeral: true,
    });
  }

  switch (value) {
    case "none": {
      const data = messageToQueryData(message);
      // url.searchParams.set("data", base64UrlEncode(JSON.stringify(data)))
      const share = await createShareLink(ctx.env, data, {
        userId: BigInt(userId),
      });
      return ctx.updateMessage({
        embeds: [getShareEmbed(share, true)],
        components: [],
      });
    }
    case "edit": {
      if (webhook === null) {
        return ctx.updateMessage({
          content: `It looks like this webhook was deleted (ID ${webhookId}), so the message cannot be edited${
            webhookErrorMsg ? ` (${webhookErrorMsg})` : ""
          }.`,
          components: [],
        });
      }
      if (!webhook) {
        return ctx.updateMessage({
          content: "This is not a webhook message.",
          components: [],
        });
      }
      if (!webhook.token) {
        return ctx.updateMessage({
          content: [
            `Webhook token (ID ${webhookId}) was not available. `,
            "It may be an incompatible type of webhook, or it may have been ",
            "created by a different bot user.",
          ].join(""),
          components: [],
        });
      }

      let channel: APIGuildChannel<GuildChannelType> | undefined;
      if (message.channel_id !== webhook.channel_id) {
        if (message.channel_id !== ctx.interaction.channel.id) {
          try {
            channel = (await ctx.rest.get(
              Routes.channel(message.channel_id),
            )) as APIGuildChannel<GuildChannelType>;
          } catch {}
        } else {
          channel = ctx.interaction
            .channel as APIGuildChannel<GuildChannelType>;
        }

        if (channel && isThread(channel)) {
          threadId = channel.id;
        } else if (channel) {
          // The message channel is not a thread, yet it differs from the
          // webhook channel. In this instance, we attempt to move the webhook
          // so that the user can edit the message. I'm afraid that this might
          // be confusing for users who use the same webhook across multiple
          // channels a lot, but if they only use the bot to restore, everything
          // should stay in sync.
          try {
            await ctx.rest.patch(Routes.webhook(webhook.id), {
              body: { channel_id: channel.id },
              reason: `User ${getUserTag(ctx.user)} (${
                ctx.user.id
              }) restored ${messageId} to edit it, but the webhook had to be moved.`.slice(
                0,
                512,
              ),
            });
          } catch {}
        }
      }

      const data = messageToQueryData(message);
      data.messages[0].thread_id = threadId;
      data.messages[0].reference = ctx.interaction.guild_id
        ? messageLink(message.channel_id, message.id, ctx.interaction.guild_id)
        : messageLink(message.channel_id, message.id);

      data.targets = [
        {
          url: `${RouteBases.api}${Routes.webhook(webhook.id, webhook.token)}`,
        },
      ];
      const share = await createShareLink(ctx.env, data, {
        userId: BigInt(userId),
      });
      return ctx.updateMessage({
        embeds: [getShareEmbed(share, false)],
        components: [],
      });
    }
    case "link": {
      // const url = new URL(ctx.env.DISCOHOOK_ORIGIN);
      break;
    }
    default:
      break;
  }
  return ctx.reply({
    content: "This shouldn't happen!",
    ephemeral: true,
  });
};

export const restoreMessageChatInputCallback: ChatInputAppCommandCallback<
  true
> = async (ctx) => {
  const message = await resolveMessageLink(
    ctx.rest,
    ctx.getStringOption("message").value,
    ctx.interaction.guild_id,
  );
  if (typeof message === "string") {
    return ctx.reply({ content: message, flags: MessageFlags.Ephemeral });
  }
  const mode = (ctx.getStringOption("mode").value || "none") as
    | "none"
    | "edit"
    | "link";

  const user = await upsertDiscordUser(getDb(ctx.env.HYPERDRIVE), ctx.user);
  // if (!userIsPremium(user) && mode === "link") {}
  if (
    mode === "edit" &&
    !ctx.userPermissons.has(PermissionFlags.ManageWebhooks)
  ) {
    return ctx.reply({
      content:
        "You must have the manage webhooks permission to restore a message in edit mode.",
      ephemeral: true,
    });
  }

  const data = messageToQueryData(message);

  if (!message.webhook_id || message.interaction_metadata) {
    const share = await createShareLink(ctx.env, data, { userId: user.id });
    return ctx.reply({
      embeds: [getShareEmbed(share, true)],
      ephemeral: true,
    });
  }

  switch (mode) {
    case "none": {
      const data = messageToQueryData(message);
      // url.searchParams.set("data", base64UrlEncode(JSON.stringify(data)))
      const share = await createShareLink(ctx.env, data, {
        userId: BigInt(user.id),
      });
      return ctx.reply({
        embeds: [getShareEmbed(share, true)],
        ephemeral: true,
      });
    }
    case "edit": {
      if (!message.webhook_id) {
        return ctx.reply({
          content: "This is not a webhook message.",
          ephemeral: true,
        });
      }

      const webhook = await getWebhook(
        message.webhook_id,
        ctx.env,
        message.application_id,
      );
      if (!webhook.token) {
        return ctx.reply({
          content: dedent`
            Webhook token (ID ${message.webhook_id}) was not available.
            It may be an incompatible type of webhook, or it may have been
            created by a different bot user.
          `,
          ephemeral: true,
        });
      }

      let channel: APIGuildChannel<GuildChannelType> | undefined;
      let threadId: string | undefined;
      if (message.channel_id !== webhook.channel_id) {
        if (message.channel_id !== ctx.interaction.channel.id) {
          try {
            channel = (await ctx.rest.get(
              Routes.channel(message.channel_id),
            )) as APIGuildChannel<GuildChannelType>;
          } catch {}
        } else {
          channel = ctx.interaction
            .channel as APIGuildChannel<GuildChannelType>;
        }

        if (channel && isThread(channel)) {
          threadId = channel.id;
        } else if (channel) {
          // See comment in selectRestoreOptionsCallback
          try {
            await ctx.rest.patch(Routes.webhook(webhook.id), {
              body: { channel_id: channel.id },
              reason: `User ${getUserTag(ctx.user)} (${ctx.user.id}) restored ${
                message.id
              } to edit it, but the webhook had to be moved.`.slice(0, 512),
            });
          } catch {}
        }
      }

      data.messages[0].thread_id = threadId;
      data.messages[0].reference = ctx.interaction.guild_id
        ? messageLink(message.channel_id, message.id, ctx.interaction.guild_id)
        : messageLink(message.channel_id, message.id);
      data.targets = [
        {
          url: `${RouteBases.api}${Routes.webhook(webhook.id, webhook.token)}`,
        },
      ];
      const share = await createShareLink(ctx.env, data, {
        userId: user.id,
      });
      return ctx.reply({
        embeds: [getShareEmbed(share, false)],
        ephemeral: true,
      });
    }
    case "link": {
      // const url = new URL(ctx.env.DISCOHOOK_ORIGIN);
      break;
    }
    default:
      break;
  }

  return ctx.reply({
    content: "This shouldn't happen",
    ephemeral: true,
  });
};
