import {
  SerializeFrom,
  createCookie,
  createWorkersKVSessionStorage,
  json,
} from "@remix-run/cloudflare";
import { APIUser } from "discord-api-types/v10";
import type { DiscordProfile } from "remix-auth-discord";
import { Context } from "./util/loader";
import { getDb } from "./db/index.server";
import { makeSnowflake, users } from "./db/schema.server";
import { eq } from "drizzle-orm";

export const getSessionStorage = (context: Context) => {
  const sessionStorage = createWorkersKVSessionStorage({
    kv: context.env.KV,
    cookie: createCookie("__boogiehook_session", {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      // secure: process.env.NODE_ENV === "production",
    }),
  });

  const { getSession, commitSession, destroySession } = sessionStorage;
  return { getSession, commitSession, destroySession, sessionStorage };
};

export type Jsonify<T> = SerializeFrom<() => Promise<T>>;

export const doubleDecode = <T>(data: T) => {
  return JSON.parse(JSON.stringify(data)) as Jsonify<T>;
};

export const writeOauthUser = async ({
  db,
  discord,
}: {
  db: ReturnType<typeof getDb>;
  discord?: DiscordProfile;
}) => {
  const j = (discord ? discord.__json : {}) as APIUser;
  const { id } = (
    await db
      .insert(users)
      .values({
        discordId: discord ? makeSnowflake(discord.id) : undefined,
        name: discord ? j.global_name ?? j.username : "no name",
      })
      .onConflictDoUpdate({
        target: discord ? users.discordId : users.id,
        set: {
          name: discord ? j.global_name ?? j.username : "no name",
        },
      })
      .returning({
        id: users.id,
      })
  )[0];

  const user = (await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      name: true,
      firstSubscribed: true,
      subscribedSince: true,
    },
    with: {
      discordUser: {
        columns: {
          id: true,
          name: true,
          globalName: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  }))!;

  return doubleDecode(user);
};

export type User = SerializeFrom<typeof writeOauthUser>;

export const getUserId = async (request: Request, context: Context) => {
  const session = await getSessionStorage(context).getSession(
    request.headers.get("Cookie"),
  );
  const userId = session.get("user")?.id;
  if (!userId || typeof userId !== "number") {
    return null;
  }
  return userId;
};

export async function getUser(
  request: Request,
  context: Context,
  throwIfNull?: false,
): Promise<User | null>;
export async function getUser(
  request: Request,
  context: Context,
  throwIfNull?: true,
): Promise<User>;
export async function getUser(
  request: Request,
  context: Context,
  throwIfNull?: boolean,
): Promise<User | null> {
  const userId = await getUserId(request, context);
  if (!userId) {
    if (throwIfNull) {
      throw json({ message: "Must be logged in." }, 401);
    } else {
      return null;
    }
  }

  const db = getDb(context.env.D1);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      firstSubscribed: true,
      subscribedSince: true,
    },
    with: {
      discordUser: {
        columns: {
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

  return doubleDecode<typeof user>(user) as User;
}
