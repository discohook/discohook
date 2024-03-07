import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { LinkQueryData, QueryData } from "~/types/QueryData";

export const WEBHOOK_URL_RE =
  /^https?:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)$/;

export const MESSAGE_REF_RE =
  /^(?:https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/)?(\d+)$/;

export const INDEX_MESSAGE: QueryData["messages"][number] = {
  data: {
    content: "Hello, welcome to Discohook!",
    embeds: [{}],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: "Donate to Discohook",
            url: "http://localhost:8788/donate",
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
    title: "Welcome to Discohook!",
  },
};

export const LINK_INDEX_FAILURE_EMBED: LinkQueryData["embed"] = {
  data: {
    description: INDEX_FAILURE_MESSAGE.data.content ?? undefined,
  },
};
