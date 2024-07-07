import { getEmbedText } from "~/components/editor/EmbedEditor";
import { QueryData } from "~/types/QueryData";

export const getMessageText = (
  message: QueryData["messages"][number]["data"],
): string | undefined =>
  message.content ??
  (message.embeds
    ? message.embeds.map(getEmbedText).find((t) => !!t)
    : undefined);

export const getBlobDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};
