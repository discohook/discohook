import { writeFile } from "node:fs/promises";

// This is kind of silly but this data is easier to maintain with
// types and formatting. Just requires an extra build step.

/** @type {Record<string, string | import('discord-api-types/v10').APIEmbed>} */
const data = {
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
  sidebar: {
    title: "How do I remove the sidebar color on an embed?",
    description:
      'In the "Sidebar Color" option, select one of the last two preset options depending on the theme you\'re using.',
  },
  // mention: {
  //   title: "How do I mention a member or role?",
  //   description:
  //     "To mention a user or role, invite the Discohook bot at https://discohook.app/bot and use the **/format mention** command. Point it to any member or role and it will respond with the appropriate code for a mention!\n\nKeep in mind that mentions don't ping in embeds, if you want a mention to ping you must use the Content field.",
  // },
  // ping: "mention",
  // user: "mention",
  // member: "mention",
  // role: "mention",
  // channel: {
  //   title: "How do I tag a channel or thread?",
  //   description:
  //     "To mention a channel or thread, invite the Discohook bot at https://discohook.app/bot and use the **/format channel** command. Point it to any channel and it will respond with the appropriate code to tag it!",
  // },
  // emoji: {
  //   title: "How do I use an emoji?",
  //   description:
  //     "To use a server emoji, invite the Discohook bot at https://discohook.app/bot and use the **/format emoji** command.\n\nDefault emojis that are included with Discord don't need any special formatting, for example :heart\\: will automatically turn into the heart emoji. :heart:",
  // },
  // emote: "emoji",
  link: {
    title: "How do I create links?",
    description:
      "To create a hyperlink, use the following markdown syntax: `[text](url)`. As an example `[Discohook](https://discohook.app)` turns into [Discohook](https://discohook.app)!\n\nIf it's not showing up properly, make sure there is not a space between the [text] and (url) parts, as Discord won't understand that.",
  },
  hyperlink: "link",
  // markdown: {
  //   title: "How do I use markdown?",
  //   description:
  //     "[Expanded version (PDF)](https://assets.discohook.app/discord_md_cheatsheet.pdf)",
  //   image: { url: "https://assets.discohook.app/discord_md_cheatsheet.png" },
  // },
  // formatting: "markdown",
  nothing: {
    title: "I set up my webhook, but clicking send does nothing.",
    description:
      'This is probably because your browser wasn\'t able to connect to Discord. Try restarting your browser, using private ("incognito") mode, or disabling extensions like Privacy Badger or DuckDuckGo that may be blocking Discohook from connecting to Discord.',
  },
  image: {
    title: "My images don't load properly.",
    description:
      "Make sure the URL you used for the image is a direct and non-expiring image URL. It may have happened that you copied a link to a webpage that contains the image, instead of the image itself. Discord attachment links also expire after some time, which may cause issues if you use mistakenly an expired one while editing.\n\nIf done properly, the image should appear in the preview and send to Discord without issues.",
  },
  buttons: {
    title: "How do I add buttons to my messages/embeds?",
    description:
      'Use the `/buttons` command or the "Buttons & Components" message command to add buttons to your messages. Messages must be sent by a webhook that this bot created in order for this to work. To get a webhook like this, use `/webhook create`.\n\n[Here\'s an example of the "Buttons & Components" message command](https://www.youtube.com/watch?v=tGQsZaIGr2A&list=PL2lbsZZaSX2heZ_bGhkJ3WJHm9PijiXWv)',
  },
  "reaction role": {
    title: "How do I make reaction roles?",
    description:
      "To create a reaction role, invite the Discohook bot at https://discohook.app/bot use the **/reaction-role create** command.\n\nIt expects you put in a message link to the message you want the reaction role on, the emoji you want to use, and the role you want it to give.\n\nOnce the command is run, the reaction role should be functioning, though you may have issues with permissions. To make sure reaction roles work in your server you can verify the setup using **/reaction-role verify**.",
    fields: [
      {
        name: "If you are currently using Discobot for this",
        value:
          "Invite the above bot instead so that your reaction roles continue working. Read more about this [here](https://discohook.app/migrate-utils).",
      },
    ],
  },
  rr: "reaction role",
  schedule: {
    title: "How do I schedule a message to be sent later?",
    description: [
      "- First, create a backup by clicking **Save Message** and then **Save Backup**.",
      "- Tap on your name in the page header to visit your user page.",
      '- Visit the "Backups" tab, then click the pencil icon on the backup you just created, which is named the current date by default.',
      "- Configure your schedule or repeating schedule in the menu that appears.",
      '- Click "Save"',
      "",
      'To remove a schedule, simply uncheck the "Schedule this backup" box, then save.',
    ].join("\n"),
  },
};

await writeFile(
  new URL("../public/help/en.json", import.meta.url).pathname,
  JSON.stringify(data),
);
