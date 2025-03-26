import type { QueryData } from "store";

const isValidImageUrl = (url: string | undefined): url is string => {
  if (url) {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  return false;
};

export const findMessagesPreviewImageUrl = (
  messages: QueryData["messages"],
) => {
  // Work out the optimal preview image (for the /me page). Order of priority
  // is messages[0].embeds[0] thumbnail, image, author, footer, then embeds[1],
  // then messages[1], ...
  let previewImageUrl: string | null = null;
  for (const message of messages) {
    const candidates = {
      thumbnail: [] as string[],
      image: [] as string[],
      author: [] as string[],
      footer: [] as string[],
    };
    for (const embed of message.data.embeds ?? []) {
      if (isValidImageUrl(embed.thumbnail?.url))
        candidates.thumbnail.push(embed.thumbnail.url);
      if (isValidImageUrl(embed.image?.url))
        candidates.image.push(embed.image.url);
      if (isValidImageUrl(embed.author?.icon_url))
        candidates.author.push(embed.author.icon_url);
      if (isValidImageUrl(embed.footer?.icon_url))
        candidates.footer.push(embed.footer.icon_url);
    }
    previewImageUrl =
      candidates.thumbnail[0] ??
      candidates.image[0] ??
      candidates.author[0] ??
      candidates.footer[0];
    if (previewImageUrl) break;
  }
  return previewImageUrl;
};
