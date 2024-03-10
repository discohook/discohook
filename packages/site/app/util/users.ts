import { ImageURLOptions } from "@discordjs/rest";
import { User } from "~/session.server";
import { cdn } from "./discord";

export const userIsPremium = (user: User): boolean => {
  if (user.lifetime) return true;
  if (!user.subscribedSince) return false;
  if (user.subscriptionExpiresAt) {
    const now = new Date();
    const ttl = new Date(user.subscriptionExpiresAt).getTime() - now.getTime();
    // 3 day grace period
    if (ttl >= -259_200_000) {
      return true;
    }
  }
  return false;
};

export const getUserTag = (user: User): string =>
  user.discordUser
    ? user.discordUser.discriminator === "0"
      ? user.discordUser.name
      : `${user.discordUser.name}#${user.discordUser.discriminator}`
    : user.name;

export const getUserAvatar = (user: User, options?: ImageURLOptions): string =>
  user.discordUser
    ? user.discordUser.avatar
      ? cdn.avatar(
          String(user.discordUser.id),
          user.discordUser.avatar,
          options,
        )
      : cdn.defaultAvatar(
          user.discordUser.discriminator === "0"
            ? Number((BigInt(user.discordUser.id) >> BigInt(22)) % BigInt(6))
            : Number(user.discordUser.discriminator) % 5,
        )
    : cdn.defaultAvatar(0);
