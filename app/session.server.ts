import { createCookieSessionStorage, json } from "@remix-run/node";
import { APIUser } from "discord-api-types/v10";
import { DiscordProfile } from "remix-auth-discord";
import { prisma } from "./prisma.server";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__boogiehook_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const writeOauthUser = async ({
  discord,
}: {
  discord?: DiscordProfile;
}) => {
  const j = (discord ? discord.__json : {}) as APIUser;
  return await prisma.user.upsert({
    where: discord ? { discordId: BigInt(discord.id) } : { id: 0 },
    create: {
      name: discord ? j.global_name ?? j.username : "no name",
      discordId: discord ? BigInt(discord.id) : undefined,
    },
    update: {
      name: discord ? j.global_name ?? j.username : "no name",
    },
    select: {
      id: true,
      name: true,
      discordUser: {
        select: {
          id: true,
          name: true,
          globalName: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });
};

export type User = Awaited<ReturnType<typeof writeOauthUser>>;

export const getUserId = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user")?.id;
  if (!userId || typeof userId !== "number") {
    return null;
  }
  return userId;
};

export async function getUser(
  request: Request,
  throwIfNull?: false
): Promise<User | null>;
export async function getUser(
  request: Request,
  throwIfNull?: true
): Promise<User>;
export async function getUser(
  request: Request,
  throwIfNull?: boolean
): Promise<User | null> {
  const userId = await getUserId(request);
  if (!userId) {
    if (throwIfNull) {
      throw json({ message: "Must be logged in." }, 401);
    } else {
      return null;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      discordUser: {
        select: {
          id: true,
          name: true,
          globalName: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });
  if (!user) {
    if (throwIfNull) {
      throw json({ message: "Must be logged in." }, 401);
    } else {
      return null;
    }
  }

  return user as User;
}
