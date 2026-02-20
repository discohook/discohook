import { parseEmojiOption } from "./format.js";
import type { ChatInputAppCommandCallback } from "./handler.js";

export const idMentionCallback: ChatInputAppCommandCallback = async (ctx) => {
  // biome-ignore lint/style/noNonNullAssertion: Required option
  const target = ctx.getMentionableOption("target")!;
  await ctx.reply({
    content:
      "color" in target
        ? target.id
        : "user" in target
          ? target.user.id
          : target.id,
    ephemeral: true,
  });
};

export const idChannelCallback: ChatInputAppCommandCallback = async (ctx) => {
  // biome-ignore lint/style/noNonNullAssertion: Required option
  const target = ctx.getChannelOption("target")!;
  await ctx.reply({
    content: target.id,
    ephemeral: true,
  });
};

export const idEmojiCallback: ChatInputAppCommandCallback = async (ctx) => {
  const emoji = await parseEmojiOption(ctx, "target");
  if (!emoji) {
    await ctx.reply({
      content: "No emoji was found.",
      ephemeral: true,
    });
    return;
  }

  await ctx.reply({
    content:
      typeof emoji === "object" ? (emoji.id ?? ctx.t("idUnavailable")) : emoji,
    ephemeral: true,
  });
};
