import { ChatInputAppCommandCallback } from "../../commands.js";

export const addButtonCallback: ChatInputAppCommandCallback = async (ctx) => {
  return ctx.reply("test");
}
