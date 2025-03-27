import type { APIEmbed, APIEmbedImage } from "discord-api-types/v10";
import type { z } from "zod";
import type { LinkQueryData, QueryData, ZodLinkEmbed } from "~/types/QueryData";
import { randomString } from "./text";

export interface DraftFile {
  id: string;
  file: File;
  description?: string;
  url?: string;
  embed?: boolean;
  is_thumbnail?: boolean;
}

export interface HistoryItem {
  id: string;
  createdAt: Date;
  data: QueryData;
}

export const safePushState = (data: any, url?: string | URL | null): void => {
  // Avoid redundant call. This ignores `data` but we aren't using it for non-`url` state right now
  if (url && url === location.href) return;
  try {
    history.pushState(data, "", url);
  } catch (e) {
    if (e instanceof DOMException) {
      // We were getting errors about insecurity when inputting too quickly
      // despite only dealing with the same origin, so we just ignore
      // these and skip the state push.
      return;
    }
    console.log(e);
  }
};

export const getQdMessageId = (message: QueryData["messages"][number]) => {
  // Technically not a unique prop right now
  // if (message.reference) {
  //   const match = message.reference.match(MESSAGE_REF_RE);
  //   if (match) return match[3];
  // }
  if (message._id) return message._id;
  const id = randomString(10);
  message._id = id;
  return id;
};

// Link embeds

export interface LinkHistoryItem {
  id: string;
  createdAt: Date;
  data: LinkQueryData;
}

export const linkEmbedUrl = (code: string, linkOrigin?: string) => {
  if (linkOrigin) {
    return `${linkOrigin}/${code}`;
  }
  try {
    return `${origin}/link/${code}`;
  } catch {
    return `/link/${code}`;
  }
};

export const linkEmbedToAPIEmbed = (
  data: z.infer<typeof ZodLinkEmbed>,
  code?: string,
  linkOrigin?: string,
): { embed: APIEmbed; extraImages: APIEmbedImage[] } => {
  const embed: APIEmbed = {
    title: data.title,
    url: code ? linkEmbedUrl(code, linkOrigin) : "#",
    provider: data.provider,
    author: data.author,
    description: data.description,
    color: data.color,
    video: data.video,
  };
  const extraImages: APIEmbedImage[] = [];

  if (data.images && data.images.length > 0) {
    if (data.large_images) {
      embed.image = data.images[0];
      extraImages.push(...data.images.slice(1));
    } else {
      embed.thumbnail = data.images[0];
    }
  }

  return { embed, extraImages };
};
