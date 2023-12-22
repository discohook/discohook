import { CDN, ImageURLOptions } from "@discordjs/rest";
import { getUserDefaultAvatar } from "./user.js";
import { DiscordApiClient } from "discord-api-methods";

export const cdn = new CDN();

export const userAvatarUrl = (user: { id: string; avatar: string | null; discriminator: string }, options?: ImageURLOptions): string => {
  if (user.avatar) {
    return cdn.avatar(user.id, user.avatar, options)
  } else {
    return cdn.defaultAvatar(getUserDefaultAvatar(user))
  }
}

export const webhookAvatarUrl = (webhook: { id: string; avatar: string | null }, options?: ImageURLOptions): string => {
  if (webhook.avatar) {
    return cdn.avatar(webhook.id, webhook.avatar, options)
  } else {
    return cdn.defaultAvatar(5)
  }
}

export const readAttachment = async (url: string) => {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to fetch attachment with URL ${url}`)
  }
  const type = response.headers.get("Content-Type");
  const buffer = await response.arrayBuffer();

  // This was often failing with files that were 'too large' (a few hundred KB)
  // so we have to fragmentedly compile the data instead of doing it all at once
  // Thanks https://stackoverflow.com/a/60782610
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${type ?? "application/octet-stream"};base64,${btoa(binary)}`;
}
