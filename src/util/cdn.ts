import { CDN, ImageURLOptions } from "@discordjs/rest";
import { getUserDefaultAvatar } from "./user.js";

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
