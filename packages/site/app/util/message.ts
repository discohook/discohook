import { getEmbedText } from "~/components/editor/EmbedEditor";
import type { QueryData } from "~/types/QueryData";

export const getMessageText = (
  message: QueryData["messages"][number]["data"],
): string | undefined =>
  message.content ??
  (message.embeds
    ? message.embeds.map(getEmbedText).find((t) => !!t)
    : undefined);
