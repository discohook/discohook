import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { LinkQueryData, QueryData } from "~/types/QueryData";

export const WEBHOOK_URL_RE =
  /^https?:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)$/;

export const MESSAGE_REF_RE =
  /^(?:https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/)?(\d+)$/;

export const INDEX_MESSAGE: QueryData["messages"][number] = {
  data: {
    content: [
      "Hey, welcome to <:discohook:736648398081622016> **Discohook**! The easiest way to personalize your Discord server.",
      "",
      // "There's more info below, but you don't have to read it. If you're ready press **Clear All** in the top of the editor to get started.",
      // "",
      "_ _",
    ].join("\n"),
    embeds: [
      {
        title: "What is this?",
        description: [
          "At its core, Discohook is a simple message designer. You can use it to send fully customizable messages to your Discord server with the use of [webhooks](https://support.discord.com/hc/en-us/articles/228383668).",
        ].join("\n"),
        fields: [
          {
            name: "Discohook Utils - complementary bot",
            value:
              "You can [invite our bot here](https://discohook.app/bot). You may recognize this name - [Discohook was absorbed by Discohook Utils in 2024](https://discohook.app/migrate-utils). If you have Discobot in your server, invite Discohook Utils instead for all future use.",
          },
        ],
        color: 0x58b9ff,
      },
      {
        title: "Get started",
        description: [
          "- To send your first webhook message, click **Add Webhook** at the top left of the editor.",
          "\n",
          "- You'll be prompted to put in the URL of a ",
          "webhook you have already created, or make a new one on the spot with **Create Webhook**.",
          "\n",
          " - If you create a new webhook with this button, ",
          "you'll be able to add buttons to your message as well.",
          "\n",
          "- Finish up by clicking **Add Webhook** inside the prompt.",
          "\n",
          " - You should now see your webhook name & avatar at the top of the editor. ",
          "If you would like to edit this webhook, click the pencil icon.",
          "\n",
          "- Now click **Send**. Choose which messages you would like to send with your webhook ",
          "(they are all enabled by default).",
        ].join(""),
        color: 0x58b9ff,
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: "Support Server",
            url: "https://discohook.app/discord",
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: "Invite Bot",
            url: "https://discohook.app/bot",
          },
        ],
      },
    ],
  },
};

export const INDEX_FAILURE_MESSAGE: QueryData["messages"][number] = {
  data: {
    content:
      "The data you loaded this page with was invalid. If you're a developer, [check out the schema](https://github.com/shayypy/discohook/blob/master/app/types/QueryData.ts). If you need help, [join the support server](/discord).",
  },
};

export const LINK_INDEX_EMBED: LinkQueryData["embed"] = {
  data: {
    provider: {
      name: "For Deluxe Eyes Only",
      url: "https://discohook.app/donate",
    },
    title: "Where am I?",
    description: [
      "Welcome to the super special <:discohook:736648398081622016> **Discohook** link embed editor! [Deluxe members](https://discohook.app/donate) are able to leverage this page to create beautiful embeds that they can use anywhere on Discord. These embeds can even include videos!",
      "",
      "To save your embed and get posting, type a name in the box on the left, then click **Save**. Copy your link with **Copy Link**."
    ].join("\n"),
    // TODO tutorial video on how to use this editor
    video: {
      url: "https://youtube.com/embed/dQw4w9WgXcQ",
    },
    color: 0x58b9ff,
  },
};

export const LINK_INDEX_FAILURE_EMBED: LinkQueryData["embed"] = {
  data: {
    description: INDEX_FAILURE_MESSAGE.data.content ?? undefined,
  },
};
