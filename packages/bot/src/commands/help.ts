import { APIEmbed, MessageFlags } from "discord-api-types/v10";
import {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "../commands.js";
import { color } from "../util/meta.js";

const tags: Record<string, string | APIEmbed> = {
  send: {
    title: "How do I send messages?",
    description:
      "To send a message, you must first obtain a Webhook URL. You can get one using the [Discohook bot](https://discohook.app/bot) with the **/webhook create** command, or you can create one manually in the channel settings.\n\nOnce you have copied the Webhook URL you can paste it at the top of Discohook's editor, and press the **Send** button to have it appear in your server!",
  },
  edit: {
    title: "How do I edit messages?",
    description:
      "To edit a message, there's a good chance you want the original message. You can get the message by with a right click or long press on the message, then opening the Apps menu and selecting **Restore to Discohook**. The bot will reply with a link, which when opened will have the Discord message opened right up in the Discohook editor!\n\nTo edit an existing message you must have two things: the Webhook URL and the Message Link. The webhook URL can be obtained using the **/webhook info** command. The message link can be obtained by right clicking or long pressing the message, and selecting **Copy Message Link**.\n\nPaste the Message Link at the very bottom of the editor, then paste the Webhook URL at the very top. If everything is done correctly, the Send button will be replaced with an **Edit** button.",
  },
  mention: {
    title: "How do I mention a member or role?",
    description:
      "To mention a user or role, invite the Discohook bot at https://discohook.app/bot and use the **/format mention** command. Point it to any member or role and it will respond with the appropriate code for a mention!\n\nKeep in mind that mentions don't ping in embeds, if you want a mention to ping you must use the Content field.",
  },
  ping: "mention",
  user: "mention",
  member: "mention",
  role: "mention",
  channel: {
    title: "How do I tag a channel or thread?",
    description:
      "To mention a channel or thread, invite the Discohook bot at https://discohook.app/bot and use the **/format channel** command. Point it to any channel and it will respond with the appropriate code to tag it!",
  },
  emoji: {
    title: "How do I use an emoji?",
    description:
      "To use a server emoji, invite the Discohook bot at https://discohook.app/bot and use the **/format emoji** command.\n\nDefault emojis that are included with Discord don't need any special formatting, for example :heart\\: will automatically turn into the heart emoji. :heart:",
  },
  emote: "emoji",
  link: {
    title: "How do I create links?",
    description:
      "To create a hyperlink within Discohook, you must use the following markdown syntax: `[text](url)`. As an example `[Discohook](https://discohook.app)` turns into [Discohook](https://discohook.app)!\n\nIf it's not showing up properly, make sure there is not a space between the [text] and (url) parts, as Discord won't understand that.",
  },
  hyperlink: "link",
  "reaction role": {
    title: "How can I make reaction roles?",
    description:
      "To create a reaction role, invite the Discohook bot at https://discohook.app/bot use the **/reaction-role create** command.\n\nIt expects you put in a message link to the message you want the reaction role on, the emoji you want to use, and the role you want it to give.\n\nOnce the command is run, the reaction role should be functioning, though you may have issues with permissions. To make sure reaction roles work in your server you can verify the setup using **/reaction-role verify**.",
  },
  rr: "reaction role",
  markdown: {
    title: "How do I use markdown?",
    description:
      "[Expanded version (PDF)](https://assets.discohook.app/discord_md_cheatsheet.pdf)",
    image: { url: "https://assets.discohook.app/discord_md_cheatsheet.png" },
  },
  formatting: "markdown",
  gray: {
    title: "I gave the website my Webhook URL, but I can't click send.",
    description:
      'If the send button is gray, it means your browser wasn\'t able to connect to Discord.\nIf you clicked a link or button to Discohook that included a webhook URL, try removing the webhook URL from the box and pasting it back in. If you manually pasted the webhook URL and the button is still gray, try restarting your browser, using private ("incognito") mode, or disabling extensions like Privacy Badger or DuckDuckGo that may be blocking Discohook from connecting to Discord.',
  },
  grey: "gray",
  "gray send": "gray",
  "grey send": "gray",
  image: {
    title: "My images don't load properly.",
    description:
      "Make sure the URL you used for the image is a proper image URL. It may have happened that you copied a link to a webpage that contains the image, instead of the image itself.\n\nTo make sure images load reliably, upload the images to a private Discord channel. Then copy the image link from Discord and paste it in Discohook. If done properly the image should appear in Discohook's preview and send to Discord without issues.",
  },
  buttons: {
    title: "How do I add buttons to my messages/embeds?",
    description:
      'Use the `/buttons` command or the "Add Button" message command to add buttons to your messages. Messages must be sent by a webhook that Discohook Utils#4333 created in order for this to work. To get a webhook created by Discohook Utils#4333, use `/webhook create`.\n\n[Here\'s an example of the "Add Button" message command](https://www.youtube.com/watch?v=tGQsZaIGr2A&list=PL2lbsZZaSX2heZ_bGhkJ3WJHm9PijiXWv)',
  },
  sidebar: {
    title: "How do I remove the sidebar color on an embed?",
    description:
      'Set the "Color" option to #2f3136 in the body section. For light mode, use #f2f3f5.',
    color: 3092790,
    image: {
      url: "https://dutils.shay.cat/static/help/sidebar.png",
    },
  },
};

const findEmbed = (tag: string): [string, APIEmbed | undefined] => {
  const cur = tags[tag];
  if (typeof cur === "string") {
    return findEmbed(cur);
  } else {
    return [tag, cur];
  }
};

export const helpEntry: ChatInputAppCommandCallback = async (ctx) => {
  const query = ctx.getStringOption("tag");
  const [, embed] = findEmbed(query.value);

  if (embed) {
    embed.color = embed.color ?? color;
    return ctx.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }

  const entries = Object.entries(tags)
    .filter((v) => typeof v[1] !== "string")
    .map((v) => [v[0], v[1]] as [string, APIEmbed])
    .filter((v) => v[1].title === query.value.trim());

  if (entries.length !== 0) {
    const e = entries[0][1];
    e.color = e.color ?? color;
    return ctx.reply({
      embeds: [e],
      flags: MessageFlags.Ephemeral,
    });
  }

  return ctx.reply({
    content:
      "No tag found. Select an item from the autocomplete menu or use the exact title of a valid item.",
    flags: MessageFlags.Ephemeral,
  });
};

export const helpAutocomplete: AppCommandAutocompleteCallback = async (ctx) => {
  const query = ctx.getStringOption("tag");
  const [tag, embed] = findEmbed(query.value);

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
