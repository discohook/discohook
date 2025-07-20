import { getDb, upsertDiscordUser } from "store";
import type { ChatInputAppCommandCallback } from "../commands.js";

const CODE_RE = /^\d{8}$/;

interface LinkCodeData {
  expires: number;
}

// I'm not sure about this since it opens the possibility for users to give
// login codes to people who aren't themselves. I think I'll leave it unused
// for now. Site part of this functionality doesn't exist yet.

export const accountLinkHandler: ChatInputAppCommandCallback = async (ctx) => {
  const code = ctx.getStringOption("code").value;
  if (!CODE_RE.test(code)) {
    return ctx.reply({ content: "Not a valid login code.", ephemeral: true });
  }

  const extant = await ctx.env.KV.get<LinkCodeData>(
    `link-code-${code}`,
    "json",
  );
  if (!extant || Date.now() > extant.expires) {
    return ctx.reply({
      content: "This code does not exist or it has expired.",
      ephemeral: true,
    });
  }

  return [
    ctx.defer({ ephemeral: true }),
    async () => {
      const db = getDb(ctx.env.HYPERDRIVE);
      const user = await upsertDiscordUser(db, ctx.user);

      extant.expires += 60_000;
      await ctx.env.KV.put(
        `link-code-${code}`,
        JSON.stringify({
          ...extant,
          user,
        }),
        { expiration: extant.expires / 1000 },
      );
    },
  ];
};
