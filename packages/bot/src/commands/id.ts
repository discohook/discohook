import { t } from "i18next";
import { ChatInputAppCommandCallback } from "../commands.js";
import { parseEmojiOption } from "./format.js";

export const idMentionCallback: ChatInputAppCommandCallback = async (ctx) => {
  // biome-ignore lint/style/noNonNullAssertion: Required option
  const target = ctx.getMentionableOption("target")!;
  return ctx.reply({
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
  return ctx.reply({
    content: target.id,
    ephemeral: true,
  });
};

export const idEmojiCallback: ChatInputAppCommandCallback = async (ctx) => {
  const emoji = await parseEmojiOption(ctx, "target");
  if (!emoji) {
    return ctx.reply({
      content: "No emoji was found.",
      ephemeral: true,
    });
  }

  return ctx.reply({
    content: typeof emoji === "object" ? emoji.id ?? t("idUnavailable") : emoji,
    ephemeral: true,
  });
};
