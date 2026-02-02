import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  inlineCode,
  spoiler,
  time,
  TimestampStyles,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import dedent from "dedent-js";
import {
  type APIMessageComponentButtonInteraction,
  type APIWebhook,
  ButtonStyle,
  ChannelType,
  RouteBases,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { getDate, type Snowflake } from "discord-snowflake";
import { and, eq, sql } from "drizzle-orm";
import { webhooks } from "store";
import { type Client, parseApplicationsValue } from "../../client.js";
import type { ButtonCallback } from "../../components.js";
import type { InteractionContext } from "../../interactions.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { parseAutoComponentId } from "../../util/components.js";
import { color } from "../../util/meta.js";
import type { ChatInputAppCommandCallback } from "../handler.js";
import { createLongDiscohookUrl } from "../restore.js";

export const getWebhookInfoEmbed = (webhook: APIWebhook) => {
  const createdAt = getDate(webhook.id as Snowflake);

  return new EmbedBuilder({
    title: "Webhook Info",
    color,
    thumbnail: {
      url: webhookAvatarUrl(webhook, { size: 1024 }),
    },
    fields: [
      {
        name: "Name",
        value: (webhook.name || "...").slice(0, 1024),
        inline: true,
      },
      {
        name: "Channel",
        value: `<#${webhook.channel_id}>`,
        inline: true,
      },
      {
        name: "ID",
        value: webhook.id,
        inline: true,
      },
      {
        name: "Created by",
        value: webhook.user ? `<@${webhook.user.id}>` : "Unknown",
        inline: true,
      },
      {
        name: "Created at",
        value: `${time(createdAt, TimestampStyles.ShortDate)} (${time(
          createdAt,
          TimestampStyles.RelativeTime,
        )})`,
        inline: true,
      },
    ],
  });
};

export const getWebhookUrlEmbed = (
  webhook: APIWebhook,
  header?: string,
  channelType?: ChannelType,
  showUrl?: boolean,
) => {
  const title = header ?? "Webhook URL";

  if (!webhook.token) {
    return new EmbedBuilder({
      title,
      description: dedent`
        This webhook\'s token is not available. It may have been created by a\
        different bot or it may be a news webhook (from a different server).
      `,
      color,
    });
  }

  const url = getWebhookUrl(webhook);
  const embed = new EmbedBuilder({
    title,
    description: showUrl
      ? spoiler(inlineCode(url))
      : `**${webhook.name}** in <#${webhook.channel_id}>`,
    color,
  });

  if (showUrl) {
    embed.setAuthor({
      name: webhook.name ?? "Webhook",
      iconURL: webhookAvatarUrl(webhook, { size: 128 }),
    });
  } else {
    embed.setThumbnail(webhookAvatarUrl(webhook, { size: 1024 }));
  }

  // Surely this is not necessary?
  // embed.addFields({
  //   name: ":information_source: Usage",
  //   value: dedent`
  //       Click "Open in Discohook". Compose your message and click send to create a new message.
  //       If you need the webhook URL for another application,
  //     `,
  //   inline: false,
  // });

  embed.addFields(
    webhook.application_id &&
      Bun.env.DISCORD_APPLICATION_ID === webhook.application_id
      ? {
          name: ":white_check_mark: Buttons & Selects",
          value:
            "This webhook is owned by Discohook, so its messages can have components.",
          inline: false,
        }
      : {
          name: ":x: Buttons & Selects",
          value: "This webhook is not owned by Discohook.",
          inline: false,
        },
  );

  if (
    channelType === ChannelType.GuildForum ||
    channelType === ChannelType.GuildMedia
  ) {
    embed.addFields({
      name: "<:forum:1074458133407211562> Forum/media channels",
      value: dedent`
          <#${webhook.channel_id}> is a thread-only channel. In order to create a new\
          post using Discohook, click "Thread" and fill in the "Forum Thread Name" box.\
          If you want to send to an existing thread, paste the ID of the thread in the\
          "Thread ID" box.\
          [Read how to get a thread ID](https://support.discord.com/hc/en-us/articles/206346498)\
          or use </id channel:1281305550340096032>.
        `,
      inline: false,
    });
  }

  if (showUrl) {
    embed.addFields({
      name: ":warning: Keep this secret!",
      value: dedent`
        Someone who can see this URL can send any message they want in\
        <#${webhook.channel_id}>, including scams and \`@everyone\` mentions.\
        We are not able to screen messages sent by users.
      `,
      inline: false,
    });
  }

  return embed;
};

export const getWebhook = async (
  client: Client,
  webhookId: string,
  webhookApplicationId?: string,
  // This is for when we are trying to resolve a full webhook from partial
  // server webhooks cache and already have the token; we can save some time
  // this way
  token?: string,
): Promise<APIWebhook> => {
  const APPLICATIONS = parseApplicationsValue();

  let tryAppId = webhookApplicationId;
  let botToken = webhookApplicationId
    ? APPLICATIONS[webhookApplicationId]
    : Bun.env.DISCORD_TOKEN;
  if (!botToken) {
    tryAppId = Bun.env.DISCORD_APPLICATION_ID;
    botToken = Bun.env.DISCORD_TOKEN;
  }
  const cached = client.webhooks.get(webhookId);
  // Only return cached result if we already have the token
  // or wouldn't be able to retrieve it
  if (
    cached &&
    (token ||
      cached.token ||
      cached.type !== WebhookType.Incoming ||
      (cached.application_id && !APPLICATIONS[cached.application_id]))
  ) {
    if (token && !cached.token) {
      // not likely to happen
      cached.token = token;
    }
    return cached;
  }

  const rest =
    botToken === Bun.env.DISCORD_TOKEN
      ? client.rest
      : new REST().setToken(botToken);
  const webhook = (await rest.get(
    Routes.webhook(webhookId, token),
  )) as APIWebhook;
  if (webhook.token || webhook.type !== WebhookType.Incoming) {
    // Non-incoming webhooks don't have tokens
    client.webhooks.set(webhookId, webhook);
    return webhook;
  }

  if (webhook.application_id && tryAppId !== webhook.application_id) {
    // env check ensures we don't enter infinite recursion
    if (APPLICATIONS[webhook.application_id]) {
      // we know `token` doesn't need to be passed again because if it was
      // valid then we would already have the webhook, and if it was invalid
      // then we would have errored out.
      return await getWebhook(client, webhook.id, webhook.application_id);
    }
    client.webhooks.set(webhookId, webhook);
    return webhook;
  }

  throw Error("Could not retrieve the webhook.");
};

export const webhookInfoCallback: ChatInputAppCommandCallback = async (ctx) => {
  const webhookId = ctx.getStringOption("webhook").value;
  const showUrl = ctx.getBooleanOption("show-url")?.value ?? false;
  const webhook = showUrl
    ? // if we're going to need the URL right away, bother with the possible extra fetch
      await getWebhook(ctx.client, webhookId)
    : await ctx.client.api.webhooks.get(webhookId);

  const tokenAccessible = webhook.application_id
    ? !!parseApplicationsValue()[webhook.application_id]
    : webhook.type === WebhookType.Incoming;

  const embeds = [getWebhookInfoEmbed(webhook)];
  if (showUrl) {
    embeds.push(
      getWebhookUrlEmbed(
        webhook,
        undefined,
        webhook.channel_id === ctx.interaction.channel.id
          ? ctx.interaction.channel.type
          : undefined,
        showUrl,
      ),
    );
  }

  if (
    !showUrl &&
    ctx.userPermissons.has(PermissionFlags.ManageWebhooks) &&
    !webhook.token &&
    !tokenAccessible
  ) {
    embeds[0]?.setFooter({
      // This basically just means that if another bot created the webhook and
      // lets you see the token then you can provide it yourself on the website.
      // But that's a little wordy and I'm not sure how many cases there are
      // where that's useful information for people.
      text: "Discohook cannot see this webhook's token, so it cannot be used unless you provide the URL manually. Try creating a new webhook with Discohook.",
    });
  }

  const components =
    !showUrl && ctx.userPermissons.has(PermissionFlags.ManageWebhooks)
      ? [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`a_webhook-info-use_${webhook.id}`)
              .setLabel("Use Webhook")
              .setDisabled(!webhook.token && !tokenAccessible)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`a_webhook-info-show-url_${webhook.id}`)
              .setLabel("Show URL (advanced)")
              .setDisabled(!webhook.token && !tokenAccessible)
              .setStyle(ButtonStyle.Secondary),
          ),
        ]
      : undefined;

  await ctx.reply({
    embeds,
    components,
    ephemeral: showUrl,
  });
};

const processUseWebhookButtonBoilerplate = async (
  ctx: InteractionContext<APIMessageComponentButtonInteraction>,
) => {
  if (!ctx.userPermissons.has(PermissionFlags.ManageWebhooks)) {
    await ctx.reply({
      content: "You need the manage webhooks permission.",
      ephemeral: true,
    });
    return;
  }
  const guildId = ctx.interaction.guild_id;
  if (!guildId) {
    await ctx.reply({
      content: "This is a guild-only operation.",
      ephemeral: true,
    });
    return;
  }

  const { webhookId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
  );

  const db = ctx.client.getDb();
  const dbWebhook = await db.query.webhooks.findFirst({
    where: and(eq(webhooks.platform, "discord"), eq(webhooks.id, webhookId)),
    columns: { token: true },
  });

  const webhook = await getWebhook(ctx.client, webhookId);
  if (!webhook.guild_id || webhook.guild_id !== guildId) {
    await ctx.reply({
      content: "This webhook belongs to a different server.",
      ephemeral: true,
    });
    return;
  }

  db.insert(webhooks)
    .values({
      platform: "discord",
      id: webhook.id,
      name: webhook.name ?? "",
      token: webhook.token ?? dbWebhook?.token,
      avatar: webhook.avatar,
      channelId: webhook.channel_id,
      applicationId: webhook.application_id,
      discordGuildId: BigInt(webhook.guild_id ?? guildId),
    })
    .onConflictDoUpdate({
      target: [webhooks.platform, webhooks.id],
      set: {
        name: sql`excluded.name`,
        token: sql`excluded.token`,
        avatar: sql`excluded.avatar`,
        channelId: sql`excluded."channelId"`,
        discordGuildId: sql`excluded."discordGuildId"`,
      },
    })
    .catch(console.error);

  if (!webhook.token) {
    if (dbWebhook?.token) {
      webhook.token = dbWebhook.token;
    } else {
      await ctx.reply({
        content: "The webhook's token is not available.",
        ephemeral: true,
      });
      return;
    }
  }

  return webhook;
};

export const getWebhookUrl = (
  webhook: Pick<APIWebhook, "id" | "token" | "url">,
): string =>
  webhook.url ?? RouteBases.api + Routes.webhook(webhook.id, webhook.token);

export const webhookInfoUseCallback: ButtonCallback = async (ctx) => {
  const webhook = await processUseWebhookButtonBoilerplate(ctx);
  if (!webhook) return;

  const url = createLongDiscohookUrl({
    version: "d2",
    messages: [{ data: {} }],
    targets: [{ url: getWebhookUrl(webhook) }],
  });

  await ctx.reply({
    content:
      "Click the button to start a new Discohook message with this webhook preloaded.",
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Open Discohook")
          .setURL(url),
      ),
    ],
    ephemeral: true,
  });
};

export const webhookInfoShowUrlCallback: ButtonCallback = async (ctx) => {
  const webhook = await processUseWebhookButtonBoilerplate(ctx);
  if (!webhook) return;

  const embed = getWebhookUrlEmbed(
    webhook,
    undefined,
    // TODO: always provide channel type
    ctx.interaction.channel.id === webhook.channel_id
      ? ctx.interaction.channel.type
      : undefined,
    true,
  );
  await ctx.reply({
    embeds: [embed],
    ephemeral: true,
  });
};
