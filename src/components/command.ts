import { AppCommandCallback } from "../commands.js";

export const addButtonCallback: AppCommandCallback = async (ctx) => {
  return ctx.reply("test");
}
