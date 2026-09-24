import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  messageLink,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  type APIEmoji,
  type APIGuildMember,
  type APIGuildTextChannel,
  type APIMessage,
  type APIMessageApplicationCommandGuildInteraction,
  type APIWebhook,
  ButtonStyle,
  type ChannelType,
  ComponentType,
  OverwriteType,
  type RESTGetAPIGuildMemberResult,
  type RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { eq } from "drizzle-orm";
import {
  autoRollbackTx,
  discordMessageComponents,
  type DraftComponent,
  getchTriggerGuild,
  getDb,
  launchComponentKV,
  makeSnowflake,
  type StorableButtonWithUrl,
  TriggerKVGuild,
  upsertDiscordUser,
} from "store";
import type { MessageAppCommandCallback } from "../commands.js";
import type {
  AutoComponentCustomId,
  ButtonCallback,
  SelectMenuCallback,
} from "../components.js";
import type { InteractionContext } from "../interactions.js";
import {
  onlyActionRows,
  parseAutoComponentId,
  textDisplay,
} from "../util/components.js";
import { MAX_SELECT_OPTIONS } from "../util/constants.js";
import { boolEmoji, color } from "../util/meta.js";
import { extractComponentByPath } from "./components/delete.js";
import { ensureValidEmoji, getComponentsAsV2Menu } from "./components/edit.js";
import { getWebhookMessage } from "./components/entry.js";
import { isSnowflakeSafe } from "./reactionRoles.js";

const getMessageDebugContainers = async (
  ctx: InteractionContext<APIMessageApplicationCommandGuildInteraction>,
  message: APIMessage,
) => {
  let webhook: APIWebhook | undefined;
  if (message.webhook_id) {
    try {
      webhook = (await ctx.rest.get(
        Routes.webhook(message.webhook_id),
      )) as APIWebhook;
    } catch {}
  }

  const guildId = ctx.interaction.guild_id;
  const container = new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents(
      textDisplay(
        `### Message Debug for ${messageLink(
          message.channel_id,
          message.id,
          guildId,
        )}`,
      ),
    );

  const [roles, channel] = await Promise.all([
    (async () => {
      try {
        return (await ctx.rest.get(
          Routes.guildRoles(guildId),
        )) as RESTGetAPIGuildRolesResult;
      } catch {}
    })(),
    ctx.rest.get(
      Routes.channel(webhook?.channel_id ?? ctx.interaction.channel.id),
    ) as Promise<
      APIGuildTextChannel<
        | ChannelType.GuildText
        | ChannelType.GuildVoice
        | ChannelType.GuildAnnouncement
        | ChannelType.GuildForum
        | ChannelType.GuildMedia
      >
    >,
  ]);

  let guildPerm = new PermissionsBitField();
  let channelAllow = new PermissionsBitField();
  const channelDeny = new PermissionsBitField();

  // calculate for user (webhook owner if bot, else direct author)
  if (webhook?.user?.bot || !message.webhook_id) {
    const userId = webhook?.user?.bot ? webhook.user.id : message.author.id;

    let member: APIGuildMember | undefined;
    if (
      webhook?.user?.bot &&
      webhook.application_id === ctx.interaction.application_id
    ) {
      member = ctx.interaction.member;
      channelAllow = ctx.appPermissons;
    } else if (userId === ctx.user.id) {
      member = ctx.interaction.member;
      channelAllow = ctx.userPermissons;
    }
    if (!member) {
      // must exist because webhooks are removed if the bot is removed, and
      // oauth webhooks have the `user` of the user who authorized.
      // TODO: what permissions do oauth webhooks inherit?
      member = (await ctx.rest.get(
        Routes.guildMember(guildId, userId),
      )) as RESTGetAPIGuildMemberResult;
    }
    if (roles) {
      for (const roleId of member.roles) {
        const role = roles.find((r) => r.id === roleId);
        if (!role) continue;

        guildPerm.add(BigInt(role.permissions));
      }
    }
    if (channelAllow.value !== 0n) {
      for (const override of channel.permission_overwrites ?? []) {
        switch (override.type) {
          case OverwriteType.Member:
            if (override.id === userId) {
              channelAllow.add(BigInt(override.allow));
              channelDeny.add(BigInt(override.deny));
            }
            break;
          case OverwriteType.Role:
            if (member.roles.includes(override.id)) {
              channelAllow.add(BigInt(override.allow));
              channelDeny.add(BigInt(override.deny));
            }
            break;
          default:
            break;
        }
      }
    }
  }
  // calculate for @everyone (if webhook)
  if (message.webhook_id) {
    // Disregard the webhook owner in favor of @everyone if they are a human,
    // but not if they are a bot
    const everyoneRole = roles?.find((r) => r.id === guildId);
    if (everyoneRole) {
      if (webhook?.user?.bot) {
        guildPerm.add(BigInt(everyoneRole.permissions));
      } else {
        guildPerm = new PermissionsBitField(BigInt(everyoneRole.permissions));
      }
    }
    for (const override of channel.permission_overwrites ?? []) {
      if (override.type === OverwriteType.Role && override.id === guildId) {
        channelAllow.add(BigInt(override.allow));
        channelDeny.add(BigInt(override.deny));
      }
    }
  }
  const hasGuildExtEmoji = guildPerm.has(PermissionFlags.UseExternalEmojis);
  const hasChannelExtEmoji = channelDeny.has(PermissionFlags.UseExternalEmojis)
    ? false
    : channelAllow.has(PermissionFlags.UseExternalEmojis)
      ? true
      : null;

  container
    .addTextDisplayComponents(
      textDisplay(dedent`
        **Emojis**
        Permissions for this message inherit from ${
          webhook?.user?.bot
            ? `<@${webhook.user.id}> and @everyone`
            : message.webhook_id
              ? "@everyone"
              : `<@${message.author.id}>`
        }`),
    )
    .addSeparatorComponents((s) => s.setDivider())
    .addTextDisplayComponents(
      textDisplay(dedent`
        ${boolEmoji(true)} Use this server's emojis
        ${boolEmoji(hasGuildExtEmoji)} Use external emojis (server)
        ${boolEmoji(hasChannelExtEmoji)} Use external emojis (channel)
        ${(hasChannelExtEmoji === null ? hasGuildExtEmoji : hasChannelExtEmoji) ? "Looks good! If you just updated permissions, try sending the message again." : ""}
      `),
    )
    .addSeparatorComponents((s) => s.setDivider());

  const threadId = message.position === undefined ? "" : message.channel_id;
  if (
    message.components &&
    webhook?.application_id === ctx.interaction.application_id
  ) {
    const interactive = onlyActionRows(message.components, true, true)
      .flatMap((r) => r.components)
      .filter(
        (c) =>
          c.type !== ComponentType.Button ||
          (c.style !== ButtonStyle.Link && c.style !== ButtonStyle.Premium),
      );
    if (interactive.length !== 0) {
      container
        .addSectionComponents((s) =>
          s
            .addTextDisplayComponents(
              textDisplay(dedent`
                **Components**
                ${interactive.length} on this message ${interactive.length === 1 ? "is" : "are"} interactive
              `),
            )
            .setButtonAccessory(
              new ButtonBuilder()
                .setCustomId(
                  `a_debug-component-flow_${message.webhook_id}:${message.id}:${threadId}` satisfies AutoComponentCustomId,
                )
                .setLabel("Debug Components")
                .setStyle(ButtonStyle.Primary),
            ),
        )
        .addSeparatorComponents((s) => s.setDivider());
    }
  }

  container.addTextDisplayComponents(
    textDisplay(
      `-# ID: ${message.id}\n-# Flags: ${message.flags?.toString() ?? 0}`,
    ),
  );
  return [container];
};

export const debugMessageCallback: MessageAppCommandCallback<
  APIMessageApplicationCommandGuildInteraction
> = async (ctx) => {
  const message = ctx.getMessage();
  return ctx.reply({
    components: await getMessageDebugContainers(ctx, message),
    ephemeral: true,
    componentsV2: true,
    allowedMentions: { parse: [] },
  });
};

// This is a separate callback instead of being affixed to debugMessageCallback
// because of the components per message limit.
export const debugComponentFlowPickerCallback: ButtonCallback<true> = async (
  ctx,
) => {
  const {
    webhookId,
    messageId,
    threadId: threadId_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
    "messageId",
    "threadId",
  );
  const threadId = threadId_ || undefined;

  if (
    !ctx.userPermissons.has(
      PermissionFlags.ManageWebhooks,
      PermissionFlags.ManageMessages,
    )
  ) {
    return ctx.reply({
      content:
        "You need the Manage Webhooks and Manage Messages permissions to modify components.",
      ephemeral: true,
    });
  }

  const { message, webhook } = await getWebhookMessage(
    ctx.env,
    webhookId,
    messageId,
    threadId,
    ctx.rest,
  );

  const guildId = ctx.interaction.guild_id;
  if (webhook.guild_id !== guildId) {
    return ctx.reply({ content: "Server ID mismatch", ephemeral: true });
  }
  if (webhook.application_id !== ctx.interaction.application_id) {
    return ctx.reply({
      content: "This webhook is not owned by Discohook",
      ephemeral: true,
    });
  }

  const menu = getComponentsAsV2Menu(message.components ?? [], [], {
    getSelectCustomId: (index: number) =>
      `a_debug-component-flow-pick_${message.webhook_id}:${message.id}:${threadId}:${index}` satisfies AutoComponentCustomId,
  });
  menu.splice(
    0,
    0,
    textDisplay(dedent`
      **Components**
      Select one to debug.
    `).toJSON(),
  );

  return ctx.updateMessage({
    components: menu,
    allowedMentions: { parse: [] },
  });
};

export const debugComponentFlowPickCallback: SelectMenuCallback<true> = async (
  ctx,
) => {
  const {
    webhookId,
    messageId,
    threadId: threadId_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "webhookId",
    "messageId",
    "threadId",
  );
  const threadId = threadId_ || undefined;

  const db = getDb(ctx.env.HYPERDRIVE);
  let component:
    | {
        id: bigint;
        data: DraftComponent;
        createdBy: { discordId: bigint | null } | null;
        updatedBy: { discordId: bigint | null } | null;
      }
    | undefined;

  const [scope, key] = ctx.interaction.data.values[0].split(":");
  switch (scope as "id" | "link" | "unknown") {
    case "id": {
      const id = BigInt(key);
      const dbComponent = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          id: true,
          data: true,
          guildId: true,
          messageId: true,
        },
        with: {
          createdBy: { columns: { discordId: true } },
          updatedBy: { columns: { discordId: true } },
        },
      });
      if (
        !dbComponent ||
        dbComponent.guildId?.toString() !== ctx.interaction.guild_id ||
        (dbComponent.messageId !== null &&
          dbComponent.messageId?.toString() !== messageId)
      ) {
        return ctx.updateMessage({
          components: [textDisplay("Unknown component")],
        });
      }
      component = dbComponent;
      break;
    }
    case "link": {
      const path = key.split(".").map(Number);
      const { message } = await getWebhookMessage(
        ctx.env,
        webhookId,
        messageId,
        threadId,
        ctx.rest,
      );
      const foundComponent = extractComponentByPath(message, path);
      if (
        !foundComponent ||
        foundComponent.type !== ComponentType.Button ||
        foundComponent.style !== ButtonStyle.Link
      ) {
        return ctx.updateMessage({
          components: [
            textDisplay("The button could not be located in the message."),
          ],
        });
      }

      const dbComponents = await db.query.discordMessageComponents.findMany({
        where: (table, { eq, and }) =>
          and(
            eq(table.messageId, BigInt(messageId)),
            eq(table.type, ComponentType.Button),
          ),
        columns: { id: true, data: true },
        with: {
          createdBy: { columns: { discordId: true } },
          updatedBy: { columns: { discordId: true } },
        },
      });
      component = dbComponents.find(
        (c) =>
          c.data.type === ComponentType.Button &&
          c.data.style === ButtonStyle.Link &&
          c.data.url === foundComponent.url,
      );
      if (!component) {
        const user = await upsertDiscordUser(db, ctx.user);
        const [dbComponent] = await db
          .insert(discordMessageComponents)
          .values({
            channelId: makeSnowflake(message.channel_id),
            messageId: makeSnowflake(message.id),
            guildId: makeSnowflake(ctx.interaction.guild_id),
            type: ComponentType.Button,
            data: foundComponent satisfies StorableButtonWithUrl,
            createdById: user.id,
          })
          .returning({ id: discordMessageComponents.id });
        component = {
          ...dbComponent,
          data: foundComponent,
          createdBy: user,
          updatedBy: user,
        };
      }

      break;
    }
    default:
      break;
  }

  if (!component) {
    // As far as we know, this component doesn't actually exist anymore
    return ctx.reply({
      components: [
        textDisplay("Cannot resolve that component from the database."),
      ],
      ephemeral: true,
      componentsV2: true,
    });
  }

  const responsibleId = (
    component.updatedBy?.discordId ?? component.createdBy?.discordId
  )?.toString();

  const [guild, emojis, responsible] = await Promise.all([
    // currently we only really need this for owner_id, but unfortunately
    // interaction.guild doesn't provide that
    getchTriggerGuild(ctx.rest, ctx.env, ctx.interaction.guild_id),
    (async (): Promise<APIEmoji[]> => {
      if ("flows" in component.data) {
        try {
          return (await ctx.rest.get(
            Routes.guildEmojis(ctx.interaction.guild_id),
          )) as APIEmoji[];
        } catch {}
      }
      return [];
    })(),
    (async () => {
      if (responsibleId) {
        try {
          return (await ctx.rest.get(
            Routes.guildMember(ctx.interaction.guild_id, responsibleId),
          )) as APIGuildMember;
        } catch {
          return null;
        }
      }
      return undefined;
    })(),
  ]);

  const container = new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents(
      textDisplay(dedent`
        ### ${ComponentType[component.data.type]
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .trim()} on ${messageLink(
          ctx.interaction.channel.id,
          messageId,
          ctx.interaction.guild_id,
        )}
        Responsible user: ${
          responsible
            ? `<@${responsible.user.id}> (${responsible.user.username})`
            : responsible === null
              ? "not found in the server"
              : "indeterminable (nothing stored for this component)"
        }

      `),
    );
  // .addSeparatorComponents((s) => s.setDivider());

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(
        `a_debug-component-take_${component.id}` satisfies AutoComponentCustomId,
      )
      .setLabel("Take Responsibility")
      .setStyle(ButtonStyle.Secondary),
  );
  container.addActionRowComponents(row);
  if (ctx.user.id !== guild.owner_id) {
    const btn = row.components[0] as ButtonBuilder;
    btn.setDisabled(true);
    btn.setLabel("Take Responsibility (owner only)");
  }

  if ("flows" in component.data) {
    const options = component.data.options
      .map((option) => {
        return new StringSelectMenuOptionBuilder({
          ...option,
          emoji: ensureValidEmoji(option.emoji, emojis),
          default: false,
        });
      })
      .slice(0, MAX_SELECT_OPTIONS);

    container
      // .addTextDisplayComponents(textDisplay("Test Flow"))
      .addActionRowComponents((r) =>
        r.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`DBG_p_${component.id}`)
            .setPlaceholder("Test Option Flow")
            .addOptions(options)
            .setMaxValues(1),
        ),
      );
  } else {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`DBG_p_${component.id}`)
        .setLabel("Test Flow")
        .setStyle(ButtonStyle.Secondary),
    );
  }

  return ctx.updateMessage({
    components: [container],
    allowedMentions: { parse: [] },
  });
};

export const debugComponentFlowTakeResponsibilityCallback: ButtonCallback<
  true
> = async (ctx) => {
  const { componentId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "componentId",
  );
  if (!isSnowflakeSafe(componentId)) {
    return ctx.reply({ content: "Invalid ID", ephemeral: true });
  }
  if (
    !ctx.userPermissons.has(
      PermissionFlags.ManageWebhooks,
      PermissionFlags.ManageMessages,
    )
  ) {
    return ctx.reply({
      content:
        "You need the Manage Webhooks and Manage Messages permissions to modify this component.",
      ephemeral: true,
    });
  }

  const db = getDb(ctx.env.HYPERDRIVE);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      data: true,
      guildId: true,
      channelId: true,
      createdById: true,
    },
  });
  if (
    !component ||
    component.channelId?.toString() !== ctx.interaction.channel.id
  ) {
    return ctx.updateMessage({
      components: [textDisplay("Unknown component or channel mismatch")],
    });
  }

  return [
    ctx.defer({ ephemeral: true, thinking: true, componentsV2: true }),
    async () => {
      await db.transaction(
        autoRollbackTx(async (tx) => {
          let dbUser = await tx.query.users.findFirst({
            where: (users, { eq }) => eq(users.discordId, BigInt(ctx.user.id)),
            columns: { id: true },
          });
          if (!dbUser) dbUser = await upsertDiscordUser(tx, ctx.user);

          await tx
            .update(discordMessageComponents)
            .set({ updatedById: dbUser.id })
            .where(eq(discordMessageComponents.id, BigInt(componentId)));
        }),
      );

      let guild: Pick<TriggerKVGuild, "_roles">;
      try {
        guild = await getchTriggerGuild(
          ctx.rest,
          ctx.env,
          ctx.interaction.guild_id,
        );
      } catch {
        guild = { _roles: [] };
      }
      // Doing this instead of using ctx.userPermissions because that is for
      // the current channel, not the guild
      const permissions = new PermissionsBitField();
      for (const roleId of ctx.interaction.member.roles) {
        const role = guild._roles?.find((r) => r.id === roleId);
        if (!role) continue;
        permissions.add(BigInt(role.permissions));
      }
      await launchComponentKV(ctx.env, {
        componentId,
        db,
        data: component.data,
        guildId: component.guildId?.toString(),
        channelId: component.channelId?.toString(),
        createdById: component.createdById?.toString(),
        responsibleUser: {
          id: ctx.user.id,
          username: ctx.user.username,
          roles: ctx.interaction.member.roles,
          guild_permissions: permissions.value.toString(),
          reason: "took responsibility with debug command",
        },
      });

      await ctx.followup.send({
        components: [
          textDisplay(
            "Updated the component. You are now the responsible user until someone else edits it.",
          ),
        ],
        componentsV2: true,
      });
    },
  ];
};
