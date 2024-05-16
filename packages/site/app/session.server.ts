import { REST } from "@discordjs/rest";
import {
  SerializeFrom,
  createCookie,
  createWorkersKVSessionStorage,
  json,
  redirect,
} from "@remix-run/cloudflare";
import {
  APIGuild,
  APIGuildMember,
  RESTGetAPIGuildMemberResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionsBitField } from "discord-bitflag";
import { isSnowflake } from "discord-snowflake";
import { eq } from "drizzle-orm";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { getDiscordUserOAuth } from "./auth-discord.server";
import {
  discordMembers,
  generateId,
  getDb,
  makeSnowflake,
  tokens,
  upsertDiscordUser,
  users,
} from "./store.server";
import { Env } from "./types/env";
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

export const getTokenStorage = (context: Context) => {
  const sessionStorage = createWorkersKVSessionStorage({
    kv: context.env.KV,
    cookie: createCookie("__discohook_token", {
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
): Promise<bigint | null>;
export async function getUserId(
  request: Request,
  context: Context,
  throwIfNull?: true,
): Promise<bigint>;
export async function getUserId(
  request: Request,
  context: Context,
  throwIfNull?: boolean,
): Promise<bigint | null> {
  const session = await getSessionStorage(context).getSession(
    request.headers.get("Cookie"),
  );
  const userId = session.get("user")?.id;
  if (!userId || !isSnowflake(String(userId))) {
    if (throwIfNull) {
      throw json({ message: "Must be logged in." }, 401);
    }
    return null;
  }
  return BigInt(userId);
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
    throw redirect(
      `/auth/discord?redirect=${encodeURIComponent(
        // Return to the same page
        request.url.replace(context.origin, ""),
      )}`,
    );
  } else if (!userId) {
    return null;
  }

  const db = getDb(context.env.HYPERDRIVE.connectionString);
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
      guildedId: true,
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
      guildedUser: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
  if (!user && throwIfNull) {
    // A note here about how the user's data was
    // previously removed might be useful
    throw redirect(
      `/auth/discord?redirect=${encodeURIComponent(
        // Return to the same page
        request.url.replace(context.origin, ""),
      )}`,
    );
  } else if (!user) {
    return null;
  }

  return doubleDecode<typeof user>(user) satisfies User;
}

const createToken = async (env: Env, origin: string, userId: bigint) => {
  const secretKey = Uint8Array.from(
    env.TOKEN_SECRET.split("").map((x) => x.charCodeAt(0)),
  );

  const now = new Date();
  // Tokens last for 1 week but permissions are stored per token-guild and last 6 hours.
  const expiresAt = new Date(now.getTime() + 604_800_000);
  const id = generateId(now);
  const token = await new SignJWT({ uid: String(userId), scp: "user" })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setJti(id)
    .setIssuedAt(now)
    .setIssuer(origin)
    // .setAudience()
    .setExpirationTime(expiresAt)
    .sign(secretKey);

  return { id, value: token, expiresAt };
};

export interface KVTokenPermissions {
  permissions: string;
  owner?: boolean;
}

const regenerateToken = async (env: Env, origin: string, userId: bigint) => {
  const token = await createToken(env, origin, userId);
  const db = getDb(env.HYPERDRIVE.connectionString);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      discordId: true,
    },
  });
  if (!user?.discordId) {
    throw Error("User has no linked Discord account");
  }
  const memberships = await db.query.discordMembers.findMany({
    where: eq(discordMembers.userId, user.discordId),
    columns: {
      guildId: true,
      permissions: true,
      owner: true,
    },
  });

  const permExpireAt = (new Date().getTime() + 21_600_000) / 1000;
  // https://developers.cloudflare.com/kv/api/write-key-value-pairs/#write-data-in-bulk
  // > As of January 2022, Cloudflare does not support bulk writes from within a Worker.
  for (const membership of memberships) {
    // A user can be in up to 200 guilds, so assuming proper state management
    // (memberships are deleted when a member is removed), then that should
    // be the maximum number of requests made in this loop.
    await env.KV.put(
      `token-${token.id}-guild-${membership.guildId}`,
      JSON.stringify({
        permissions: membership.permissions,
        owner: membership.owner,
      } satisfies KVTokenPermissions),
      { expirationTtl: permExpireAt },
    );
  }

  // await db.transaction(async (tx) => {
  //   await tx.delete()
  // })
  return token;
};

const verifyToken = async (token: string, env: Env, origin: string) => {
  // const secretKey = createSecretKey(env.TOKEN_SECRET, "utf-8");
  const secretKey = Uint8Array.from(
    env.TOKEN_SECRET.split("").map((x) => x.charCodeAt(0)),
  );
  try {
    const data = await jwtVerify(token, secretKey, {
      issuer: origin,
      algorithms: ["HS256"],
    });
    if (!data.payload.jti) throw Error("No jti");
    if (!data.payload.uid) throw Error("No uid");
    return data;
  } catch {
    throw json({ message: "Invalid token" }, 401);
  }
};

export type TokenPrefix = typeof tokens.prefix._.data;

export type TokenWithUser = {
  id: bigint;
  prefix: TokenPrefix;
  value?: string;
  user: User;
};

export async function authorizeRequest(
  request: Request,
  context: Context,
  options?: {
    requireToken?: boolean;
  },
): Promise<
  [
    token: Jsonify<TokenWithUser>,
    respond: <T extends Response>(response: T) => T,
  ]
> {
  let auth = request.headers.get("Authorization");
  const storage = getTokenStorage(context);
  const session = await storage.getSession(request.headers.get("Cookie"));

  const serveNewToken = async () => {
    const user = await getUser(request, context, true);
    const token = await regenerateToken(context.env, context.origin, user.id);
    const countryCode = request.headers.get("CF-IPCountry") ?? undefined;

    const db = getDb(context.env.HYPERDRIVE.connectionString);
    await db.insert(tokens).values({
      platform: "discord",
      prefix: "user",
      id: makeSnowflake(token.id),
      userId: user.id,
      country: countryCode,
      expiresAt: token.expiresAt,
    });

    session.set("Authorization", `User ${token.value}`);
    const committed = await storage.commitSession(session);
    return [
      doubleDecode<TokenWithUser>({
        id: BigInt(token.id),
        prefix: "user",
        value: token.value,
        user,
      }),
      (response) => {
        response.headers.set("Set-Cookie", committed);
        return response;
      },
    ] satisfies [
      token: Jsonify<TokenWithUser>,
      respond: <T extends Response>(response: T) => T,
    ];
  };

  if (!auth) {
    auth = session.get("Authorization");
  }
  if (!auth) {
    if (options?.requireToken) {
      throw json({ message: "Must provide proper authorization" }, 401);
    }
    return await serveNewToken();
  } else {
    const [prefix, tokenValue] = auth.split(" ");
    if (!["user", "bot"].includes(prefix.toLowerCase())) {
      throw json({ message: "Invalid token prefix" }, 401);
    }

    let payload: JWTPayload;
    try {
      ({ payload } = await verifyToken(
        tokenValue,
        context.env,
        context.origin,
      ));
    } catch (e) {
      if (e instanceof Response && !options?.requireToken) {
        return await serveNewToken();
      }
      throw e;
    }
    if (payload.scp !== prefix.toLowerCase()) {
      // TMI?
      // throw json(
      //   { message: `${payload.scp}-scoped token used with "${prefix}" prefix` },
      //   401,
      // );
      throw json({ message: "Invalid token" }, 401);
    }
    // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
    const tokenId = payload.jti!;
    // const userId = BigInt(payload.uid as string);

    const db = getDb(context.env.HYPERDRIVE.connectionString);
    const token = await db.query.tokens.findFirst({
      where: eq(tokens.id, makeSnowflake(tokenId)),
      columns: {
        id: true,
        prefix: true,
        // country: true,
      },
      with: {
        user: {
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
        },
      },
    });
    if (!token || !token.user) {
      if (!options?.requireToken) {
        return await serveNewToken();
      }
      throw json(
        { message: "User or token data missing, obtain a new token" },
        401,
      );
    }
    // Unsure about this right now
    // const countryCode = request.headers.get("CF-IPCountry");
    // if (token.country && countryCode && countryCode !== token.country) {
    //   throw json({ message: "Token location mismatch" }, 403);
    // }

    return [
      doubleDecode<TokenWithUser>({
        id: token.id,
        prefix: token.prefix,
        // Yuck! This `as` assignment kind of nullifies the purpose of the
        // doubleDecode call; to ensure our `with` result matches `User`.
        // Nonetheless, we jsonify to match `upsertDiscordUser`
        user: token.user as User,
      }),
      (response) => response,
    ];
  }
}

export interface TokenGuildPermissions {
  permissions: PermissionsBitField;
  owner?: boolean;
  guild?: APIGuild;
  member?: APIGuildMember;
}

export const getTokenGuildPermissions = async (
  token: TokenWithUser,
  guildId: bigint | string,
  env: Env,
): Promise<TokenGuildPermissions> => {
  const key = `token-${token.id}-guild-${guildId}`;
  const cached = await env.KV.get<KVTokenPermissions>(key, "json");
  let data: TokenGuildPermissions;
  if (cached) {
    data = {
      ...cached,
      permissions: new PermissionsBitField(BigInt(cached.permissions)),
    };
  } else {
    const db = getDb(env.HYPERDRIVE.connectionString);
    if (!token.user.discordId) {
      throw json({ message: "User has no linked Discord user" }, 401);
    }

    const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
    let guild: APIGuild;
    try {
      // We only need roles but we get the whole guild anyway so we can
      // cache it. If this turns out to be bad for our rate limit cap we
      // should switch to guildRoles.
      guild = await getGuild(guildId, rest, env);
    } catch {
      throw json(
        {
          message:
            "Server does not exist or Discohook Utils is not a member of it",
        },
        404,
      );
    }

    const oauth = await getDiscordUserOAuth(db, env, token.user.discordId);
    let member: APIGuildMember;
    if (oauth) {
      try {
        member = (await rest.get(Routes.userGuildMember(String(guildId)), {
          headers: { Authorization: `Bearer ${oauth.accessToken}` },
          auth: false,
        })) as RESTGetAPIGuildMemberResult;
      } catch (e) {
        throw json(
          { message: "Server does not exist or you are not a member of it" },
          404,
        );
      }
    } else {
      try {
        member = (await rest.get(
          Routes.guildMember(String(guildId), String(token.user.discordId)),
        )) as RESTGetAPIGuildMemberResult;
      } catch (e) {
        throw json(
          { message: "Server does not exist or you are not a member of it" },
          404,
        );
      }
    }
    const permissions = new PermissionsBitField(
      member.roles
        .map((roleId) => {
          const role = guild.roles.find((r) => r.id === roleId);
          return role?.permissions ?? "0";
        })
        .reduce((prev, cur) => BigInt(cur) | prev, BigInt(0)),
    );

    const permExpireAt = (new Date().getTime() + 21_600_000) / 1000;
    await env.KV.put(
      key,
      JSON.stringify({
        permissions: permissions.toString(),
        owner: guild.owner_id === member.user?.id,
      } satisfies KVTokenPermissions),
      { expirationTtl: permExpireAt },
    );

    data = {
      owner: guild.owner_id === member.user?.id,
      permissions,
      member,
      guild,
    };

    await db
      .insert(discordMembers)
      .values({
        guildId: typeof guildId === "bigint" ? guildId : makeSnowflake(guildId),
        userId: token.user.discordId,
        permissions: permissions.toString(),
        owner: data.owner,
      })
      .onConflictDoUpdate({
        target: [discordMembers.userId, discordMembers.guildId],
        set: {
          permissions: permissions.toString(),
          owner: data.owner,
        },
      });
  }

  return data;
};

export const getGuild = async (
  guildId: bigint | string,
  rest: REST,
  env: Pick<Env, "KV">,
) => {
  const guild = (await rest.get(Routes.guild(String(guildId)))) as APIGuild;
  await env.KV.put(
    `cache-guild-${guildId}`,
    JSON.stringify({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    }),
    { expirationTtl: 10800 }, // 3 hours
  );
  return guild;
};
