import type { APIEmbed } from "discord-api-types/v10";
import { color } from "../util/meta.js";
import type {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "./handler.js";

type HelpTags = Record<string, APIEmbed | string>;

const fetchTags = async () => {
  const response = await fetch(`${Bun.env.DISCOHOOK_ORIGIN}/help/en.json`, {
    method: "GET",
  });
  return (await response.json()) as HelpTags;
};

const findEmbed = (
  tags: HelpTags,
  tag: string,
): [string, APIEmbed | undefined] => {
  const cur = tags[tag];
  if (typeof cur === "string") {
    return findEmbed(tags, cur);
  } else {
    return [tag, cur];
  }
};

export const helpEntry: ChatInputAppCommandCallback = async (ctx) => {
  const query = ctx.getStringOption("tag");
  const mentionUser = ctx.getUserOption("mention");

  const tags = await fetchTags();
  const [, embed] = findEmbed(tags, query.value);

  if (embed) {
    embed.color = embed.color ?? color;
    await ctx.reply({
      content: mentionUser ? `<@${mentionUser.id}>` : undefined,
      allowedMentions: mentionUser ? { users: [mentionUser.id] } : undefined,
      // These messages are ephemeral by default to reduce spam
      ephemeral: !mentionUser || mentionUser.bot,
      embeds: [embed],
    });
    return;
  }

  const entries = Object.entries(tags)
    .filter((v) => typeof v[1] !== "string")
    .map((v) => [v[0], v[1]] as [string, APIEmbed])
    .filter((v) => v[1].title === query.value.trim());

  if (entries.length !== 0) {
    const e = entries[0]?.[1];
    if (e) {
      e.color = e.color ?? color;
      await ctx.reply({
        embeds: [e],
        ephemeral: true,
      });
      return;
    }
  }

  await ctx.reply({
    content:
      "No tag found. Select an item from the autocomplete menu or use the exact title of a valid item.",
    ephemeral: true,
  });
};

export const helpAutocomplete: AppCommandAutocompleteCallback = async (ctx) => {
  const query = ctx.getStringOption("tag");

  const tags = await fetchTags();
  const [tag, embed] = findEmbed(tags, query.value);

  if (!embed) {
    const entries = Object.entries(tags)
      .filter((v) => typeof v[1] !== "string")
      .map((v) => [v[0], v[1]] as [string, APIEmbed])
      // Make this 'search' function better in the future
      .filter(
        (v) =>
          !!v[1].title &&
          v[1].title.toLowerCase().includes(query.value.toLowerCase().trim()),
      );

    return entries.map((entry) => ({
      // biome-ignore lint/style/noNonNullAssertion: Undefined titles filtered above
      name: entry[1].title!,
      value: entry[0],
    }));
  } else {
    return [
      {
        // biome-ignore lint/style/noNonNullAssertion: Undefined titles filtered above
        name: embed.title!,
        value: tag,
      },
    ];
  }
};
