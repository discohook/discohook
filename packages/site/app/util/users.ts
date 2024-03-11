import { ImageURLOptions } from "@discordjs/rest";
import { User } from "~/session.server";
import { cdn } from "./discord";

export const getUserPremiumDetails = (
  user: User,
): { active: boolean; grace?: boolean; graceDaysRemaining?: number } => {
  // Development mode
  // if (String(user.discordUser?.id) === "115238234778370049") {
  //   return {
  //     active: true,
  //     grace: true,
  //     graceDaysRemaining: 3,
  //   };
  // }
  if (user.lifetime) return { active: true, grace: false };
  if (!user.subscribedSince) return { active: false };
  if (user.subscriptionExpiresAt) {
    const now = new Date();
    const ttl = new Date(user.subscriptionExpiresAt).getTime() - now.getTime();
    // 3 day grace period
    return {
      active: ttl >= -259_200_000,
      grace: ttl <= 0,
      graceDaysRemaining: Math.floor((259_200_000 - ttl) / 86400000),
    };
  }
  return { active: false };
};

export const userIsPremium = (user: User) => getUserPremiumDetails(user).active;

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
