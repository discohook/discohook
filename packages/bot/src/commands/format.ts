import { EmbedBuilder } from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIChatInputApplicationCommandInteraction,
  APIPartialEmoji,
  APIRole,
  FormattingPatterns,
  MessageFlags,
} from "discord-api-types/v10";
import { ChatInputAppCommandCallback } from "../commands.js";
import { InteractionContext } from "../interactions.js";
import { color } from "../util/meta.js";
import { fetchEmojiData, resolveEmojiData } from "./emojis.js";

const getMentionEmbed = (result: string, title: string, warning?: string) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(
      dedent`
      Copy the markdown into Discohook and it will show up on the right panel.
      If it appears as plain text, chances are you pasted it in a section that
      doesn't support rich markdown.
    `.replace(/\n/g, " "),
    )
    .addFields(
      {
        name: "Markdown",
        value: `\`${result}\``.slice(0, 4096),
        inline: true,
      },
      {
        name: "Output",
        value: result,
        inline: true,
      },
    );
  if (warning) {
    embed.addFields({ name: "Warning", value: warning, inline: true });
  }

  return embed.toJSON();
};

export const formatMentionCallback: ChatInputAppCommandCallback = async (
  ctx,
) => {
  // biome-ignore lint/style/noNonNullAssertion: Required option
  const target = ctx.getMentionableOption("target")!;
  const isRole = (r: typeof target): r is APIRole => "color" in target;
  const result =
    "user" in target
      ? `<@${target.user.id}>`
      : isRole(target)
        ? `<@&${target.id}>`
        : `<@${target.id}>`;
  return ctx.reply({
    embeds: [
      getMentionEmbed(
        result,
        "Mention",
        isRole(target) && !target.mentionable
          ? "This role is not mentionable by @everyone, so a mention may not deliver as intended."
          : "Mentions will only deliver to users when they are in the **Content** section, not an embed.",
      ),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const formatChannelCallback: ChatInputAppCommandCallback = async (
  ctx,
) => {
  // biome-ignore lint/style/noNonNullAssertion: Required option
  const target = ctx.getChannelOption("target")!;
  return ctx.reply({
    embeds: [getMentionEmbed(`<#${target.id}>`, "Channel")],
    flags: MessageFlags.Ephemeral,
  });
};

// Borrowed and modified from the legacy bot:
// https://github.com/discohook/bot/blob/7c5a03ed25ad6d699eef322048b2791e025ec416/src/lib/emojis/parseEmojiOption.ts
export const parseEmojiOption = async (
  ctx: InteractionContext<APIChatInputApplicationCommandInteraction>,
  emojiOptionName: string,
): Promise<string | APIPartialEmoji | undefined> => {
  const query = ctx.getStringOption(emojiOptionName).value;
  const safeQuery = query.replace(/[\W-+]*/g, "");

  const match = FormattingPatterns.Emoji.exec(query);
  if (match) {
    // biome-ignore lint/style/noNonNullAssertion:
    const groups = match.groups!;
    return {
      id: groups.id,
      name: groups.name,
      animated: Boolean(groups.animated),
    } as APIPartialEmoji;
  }

  const emojiData = await fetchEmojiData(ctx.env);
  const { nameToEmoji, emojiToName } = resolveEmojiData(emojiData);

  if (emojiToName.has(query)) {
    return query;
  }

  if (nameToEmoji.has(safeQuery)) {
    return nameToEmoji.get(safeQuery);
  }
};

export const formatEmojiCallback: ChatInputAppCommandCallback = async (ctx) => {
  const emoji = await parseEmojiOption(ctx, "target");
  if (!emoji) {
    return ctx.reply({
      content: "No emoji was found.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const formatting =
    typeof emoji === "object"
      ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
      : emoji;

  return ctx.reply({
    embeds: [getMentionEmbed(formatting, "Emoji")],
    flags: MessageFlags.Ephemeral,
  });
};
