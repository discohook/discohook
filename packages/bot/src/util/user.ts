import { APIUser } from "discord-api-types/v10";
import { upsertDiscordUser } from "store";

export const getUserTag = (user: APIUser): string =>
  user.discriminator === "0"
    ? user.username
    : `${user.username}#${user.discriminator}`;

export const getUserDefaultAvatar = (user: {
  id: string;
  discriminator: string;
}): number =>
  user.discriminator === "0"
    ? Number((BigInt(user.id) >> BigInt(22)) % BigInt(6))
    : Number(user.discriminator) % 5;

type PUser = Pick<
  Awaited<ReturnType<typeof upsertDiscordUser>>,
  | "lifetime"
  | "discordId"
  | "subscribedSince"
  | "subscriptionExpiresAt"
  | "firstSubscribed"
>;

export const getUserPremiumDetails = (
  user: PUser,
): { active: boolean; grace?: boolean; graceDaysRemaining?: number } => {
  // Development mode
  // if (String(user.discordId) === "115238234778370049") {
  //   return {
  //     active: true,
  //     grace: true,
  //     graceDaysRemaining: 3,
  //   };
  // }
  if (user.lifetime) return { active: true, grace: false };
  // This value should be wiped in ON_ENTITLEMENT_DELETE
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

export const userIsPremium = (user: PUser) =>
  getUserPremiumDetails(user).active;
