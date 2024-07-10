import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  TimestampStyles,
  inlineCode,
  spoiler,
  time,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import dedent from "dedent-js";
import {
  APIMessageComponentButtonInteraction,
  APIWebhook,
  ButtonStyle,
  ChannelType,
  MessageFlags,
  RouteBases,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { Snowflake, getDate } from "discord-snowflake";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "store";
import { webhooks } from "store/src/schema/schema.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { ButtonCallback } from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { Env } from "../../types/env.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import { parseAutoComponentId } from "../../util/components.js";
import { color } from "../../util/meta.js";
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
  applicationId?: string,
  channelType?: ChannelType,
  showUrl?: boolean,
) => {
  const title = header ?? "Webhook URL";

  if (!webhook.token) {
    return new EmbedBuilder({
      title,
      description: dedent`
        This webhook\'s token is not available. It may have been created by a
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

  if (!showUrl) {
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
    webhook.application_id && applicationId === webhook.application_id
      ? {
          name: ":information_source: Buttons & Selects",
          value:
            "This webhook is owned by Discohook, so its messages can have components.",
          inline: false,
        }
      : {
          name: ":warning: Buttons & Selects",
          value: "This webhook is not owned by Discohook.",
          inline: false,
        },
  );

  if (channelType === ChannelType.GuildForum) {
    embed.addFields({
      name: "<:forum:1074458133407211562> Forum channels",
      value: dedent`
          <#${webhook.channel_id}> is a forum channel. In order to create a new forum
          post using Discohook, click "Thread" and fill in the "Forum Thread Name" box.
          If you want to send to an existing thread, add \`?thread_id=xxx\` to the end of
          the above webhook URL, where \`xxx\` is the ID of the thread.
          [Read how to get a thread ID](https://support.discord.com/hc/en-us/articles/206346498)
        `,
      inline: false,
    });
  }

  if (showUrl) {
    embed.addFields({
      name: ":warning: Keep this secret!",
      value: dedent`
        Someone who can see this URL can send any message they want in
        <#${webhook.channel_id}>, including scams and \`@everyone\` mentions.
        We are not able to screen messages sent by users.
      `,
      inline: false,
    });
  }

  return embed;
};

export const getWebhook = async (
  webhookId: string,
  env: Env,
  webhookApplicationId?: string,
): Promise<APIWebhook> => {
  let tryAppId = webhookApplicationId;
  let token = webhookApplicationId
    ? env.APPLICATIONS[webhookApplicationId]
    : env.DISCORD_TOKEN;
  if (!token) {
    tryAppId = env.DISCORD_APPLICATION_ID;
    token = env.DISCORD_TOKEN;
  }
  const rest = new REST().setToken(token);
  const webhook = (await rest.get(Routes.webhook(webhookId))) as APIWebhook;
  if (webhook.token || webhook.type !== WebhookType.Incoming) {
    // Non-incoming webhooks don't have tokens
    return webhook;
  }

  if (webhook.application_id && tryAppId !== webhook.application_id) {
    if (env.APPLICATIONS[webhook.application_id]) {
      // env check ensures we don't enter infinite recursion
      return await getWebhook(webhook.id, env, webhook.application_id);
    }
    return webhook;
  }

  throw Error("Could not retrieve the webhook.");
};

export const webhookInfoCallback: ChatInputAppCommandCallback = async (ctx) => {
  const webhookId = ctx.getStringOption("webhook").value;
  const showUrl = ctx.getBooleanOption("show-url")?.value ?? false;
  const webhook = showUrl
    ? // if we're going to need the URL right away, bother with the possible extra fetch
      await getWebhook(webhookId, ctx.env)
    : ((await ctx.rest.get(Routes.webhook(webhookId))) as APIWebhook);

  const embeds = [getWebhookInfoEmbed(webhook).toJSON()];
  if (showUrl) {
    embeds.push(
      getWebhookUrlEmbed(
        webhook,
        undefined,
        ctx.interaction.application_id,
        ctx.interaction.channel.type,
        showUrl,
      ).toJSON(),
    );
  }

  if (
    !showUrl &&
    ctx.userPermissons.has(PermissionFlags.ManageWebhooks) &&
    !webhook.token
  ) {
    embeds[0].footer = {
      // This basically just means that if another bot created the webhook and
      // lets you see the token then you can provide it yourself on the website.
      // But that's a little wordy and I'm not sure how many cases there are
      // where that's useful information for people.
      text: "Discohook cannot see this webhook's token, so it cannot be used unless you provide the URL manually. Try creating a new webhook with Discohook.",
    };
  }

  const components =
    !showUrl && ctx.userPermissons.has(PermissionFlags.ManageWebhooks)
      ? [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`a_webhook-info-use_${webhook.id}`)
                .setLabel("Use Webhook")
                .setDisabled(!webhook.token)
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId(`a_webhook-info-show-url_${webhook.id}`)
                .setLabel("Show URL (advanced)")
                .setDisabled(!webhook.token)
                .setStyle(ButtonStyle.Secondary),
            )
            .toJSON(),
        ]
      : undefined;

  return ctx.reply({
    embeds,
    flags: showUrl ? MessageFlags.Ephemeral : undefined,
    components,
  });
};

const processUseWebhookButtonBoilerplate = async (
  ctx: InteractionContext<APIMessageComponentButtonInteraction>,
) => {
  if (!ctx.userPermissons.has(PermissionFlags.ManageWebhooks)) {
    return ctx.reply({
      content: "You need the manage webhooks permission.",
      flags: MessageFlags.Ephemeral,
    });
  }
  const { webhookId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
  );

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  const dbWebhook = await db.query.webhooks.findFirst({
    where: and(eq(webhooks.platform, "discord"), eq(webhooks.id, webhookId)),
    columns: {
      id: true,
      token: true,
    },
  });

  const webhook = await getWebhook(webhookId, ctx.env);
  db.insert(webhooks)
    .values({
      platform: "discord",
      id: webhook.id,
      name: webhook.name ?? "",
      token: webhook.token ?? dbWebhook?.token,
      avatar: webhook.avatar,
      channelId: webhook.channel_id,
      applicationId: webhook.application_id,
    })
    .onConflictDoUpdate({
      target: [webhooks.platform, webhooks.id],
      set: {
        name: sql`excluded.name`,
        token: sql`excluded.token`,
        avatar: sql`excluded.avatar`,
        channelId: sql`excluded."channelId"`,
      },
    })
    .catch(console.error);

  if (!webhook.token) {
    if (dbWebhook?.token) {
      webhook.token = dbWebhook.token;
    } else {
      return ctx.reply({
        content: "The webhook's token is not available.",
        flags: MessageFlags.Ephemeral,
      });
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
  if (!("id" in webhook)) return webhook;
  webhook.token;

  const url = createLongDiscohookUrl(ctx.env.DISCOHOOK_ORIGIN, {
    version: "d2",
    messages: [{ data: {} }],
    targets: [{ url: getWebhookUrl(webhook) }],
  });

  return ctx.reply({
    content:
      "Click the button to start a new Discohook message with this webhook preloaded.",
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Open Discohook")
            .setURL(url),
        )
        .toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const webhookInfoShowUrlCallback: ButtonCallback = async (ctx) => {
  const webhook = await processUseWebhookButtonBoilerplate(ctx);
  if (!("id" in webhook)) return webhook;

  const embed = getWebhookUrlEmbed(
    webhook,
    undefined,
    ctx.env.DISCORD_APPLICATION_ID,
    // TODO: always provide channel type
    ctx.interaction.channel.id === webhook.channel_id
      ? ctx.interaction.channel.type
      : undefined,
    true,
  );
  return ctx.reply({
    embeds: [embed.toJSON()],
    flags: MessageFlags.Ephemeral,
  });
};
