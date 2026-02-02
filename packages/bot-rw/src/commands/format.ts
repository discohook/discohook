import { EmbedBuilder } from "@discordjs/builders";
import dedent from "dedent-js";
import {
  type APIChatInputApplicationCommandInteraction,
  type APIPartialEmoji,
  type APIRole,
  FormattingPatterns,
} from "discord-api-types/v10";
import type { InteractionContext } from "../interactions.js";
import { color } from "../util/meta.js";
import type { ChatInputAppCommandCallback } from "./handler.js";

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

  return embed;
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
  await ctx.reply({
    embeds: [
      getMentionEmbed(
        result,
        "Mention",
        isRole(target) && !target.mentionable
          ? "This role is not mentionable by @everyone, so a mention may not deliver as intended."
          : "Mentions will only deliver to users when they are in the **Content** section, not an embed.",
      ),
    ],
    ephemeral: true,
  });
};

export const formatChannelCallback: ChatInputAppCommandCallback = async (
  ctx,
) => {
  // biome-ignore lint/style/noNonNullAssertion: Required option
  const target = ctx.getChannelOption("target")!;
  await ctx.reply({
    embeds: [getMentionEmbed(`<#${target.id}>`, "Channel")],
    ephemeral: true,
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
  if (match?.groups) {
    return {
      id: match.groups.id,
      name: match.groups.name,
      animated: Boolean(match.groups.animated),
    } as APIPartialEmoji;
  }

  const { nameToEmoji, emojiToName } = await ctx.client.fetchEmojis();
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
    await ctx.reply({
      content: "No emoji was found.",
      ephemeral: true,
    });
    return;
  }

  const formatting =
    typeof emoji === "object"
      ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
      : emoji;

  await ctx.reply({
    embeds: [getMentionEmbed(formatting, "Emoji")],
    ephemeral: true,
  });
};
