import {
  SerializeFrom,
  createCookie,
  createWorkersKVSessionStorage,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { getDb, upsertDiscordUser, users } from "./store.server";
import { Context } from "./util/loader";

export const getSessionStorage = (context: Context) => {
  const sessionStorage = createWorkersKVSessionStorage({
    kv: context.env.KV,
    cookie: createCookie("__discohook_session", {
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

export type User = SerializeFrom<typeof upsertDiscordUser>;

export async function getUserId(
  request: Request,
  context: Context,
  throwIfNull?: false,
): Promise<number | null>;
export async function getUserId(
  request: Request,
  context: Context,
  throwIfNull?: true,
): Promise<number>;
export async function getUserId(
  request: Request,
  context: Context,
  throwIfNull?: boolean,
): Promise<number | null> {
  const session = await getSessionStorage(context).getSession(
    request.headers.get("Cookie"),
  );
  const userId = session.get("user")?.id;
  if (!userId || typeof userId !== "number") {
    if (throwIfNull) {
      throw json({ message: "Must be logged in." }, 401);
    }
    return null;
  }
  return userId;
}

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
  const userId = await getUserId(request, context, false);
  if (!userId && throwIfNull) {
    // throw json({ message: "Must be logged in." }, 401);
    throw redirect(
      `/auth/discord?redirect=${encodeURIComponent(
        // Return to the same page
        request.url.replace(context.origin, ""),
      )}`,
    );
  } else if (!userId) {
    return null;
  }

  const db = getDb(context.env.DATABASE_URL);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      firstSubscribed: true,
      subscribedSince: true,
      subscriptionExpiresAt: true,
      lifetime: true,
      discordId: true,
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

  return doubleDecode<typeof user>(user) satisfies User;
}
