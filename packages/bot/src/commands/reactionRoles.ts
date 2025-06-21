import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  messageLink,
} from "@discordjs/builders";
import type { REST } from "@discordjs/rest";
import dedent from "dedent-js";
import {
  type APIEmoji,
  type APIGuild,
  type APIGuildMember,
  type APIMessage,
  type APIPartialEmoji,
  type APIRole,
  ButtonStyle,
  CDNRoutes,
  ImageFormat,
  type RESTGetAPIGuildEmojisResult,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { isSnowflake } from "discord-snowflake";
import { and, eq } from "drizzle-orm";
import { discordReactionRoles, getDb, makeSnowflake, upsertGuild } from "store";
import type {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "../commands.js";
import type { AutoComponentCustomId, ButtonCallback } from "../components.js";
import type { Env } from "../types/env.js";
import { parseAutoComponentId } from "../util/components.js";
import { color } from "../util/meta.js";
import {
  autocompleteMessageCallback,
  resolveMessageLink,
} from "./components/entry.js";
import { fetchEmojiData, resolveEmojiData } from "./emojis.js";

export const isSnowflakeSafe = (id: string): id is `${bigint}` => {
  try {
    return isSnowflake(id);
  } catch {
    return false;
  }
};

export const CUSTOM_EMOJI_RE = /^<(a)?:(\w+):(\d+)>/;

export const resolveEmoji = async (
  rest: REST,
  value: string,
  message: APIMessage | undefined,
  guildId: string,
  env: Env,
): Promise<APIPartialEmoji | undefined> => {
  const match = value.match(CUSTOM_EMOJI_RE);
  if (match) {
    // Possible worry: this does not check if the bot can access the emoji.
    const response = await fetch(
      RouteBases.cdn + CDNRoutes.emoji(match[3], ImageFormat.WebP),
    );
    if (response.ok) {
      // This does not check that the emoji still exists, only that the ID was
      // once valid. We are also assuming that the name and animated flag are
      // correct.
      return {
        id: match[3],
        name: match[2],
        animated: Boolean(match[1]),
      };
    }
    return undefined;
  }

  const val = value.replace(/^:|:$/g, "");
  const messageReaction = message?.reactions?.find((r) =>
    r.emoji.id
      ? r.emoji.id === value || r.emoji.name === val
      : r.emoji.name === val,
  );
  let emoji = messageReaction?.emoji;
  // Try guild emojis
  if (!emoji) {
    const emojis = (await rest.get(
      Routes.guildEmojis(guildId),
    )) as RESTGetAPIGuildEmojisResult;
    emoji = emojis.find((e) =>
      isSnowflakeSafe(value)
        ? e.id === value || e.name === val
        : e.name === val,
    );
  }
  // Try unicode emojis
  if (!emoji) {
    try {
      const rawEmojiData = await fetchEmojiData(env);
      const { nameToEmoji, emojiToName } = resolveEmojiData(rawEmojiData);

      const query = val.toLowerCase();
      if (emojiToName.has(query)) {
        emoji = {
          id: null,
          name: query,
        };
      } else if (nameToEmoji.has(query)) {
        emoji = {
          id: null,
          // biome-ignore lint/style/noNonNullAssertion: map.has() was true
          name: nameToEmoji.get(query)!,
        };
      }
    } catch (e) {
      // Worker is probably not reachable
      console.error(e);
    }
  }
  return emoji;
};

export const messageAndEmojiAutocomplete: AppCommandAutocompleteCallback =
  async (ctx) => {
    if (ctx.getStringOption("message").focused) {
      return await autocompleteMessageCallback(ctx);
    }
    const query = ctx.getStringOption("emoji").value;

    const guildId = ctx.interaction.guild_id;
    if (!guildId) return [];

    const kvKey = `cache-autocompleteGuildEmojis-${guildId}`;
    const cached = await ctx.env.KV.get<APIPartialEmoji[]>(kvKey, "json");
    let emojis = cached;
    if (!emojis) {
      const guildEmojis = (await ctx.rest.get(
        Routes.guildEmojis(guildId),
      )) as APIEmoji[];

      emojis = guildEmojis.map(
        (e) => ({ id: e.id, name: e.name }) satisfies APIPartialEmoji,
      );

      await ctx.env.KV.put(kvKey, JSON.stringify(emojis), {
        expirationTtl: 3600,
      });
    }

    return emojis
      .filter((emoji) =>
        emoji.name?.toLowerCase().includes(query.toLowerCase()),
      )
      .map((emoji) => {
        return {
          name: emoji.name ?? "Emoji",
          value: emoji.id ?? "",
        };
      });
  };

export const getHighestRole = (guildRoles: APIRole[], roleIds: string[]) =>
  guildRoles.find(
    (r) =>
      r.id ===
      [...roleIds].sort((aId, bId) => {
        const a = guildRoles.find((r) => r.id === aId);
        const b = guildRoles.find((r) => r.id === bId);
        return a && b ? b.position - a.position : a ? 1 : -1;
      })[0],
  );

export const createReactionRoleHandler: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only command");
  const guild = (await ctx.rest.get(Routes.guild(guildId))) as APIGuild;

  // biome-ignore lint/style/noNonNullAssertion: Required option
  const role = ctx.getRoleOption("role")!;
  if (role.managed) {
    return ctx.reply({
      content: `<@&${role.id}> can't be assigned to members.`,
      ephemeral: true,
    });
  }

  const me = (await ctx.rest.get(
    Routes.guildMember(guildId, ctx.env.DISCORD_APPLICATION_ID),
  )) as APIGuildMember;
  const botHighestRole = getHighestRole(guild.roles, me.roles);
  if (!botHighestRole && guild.owner_id !== ctx.env.DISCORD_APPLICATION_ID) {
    // You could be running an instance of this bot where
    // the bot is the owner of the guild
    return ctx.reply({
      content: `I can't assign <@&${role.id}> to members because I don't have any roles.`,
      ephemeral: true,
    });
  } else if (botHighestRole && role.position >= botHighestRole.position) {
    return ctx.reply({
      content: `<@&${role.id}> is higher than my highest role (<@&${botHighestRole.id}>), so I can't assign it to members. <@&${role.id}> needs to be lower in the role list, or my highest role needs to be higher.`,
      ephemeral: true,
    });
  }
  // biome-ignore lint/style/noNonNullAssertion: guild-only
  const member = ctx.interaction.member!;
  const memberHighestRole = getHighestRole(guild.roles, member.roles);
  if (guild.owner_id !== ctx.user.id) {
    // Guild owner can always do everything
    if (!memberHighestRole) {
      // This message should never be seen unless someone messes with permissions
      return ctx.reply({
        content: `You can't assign <@&${role.id}> to members because you don't have any roles.`,
        ephemeral: true,
      });
    } else if (
      memberHighestRole &&
      role.position >= memberHighestRole.position
    ) {
      return ctx.reply({
        content: `<@&${role.id}> is higher than your highest role (<@&${memberHighestRole.id}>), so you can't select it to be assigned to members. <@&${role.id}> needs to be lower in the role list, or your highest role needs to be higher.`,
        ephemeral: true,
      });
    }
  }

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

  const emoji = await resolveEmoji(
    ctx.rest,
    ctx.getStringOption("emoji").value,
    message,
    guildId,
    ctx.env,
  );
  if (!emoji) {
    return ctx.reply({
      content:
        "The emoji you specified couldn't be found. For best results, react to the message with the desired emoji before running this command.",
      ephemeral: true,
    });
  }

  // biome-ignore lint/style/noNonNullAssertion: Must have at least one
  const reaction = (emoji.id ?? emoji.name)!;
  const reactionMention = emoji.id
    ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
    : reaction;

  try {
    await ctx.rest.put(
      Routes.channelMessageOwnReaction(
        message.channel_id,
        message.id,
        encodeURIComponent(
          emoji.id
            ? `${emoji.animated ? "a:" : ""}${emoji.name}:${emoji.id}`
            : // biome-ignore lint/style/noNonNullAssertion: Required in this case
              emoji.name!,
        ),
      ),
    );
  } catch {
    return ctx.reply({
      content: `Failed to add the reaction (${reactionMention}) to the message.`,
      ephemeral: true,
    });
  }

  await ctx.env.KV.put(
    `discord-reaction-role-${message.id}-${reaction}`,
    JSON.stringify({ roleId: role.id }),
    { expirationTtl: 604800 },
  );
  const db = getDb(ctx.env.HYPERDRIVE);
  await upsertGuild(db, guild);
  await db
    .insert(discordReactionRoles)
    .values({
      guildId: makeSnowflake(guildId),
      channelId: makeSnowflake(message.channel_id),
      messageId: makeSnowflake(message.id),
      roleId: makeSnowflake(role.id),
      reaction,
    })
    .onConflictDoUpdate({
      target: [discordReactionRoles.messageId, discordReactionRoles.reaction],
      set: {
        roleId: makeSnowflake(role.id),
      },
    });
  return ctx.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Reaction role created")
        .setColor(color)
        .addFields(
          {
            name: "Message",
            value: messageLink(message.channel_id, message.id, guildId),
            inline: true,
          },
          {
            name: "Role",
            value: `<@&${role.id}>`,
            inline: true,
          },
          {
            name: "Emoji",
            value: reactionMention,
            inline: true,
          },
          {
            name: "Not working as expected?",
            value: dedent`
              Make sure:
              - <@${ctx.interaction.application_id}> has the View Channel permission in <#${message.channel_id}>
              - <@${ctx.interaction.application_id}> has the Manage Roles permission
              - <@${ctx.interaction.application_id}>'s highest role is higher than <@&${role.id}> in the role list
            `,
            inline: false,
          },
          {
            name: "Want more power?",
            value: dedent`
              Check out components! Try **/buttons add** for more info.
            `,
            inline: false,
          },
        ),
    ],
    ephemeral: true,
  });
};

export const deleteReactionRoleHandler: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only command");

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

  const emojiValue: string | undefined = ctx.getStringOption("emoji")?.value;
  if (emojiValue) {
    // We should only care about reactions that are actually on the message,
    // but all reactions may have been removed by accident.
    const emoji = await resolveEmoji(
      ctx.rest,
      emojiValue,
      message,
      guildId,
      ctx.env,
    );
    if (!emoji) {
      return ctx.reply({
        content:
          "The emoji you specified couldn't be found. For best results, react to the message with the desired emoji before running this command.",
        ephemeral: true,
      });
    }
    // biome-ignore lint/style/noNonNullAssertion: Must have at least one
    const reaction = (emoji.id ?? emoji.name)!;

    const db = getDb(ctx.env.HYPERDRIVE);
    const deleted = (
      await db
        .delete(discordReactionRoles)
        .where(
          and(
            eq(discordReactionRoles.messageId, makeSnowflake(message.id)),
            eq(discordReactionRoles.reaction, reaction),
          ),
        )
        .returning()
    )[0];
    try {
      await ctx.env.KV.delete(
        `discord-reaction-role-${message.id}-${reaction}`,
      );
    } catch {}

    return ctx.reply({
      ...(deleted
        ? {
            embeds: [
              new EmbedBuilder()
                .setTitle("Reaction role deleted")
                .setColor(color)
                .setDescription(dedent`
                  Message: ${messageLink(
                    message.channel_id,
                    message.id,
                    guildId,
                  )}
                  Role: <@&${deleted.roleId}>
                  Emoji: ${
                    isSnowflakeSafe(reaction) ? `<:_:${reaction}>` : reaction
                  }
                `),
            ],
          }
        : {
            content:
              "There was not a registered reaction role on that message for that emoji.",
          }),
      ephemeral: true,
    });
  }

  const db = getDb(ctx.env.HYPERDRIVE);
  const entries = await db.query.discordReactionRoles.findMany({
    where: eq(discordReactionRoles.messageId, makeSnowflake(message.id)),
  });

  if (entries.length === 0) {
    return ctx.reply({
      content: "This message has no reaction roles registered.",
      ephemeral: true,
    });
  }

  const rows: (typeof entries)[] = [];
  for (const entry of entries) {
    const lastRow = rows[rows.length - 1];
    if (!lastRow) rows.push([entry]);
    else {
      if (lastRow.length >= 5) rows.push([entry]);
      else lastRow.push(entry);
    }
    if (rows.length >= 5) break;
  }

  const { roles, emojis } = (await ctx.rest.get(
    Routes.guild(guildId),
  )) as APIGuild;

  return ctx.reply({
    content:
      'Below are all the reaction roles registered to this message. Click a button to permanently delete the reaction role. Some external emojis may not be shown, but order should be roughly correct. If a button says "Unknown Role", you should delete it.',
    components: rows.slice(0, 5).map((row) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        row.map((cell) => {
          const role = roles.find((r) => r.id === String(cell.roleId));
          const emoji = isSnowflakeSafe(cell.reaction)
            ? emojis.find((e) => e.id === cell.reaction)
            : { id: null, name: cell.reaction };
          return new ButtonBuilder({
            emoji: emoji
              ? {
                  animated: emoji.animated,
                  id: emoji.id ?? undefined,
                  name: emoji.name ?? undefined,
                }
              : undefined,
          })
            .setCustomId(
              `a_delete-reaction-role_${cell.messageId}:${cell.reaction}` satisfies AutoComponentCustomId,
            )
            .setStyle(ButtonStyle.Secondary)
            .setLabel(role?.name ?? "Unknown Role");
        }),
      ),
    ),
    ephemeral: true,
  });
};

export const deleteReactionRoleButtonCallback: ButtonCallback = async (ctx) => {
  const { messageId, reaction } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "reaction",
  );

  const db = getDb(ctx.env.HYPERDRIVE);
  const deleted = (
    await db
      .delete(discordReactionRoles)
      .where(
        and(
          eq(discordReactionRoles.messageId, makeSnowflake(messageId)),
          eq(discordReactionRoles.reaction, reaction),
        ),
      )
      .returning({
        channelId: discordReactionRoles.channelId,
      })
  )[0];
  try {
    await ctx.env.KV.delete(`discord-reaction-role-${messageId}-${reaction}`);
  } catch {}

  if (deleted) {
    try {
      await ctx.rest.delete(
        Routes.channelMessageOwnReaction(
          String(deleted.channelId),
          messageId,
          encodeURIComponent(
            isSnowflakeSafe(reaction) ? `_:${reaction}` : reaction,
          ),
        ),
      );
    } catch {}
  }

  // Remove the button that was just clicked
  // biome-ignore lint/style/noNonNullAssertion: We're in a component callback for this message
  const components = ctx.interaction.message
    .components!.map((row) => ({
      ...row,
      components: row.components.filter((c) =>
        "custom_id" in c
          ? c.custom_id !== ctx.interaction.data.custom_id
          : true,
      ),
    }))
    .filter((row) => row.components.length !== 0);

  return ctx.updateMessage({ components });
};

export const listReactionRolesHandler: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only command");

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

  const db = getDb(ctx.env.HYPERDRIVE);
  const entries = await db.query.discordReactionRoles.findMany({
    where: eq(discordReactionRoles.messageId, makeSnowflake(message.id)),
  });

  if (entries.length === 0) {
    return ctx.reply({
      content: "This message has no reaction roles registered.",
      ephemeral: true,
    });
  }

  return ctx.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(
          `Reaction roles on ${messageLink(
            message.channel_id,
            message.id,
            guildId,
          )}`,
        )
        .setColor(color)
        .setDescription(
          entries
            .slice(0, 25)
            .map((entry) => {
              const emoji = isSnowflakeSafe(entry.reaction)
                ? `<:_:${entry.reaction}>`
                : entry.reaction;
              return `- ${emoji} - <@&${entry.roleId}>`;
            })
            .join("\n"),
        ),
    ],
    ephemeral: true,
  });
};
