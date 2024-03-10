import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  messageLink,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import dedent from "dedent-js";
import {
  APIEmoji,
  APIGuild,
  APIGuildMember,
  APIMessage,
  APIPartialEmoji,
  ButtonStyle,
  MessageFlags,
  RESTGetAPIGuildEmojisResult,
  Routes,
} from "discord-api-types/v10";
import { isSnowflake } from "discord-snowflake";
import { and, eq } from "drizzle-orm";
import { getDb, upsertGuild } from "store";
import { discordReactionRoles, makeSnowflake } from "store/src/schema";
import {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "../commands.js";
import { AutoComponentCustomId, ButtonCallback } from "../components.js";
import { parseAutoComponentId } from "../util/components.js";
import { color } from "../util/meta.js";
import {
  autocompleteMessageCallback,
  resolveMessageLink,
} from "./components/entry.js";

export const isSnowflakeSafe = (id: string): id is `${bigint}` => {
  try {
    return isSnowflake(id);
  } catch {
    return false;
  }
};

export const resolveEmoji = async (
  rest: REST,
  value: string,
  message: APIMessage,
  guildId: string,
  discohookOrigin: string,
) => {
  const val = value.replace(/^:|:$/g, "");
  const messageReaction = message.reactions?.find((r) =>
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
    // I don't really like this, TODO
    try {
      const emojis = (await (
        await fetch(`${discohookOrigin}/emoji.json`, {
          method: "GET",
        })
      ).json()) as (string[] | [string, number])[];
      const match = emojis.find(
        (e): e is string[] =>
          typeof e[1] !== "number" && e.includes(val.toLowerCase()),
      );
      if (match) {
        emoji = {
          id: null,
          name: match[0],
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
        expirationTtl: 300,
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

export const createReactionRoleHandler: ChatInputAppCommandCallback = async (
  ctx,
) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only command");
  const guild = (await ctx.rest.get(Routes.guild(guildId))) as APIGuild;

  // biome-ignore lint/style/noNonNullAssertion: Required option
  const role = ctx.getRoleOption("role")!;
  const me = (await ctx.rest.get(
    Routes.guildMember(guildId, ctx.env.DISCORD_APPLICATION_ID),
  )) as APIGuildMember;
  const highestRole = guild.roles.find((r) => r.id === me.roles[0]);
  if (!highestRole && guild.owner_id !== ctx.env.DISCORD_APPLICATION_ID) {
    // You could be running an instance of this bot where
    // the bot is the owner of the guild
    return ctx.reply({
      content: `I can't assign <@&${role.id}> to members because I don't have any roles.`,
      flags: MessageFlags.Ephemeral,
    });
  } else if (highestRole && role.position >= highestRole.position) {
    return ctx.reply({
      content: `<@&${role.id}> is higher than my highest role (<@&${highestRole.id}>), so I can't assign it to members. <@&${role.id}> needs to be lower in the role list, or my highest role needs to be higher.`,
      flags: MessageFlags.Ephemeral,
    });
  }

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

  const emoji = await resolveEmoji(
    ctx.rest,
    ctx.getStringOption("emoji").value,
    message,
    guildId,
    ctx.env.DISCOHOOK_ORIGIN,
  );
  if (!emoji) {
    return ctx.reply({
      content:
        "The emoji you specified couldn't be found. For best results, react to the message with the desired emoji before running this command.",
      flags: MessageFlags.Ephemeral,
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
      flags: MessageFlags.Ephemeral,
    });
  }

  await ctx.env.KV.put(
    `discord-reaction-role-${message.id}-${reaction}`,
    JSON.stringify({ roleId: role.id }),
    { expirationTtl: 604800 },
  );
  const db = getDb(ctx.env.DATABASE_URL);
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
              - <@${ctx.interaction.application_id}>'s highest role is lower than <@&${role.id}> in the role list
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
        )
        .toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
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
  );
  if (typeof message === "string") {
    return ctx.reply({
      content: message,
      flags: MessageFlags.Ephemeral,
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
      ctx.env.DISCOHOOK_ORIGIN,
    );
    if (!emoji) {
      return ctx.reply({
        content:
          "The emoji you specified couldn't be found. For best results, react to the message with the desired emoji before running this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // biome-ignore lint/style/noNonNullAssertion: Must have at least one
    const reaction = (emoji.id ?? emoji.name)!;

    const db = getDb(ctx.env.DATABASE_URL);
    const deleted = (
      await db
        .delete(discordReactionRoles)
        .where(
          and(
            eq(discordReactionRoles.messageId, message.id),
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
                `)
                .toJSON(),
            ],
          }
        : {
            content:
              "There was not a registered reaction role on that message for that emoji.",
          }),
      flags: MessageFlags.Ephemeral,
    });
  }

  const db = getDb(ctx.env.DATABASE_URL);
  const entries = await db.query.discordReactionRoles.findMany({
    where: eq(discordReactionRoles.messageId, message.id),
  });

  if (entries.length === 0) {
    return ctx.reply({
      content: "This message has no reaction roles registered.",
      flags: MessageFlags.Ephemeral,
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
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
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
        )
        .toJSON(),
    ),
    flags: MessageFlags.Ephemeral,
  });
};

export const deleteReactionRoleButtonCallback: ButtonCallback = async (ctx) => {
  const { messageId, reaction } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "reaction",
  );

  const db = getDb(ctx.env.DATABASE_URL);
  const deleted = (
    await db
      .delete(discordReactionRoles)
      .where(
        and(
          eq(discordReactionRoles.messageId, messageId),
          eq(discordReactionRoles.reaction, reaction),
        ),
      )
      .returning({
        channelId: discordReactionRoles.channelId,
      })
  )[0];

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
