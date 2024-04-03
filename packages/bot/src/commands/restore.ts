import {
  ActionRowBuilder,
  EmbedBuilder,
  SelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  messageLink,
  time,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIMessage,
  APIVersion,
  APIWebhook,
  MessageFlags,
  PermissionFlagsBits,
  Routes,
} from "discord-api-types/v10";
import { getDb, upsertDiscordUser } from "store";
import { shareLinks } from "store/src/schema/index.js";
import { QueryData } from "store/src/types/backups.js";
import { MessageAppCommandCallback } from "../commands.js";
import { AutoComponentCustomId, SelectMenuCallback } from "../components.js";
import { Env } from "../types/env.js";
import { parseAutoComponentId } from "../util/components.js";
import { boolEmoji, color } from "../util/meta.js";
import { randomString } from "../util/text.js";

export const messageToQueryData = (
  ...messages: Pick<
    APIMessage,
    "content" | "embeds" | "components" | "webhook_id" | "attachments"
  >[]
): QueryData => {
  return {
    version: "d2",
    messages: messages.map((msg) => ({
      data: {
        content: msg.content,
        embeds: msg.embeds,
        components: msg.components,
        webhook_id: msg.webhook_id,
        attachments: msg.attachments,
      },
    })),
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
  kv: KVNamespace,
  length: number,
  tries = 10,
): Promise<{ id: string; key: string }> => {
  for (const _ of Array(tries)) {
    const id = randomString(length);
    const key = `share-${id}`;
    if (!(await kv.get(key))) {
      return { id, key };
    }
  }
  return await generateUniqueShortenKey(kv, length + 1);
};

export const createShareLink = async (
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
  const ttl = options?.ttl ?? 604800000;
  const origin = options?.origin ?? env.DISCOHOOK_ORIGIN;
  const expires = new Date(new Date().getTime() + ttl);

  // biome-ignore lint/performance/noDelete: We don't want to store this property at all
  delete data.backup_id;
  const shortened = {
    data: JSON.stringify(data),
    origin,
    userId: userId?.toString(),
  };

  const kv = env.KV;
  const { id, key } = await generateUniqueShortenKey(kv, 8);
  await kv.put(key, JSON.stringify(shortened), {
    expirationTtl: ttl / 1000,
    // KV doesn't seem to provide a way to read `expirationTtl`
    metadata: { expiresAt: new Date(new Date().valueOf() + ttl).toISOString() },
  });
  if (userId) {
    const db = getDb(env.DATABASE_URL);
    await db.insert(shareLinks).values({
      userId,
      shareId: id,
      expiresAt: expires,
      origin: options?.origin,
    });
  }

  return {
    id,
    origin,
    url: `${origin}/?share=${id}`,
    expires,
  };
};

export const restoreMessageEntry: MessageAppCommandCallback = async (ctx) => {
  const user = await upsertDiscordUser(getDb(ctx.env.DATABASE_URL), ctx.user);
  const message = ctx.getMessage();

  const select = new StringSelectMenuBuilder()
    .setCustomId(
      `a_select-restore-options_${user.id}` satisfies AutoComponentCustomId,
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
    components: [
      new ActionRowBuilder<typeof select>().addComponents(select).toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const selectRestoreOptionsCallback: SelectMenuCallback = async (ctx) => {
  const { userId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "userId",
  );
  const message = ctx.interaction.message;
  const value = (
    ctx.interaction.data.values as ("none" | "edit" | "link")[]
  )[0];
  switch (value) {
    case "none": {
      const data = messageToQueryData(message);
      // url.searchParams.set("data", base64UrlEncode(JSON.stringify(data)))
      const share = await createShareLink(ctx.env, data, {
        userId: BigInt(userId),
      });
      return ctx.updateMessage({
        embeds: [getShareEmbed(share, true).toJSON()],
        components: [],
      });
    }
    case "edit": {
      if (!message.webhook_id) {
        return ctx.updateMessage({
          content: "This is not a webhook message.",
          components: [],
        });
      }
      const webhook = (await ctx.rest.get(
        Routes.webhook(message.webhook_id),
      )) as APIWebhook;
      if (!webhook.token) {
        return ctx.updateMessage({
          content: dedent`
            Webhook token (ID ${message.webhook_id}) was not available.
            It may be an incompatible type of webhook, or it may have been
            created by a different bot user.
          `,
          components: [],
        });
      }

      const data = messageToQueryData(message);
      data.messages[0].reference = ctx.interaction.guild_id
        ? messageLink(message.channel_id, message.id, ctx.interaction.guild_id)
        : messageLink(message.channel_id, message.id);
      data.targets = [
        {
          url: `https://discord.com/api/v${APIVersion}${Routes.webhook(
            webhook.id,
            webhook.token,
          )}`,
        },
      ];
      const share = await createShareLink(ctx.env, data, {
        userId: BigInt(userId),
      });
      return ctx.updateMessage({
        embeds: [getShareEmbed(share, false).toJSON()],
        components: [],
      });
    }
    case "link": {
      const url = new URL(ctx.env.DISCOHOOK_ORIGIN);
      break;
    }
    default:
      break;
  }
  return ctx.reply({
    content: "This shouldn't happen!",
    flags: MessageFlags.Ephemeral,
  });
};
