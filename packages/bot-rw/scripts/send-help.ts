import { EmbedBuilder, messageLink } from "@discordjs/builders";
import {
  type APIEmbed,
  type APIMessage,
  type APIPublicThreadChannel,
  type APIWebhook,
  ChannelsAPI,
  RESTJSONErrorCodes,
  WebhooksAPI,
  WebhookType,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { ArgumentParser } from "argparse";
import { fetchTags } from "../src/commands/help";
import { isDiscordError } from "../src/util/error";
import { color } from "../src/util/meta";

const titleOverride: Record<string, string> = {
  buttons: "Add buttons to messages/embeds",
  blocked: "My request to Discord was blocked",
  schedule: "Schedule a message",
};

const argparser = new ArgumentParser();
argparser.add_argument("--thread", {
  help: "help channel forum thread ID",
  required: true,
});

const threadId = argparser.parse_args().thread as string;

const tags = await fetchTags();

const rest = new REST().setToken(Bun.env.DISCORD_TOKEN);

const channels = new ChannelsAPI(rest);
const allMessages = await channels.getMessages(threadId, {
  after: threadId,
  limit: 100,
});
console.log(allMessages.length);
const webhooks = new WebhooksAPI(rest);

const firstWebhookId = allMessages[0]?.webhook_id;
let webhook: APIWebhook | undefined;
if (!firstWebhookId || allMessages.length === 0) {
  const channel = (await channels.get(threadId)) as APIPublicThreadChannel;
  if (!channel.parent_id) {
    throw Error(`Missing parent ID for thread ID ${threadId}`);
  }
  const channelWebhooks = await channels.getWebhooks(channel.parent_id);
  webhook = channelWebhooks.find(
    (w) =>
      w.application_id === Bun.env.DISCORD_APPLICATION_ID ||
      (!w.application_id && w.type === WebhookType.Incoming),
  );
} else {
  webhook = await webhooks.get(firstWebhookId);
}
if (!webhook) {
  throw Error("Could not resolve webhook. Maybe you need to create a new one.");
}
const { token } = webhook;
if (!token) {
  throw Error("Could not resolve webhook token.");
}

// compile extant
const overlap: Record<string, APIMessage> = {};
for (const message of allMessages) {
  if (
    !message.webhook_id ||
    (message.application_id &&
      message.application_id !== Bun.env.DISCORD_APPLICATION_ID) ||
    message.embeds.length === 0
  ) {
    continue;
  }

  const embed = message.embeds[0];
  if (!embed?.footer?.text) continue;

  const id = embed.footer.text.split(",")[0]?.replace(/^#/, "");
  if (id && tags[id]) {
    overlap[id] = message;
  }
}
console.log(overlap);

// send or edit the tag messages
const tagsToId: Record<string, string> = {};
for (const [tag, embed] of Object.entries(tags)) {
  if (typeof embed === "string") continue;

  embed.color = embed.color ?? color;
  const newEmbed = new EmbedBuilder(embed);
  const aliases = Object.entries(tags)
    .filter((t) => t[1] === tag)
    .map((t) => t[0]);
  newEmbed.setFooter({
    text: [tag, ...aliases].map((t) => `#${t}`).join(", "),
  });

  const overlapping = overlap[tag];
  if (overlapping) {
    try {
      const message = await webhooks.editMessage(
        webhook.id,
        token,
        overlapping.id,
        {
          embeds: [newEmbed.toJSON()],
          thread_id: threadId,
        },
      );
      tagsToId[tag] = message.id;
    } catch (e) {
      // this shouldn't happen
      if (isDiscordError(e) && e.code === RESTJSONErrorCodes.UnknownMessage) {
        const message = await webhooks.execute(webhook.id, token, {
          embeds: [newEmbed.toJSON()],
          thread_id: threadId,
          wait: true,
        });
        tagsToId[tag] = message.id;
      } else {
        throw e;
      }
    }
  } else {
    const message = await webhooks.execute(webhook.id, token, {
      embeds: [newEmbed.toJSON()],
      thread_id: threadId,
      wait: true,
    });
    tagsToId[tag] = message.id;
  }
}

// update starter message
const embed = new EmbedBuilder().setColor(color);

const getKeyLinkItem = (key: string) => {
  let title: string;
  if (titleOverride[key]) {
    title = titleOverride[key];
  } else {
    title = (tags[key] as APIEmbed)?.title ?? key;
    if (title.toLowerCase().startsWith("how do i")) {
      title = title
        .replace(/^how do i/i, "")
        .replace(/\?$/, "")
        .trim();
      title = title.slice(0, 1).toUpperCase() + title.slice(1);
    }
    title = title.replace(/\.$/, "");
  }

  const messageId = tagsToId[key];
  if (messageId) {
    return `- [${title}](${messageLink(
      threadId,
      messageId,
      // biome-ignore lint/style/noNonNullAssertion: we're in a guild
      webhook.guild_id!,
    )})\n`;
  }
  return "";
};

embed.setDescription(
  // This one is too long to fit in a field
  `**How-to basics**\n${[
    "send",
    "edit",
    "sidebar",
    "mention",
    "link",
    "buttons",
    "reaction role",
    "schedule",
    "welcomer",
    "profile",
  ]
    .map(getKeyLinkItem)
    .join("")
    .trim()}`,
);

const otherCategories = {
  Troubleshooting: ["blocked", "ise", "nothing", "image"],
};
for (const [category, keys] of Object.entries(otherCategories)) {
  embed.addFields({
    name: category,
    value: keys.map(getKeyLinkItem).join("").trim(),
    inline: false,
  });
}

embed.addFields({
  name: "Something else",
  value:
    "If you can't find your answer here, try using the search feature or creating a new post in <#1234648356307996712>. Keep in mind you may not get your answer immediately, please be patient as we aren't available all day.",
});

await webhooks.editMessage(webhook.id, token, threadId, {
  content:
    "Welcome to Discohook's help channel! This channel contains the answers to many common questions and is able to solve some frequently occurring issues.",
  embeds: [embed.toJSON()],
  thread_id: threadId,
});
