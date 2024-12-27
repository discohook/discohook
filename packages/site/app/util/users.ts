import { ImageURLOptions } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
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
  // This value should be wiped by the bot in ON_ENTITLEMENT_DELETE
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
  return { active: true };
};

export const userIsPremium = (user: User) => getUserPremiumDetails(user).active;

export const requirePremiumOrThrow = (user: User | null) => {
  const details = user ? getUserPremiumDetails(user) : undefined;
  if (!details || !details.active)
    throw json(
      { message: "A Deluxe subscription is required to do that." },
      403,
    );
  return details;
};

export const getUserTag = (user: User): string =>
  user.discordUser
    ? user.discordUser.discriminator === "0"
      ? user.discordUser.name
      : `${user.discordUser.name}#${user.discordUser.discriminator}`
    : user.guildedUser?.name ?? user.name;

export const getUserAvatar = (
  user: {
    discordUser?: {
      id: bigint;
      discriminator: string | null;
      avatar: string | null;
    } | null;
    guildedUser?: {
      avatarUrl: string | null;
    } | null;
  },
  options?: ImageURLOptions,
): string =>
  user.discordUser
    ? user.discordUser.avatar
      ? cdn.avatar(
          String(user.discordUser.id),
          user.discordUser.avatar,
          options,
        )
      : cdn.defaultAvatar(
          user.discordUser.discriminator === "0"
            ? Number((BigInt(user.discordUser.id) >> 22n) % 6n)
            : Number(user.discordUser.discriminator) % 5,
        )
    : user.guildedUser
      ? user.guildedUser.avatarUrl ??
        "https://img.gilcdn.com/asset/DefaultUserAvatars/profile_1.png"
      : cdn.defaultAvatar(0);
