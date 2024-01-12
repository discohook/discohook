import { APIUser } from "discord-api-types/v10";

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
