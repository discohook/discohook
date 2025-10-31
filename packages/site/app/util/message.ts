import type { APIMessage } from "discord-api-types/v10";
import type { TFunction } from "i18next";
import { getEmbedText } from "~/components/editor/EmbedEditor";
import { getComponentText } from "~/components/editor/TopLevelComponentEditor";
import type { QueryData } from "~/types/QueryData";

export const getMessageText = (
  message: QueryData["messages"][number]["data"],
): string | undefined =>
  message.content ??
  (message.embeds
    ? message.embeds.map(getEmbedText).find((t) => !!t)
    : undefined) ??
  (message.components
    ? message.components.map(getComponentText).find((t) => !!t)
    : undefined);

export const getMessageDisplayName = (
  t: TFunction,
  index: number,
  message: Pick<QueryData["messages"][number], "name" | "data">,
): string => {
  const previewText = getMessageText(message.data);
  return (
    message.name ??
    t(previewText ? "messageNText" : "messageN", {
      replace: { n: index + 1, text: previewText },
    })
  );
};

// There is currently a bug where `position` is missing in forum thread
// messages when its value would be 0, leading this function to return
// false negatives.
// https://github.com/discord/discord-api-docs/issues/7788
export const isThreadMessage = (
  message: Pick<APIMessage, "id" | "channel_id" | "position">,
) =>
  // `position` should only be present for thread messages.
  // If this breaks, reopen this:
  // https://github.com/discord/discord-api-docs/issues/7570
  message.position !== undefined ||
  // starter messages may be missing a position but still share an ID with
  // their parent
  message.id === message.channel_id;

export const getWebhookThreadQuery = (
  message: Pick<APIMessage, "id" | "channel_id" | "position">,
) => {
  const params = new URLSearchParams();
  if (isThreadMessage(message)) {
    params.set("thread_id", message.channel_id);
  }
  return params;
};
