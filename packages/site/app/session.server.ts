import { REST } from "@discordjs/rest";
import {
  createCookie,
  createCookieSessionStorage,
  json,
  redirect,
  type SerializeFrom,
  type Session,
} from "@remix-run/cloudflare";
import {
  type APIGuild,
  type APIGuildChannel,
  type APIGuildMember,
  type GuildChannelType,
  OverwriteType,
  type RESTGetAPIGuildMemberResult,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { isSnowflake } from "discord-snowflake";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { getDiscordUserOAuth } from "./auth-discord.server";
import {
  discordMembers,
  generateId,
  getDb,
  makeSnowflake,
  type tokens,
  type upsertDiscordUser,
} from "./store.server";
import type { Env } from "./types/env";
import { isDiscordError } from "./util/discord";
import type { Context } from "./util/loader";

export const getSessionStorage = (context: Context) => {
  const sessionStorage = createCookieSessionStorage({
    cookie: createCookie("__discohook_session", {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      secure: context.env.ENVIRONMENT !== "dev",
      maxAge: 31_536_000, // 1 year
    }),
  });

  const { getSession, commitSession, destroySession } = sessionStorage;
  return { getSession, commitSession, destroySession, sessionStorage };
};

export const getTokenStorage = (context: Context) => {
  const sessionStorage = createCookieSessionStorage({
    cookie: createCookie("_discohook_token", {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      secure: context.env.ENVIRONMENT !== "dev",
      maxAge: 604_800, // 1 week
    }),
  });

  const { getSession, commitSession, destroySession } = sessionStorage;
  return { getSession, commitSession, destroySession, sessionStorage };
};

export const getEditorTokenStorage = (context: Context) => {
  const sessionStorage = createCookieSessionStorage({
    cookie: createCookie("_discohook_editor_token", {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      secure: context.env.ENVIRONMENT !== "dev",
      maxAge: 7_200_000, // 2 hours
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

const UpsertUserSchema = z.object({
  id: z.bigint().or(z.string()),
  name: z.string(),
  firstSubscribed: z.string().nullable(),
  subscribedSince: z.string().nullable(),
  subscriptionExpiresAt: z.string().nullable(),
  lifetime: z.boolean().nullable(),
  discordId: z.bigint().or(z.string()).nullable(),
  discordUser: z
    .object({
      id: z.bigint().or(z.string()),
      name: z.string(),
      globalName: z.string().nullable(),
      discriminator: z.string().nullable(),
      avatar: z.string().nullable(),
    })
    .nullable(),
});
// satisfies z.ZodType<User>;

const disabledUserIds: bigint[] = [];

export async function getUser(
  request: Request,
  context: Context,
  throwIfNull?: false,
  session?: Session,
): Promise<User | null>;
export async function getUser(
  request: Request,
  context: Context,
  throwIfNull?: true,
  session?: Session,
): Promise<User>;
export async function getUser(
  request: Request,
  context: Context,
  throwIfNull?: boolean,
  // allow custom session so that it can be committed after this function returns
  session?: Session,
): Promise<User | null> {
  let sesh = session;
  if (!sesh) {
    const { getSession } = getSessionStorage(context);
    sesh = await getSession(request.headers.get("Cookie"));
  }
  const userRaw = sesh.get("user");

  const throwFn = () => {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/")) {
      throw json({ message: "Must be logged in." }, 401);
    }
    throw redirect(
      `/auth/discord?redirect=${encodeURIComponent(
        // Return to the same page
        request.url.replace(context.origin, ""),
      )}`,
    );
  };
  if (!userRaw) {
    if (throwIfNull) throwFn();
    return null;
  }

  const parsed = await UpsertUserSchema.spa(userRaw);
  // I thought there might be a scenario (albeit unlikely) in which a user
  // leaks their own token and then an attacker has access to their Discohook
  // data. In the absolute worst case, we can hardcode their ID to prevent
  // all authorization attempts.
  // TODO: an identifier for each token/session which we can invalidate
  // remotely - this solution became harder when we stopped requesting the DB
  // on every `getUser` but it would still be possible to check when the
  // `updatedAt` soft-expiry is reached.
  // The best solution is prevention: DON'T SHARE YOUR TOKEN!
  if (parsed.success && disabledUserIds.includes(BigInt(parsed.data.id))) {
    throwFn();
  }

  const now = new Date();
  const updatedAt = sesh.get("updatedAt");
  if (
    !updatedAt ||
    // more than 1 day ago
    now.getTime() - Number(updatedAt) > 86_400_000 ||
    // bad session data
    !parsed.success
  ) {
    if (!userRaw.id) throwFn();

    const db = getDb(context.env.HYPERDRIVE);
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, BigInt(String(userRaw.id))),
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
    // A note here about how the user's data was
    // previously removed might be useful
    if (!user) {
      if (throwIfNull) throwFn();
      return null;
    }

    // This is our cache busting solution. The session will only be committed
    // in some routes (get current user) but that route is requested so often
    // that it shouldn't be a problem. If a user needs to manually refresh,
    // they can push the button on their profile.
    sesh.set("user", user);
    sesh.set("updatedAt", now.getTime());
    return doubleDecode<typeof user>(user) satisfies User;
  }

  // bad
  return doubleDecode<User>(parsed.data as User);
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
    .setProtectedHeader({ alg: "HS256" })
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
  expiresAt?: number;
}

const regenerateToken = async (env: Env, origin: string, userId: bigint) => {
  const token = await createToken(env, origin, userId);
  const db = getDb(env.HYPERDRIVE);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: {
      discordId: true,
    },
  });
  if (!user?.discordId) {
    throw Error("User has no linked Discord account");
  }
  const memberships = await db.query.discordMembers.findMany({
    where: (discordMembers, { eq }) =>
      // biome-ignore lint/style/noNonNullAssertion: Checked above
      eq(discordMembers.userId, user.discordId!),
    columns: {
      guildId: true,
      permissions: true,
      owner: true,
    },
  });

  const permExpireAt = new Date().getTime() + 21_600_000;
  if (memberships.length !== 0) {
    // Generate a Lua script to mass-SET up to 200 keys and their expiration
    // dates. Webdis doesn't support MULTI or pipelining, so this is sort of
    // our only option. This drastically reduces the time that this function
    // can take: from >10s to less than 2s.
    // https://github.com/nicolasff/webdis/issues/230#issuecomment-1426869924
    const scriptCommands = memberships.map(
      (membership) =>
        `redis.call(${[
          "SET",
          `token-${token.id}-guild-${membership.guildId}`,
          JSON.stringify({
            permissions: membership.permissions,
            owner: membership.owner,
            expiresAt: permExpireAt,
          } satisfies KVTokenPermissions),
          "EXAT",
          String(Math.floor(permExpireAt / 1000)),
        ]
          .map((x) => `'${x.replace(/'/g, "\\'")}'`)
          .join(",")})`,
    );
    // Load and run the script in the same command. We don't need to cache
    // because we will never run the same script twice.
    const result = await env.KV.send("EVAL", scriptCommands.join(";"), "0");
    if (Array.isArray(result) && result[0] === false) {
      throw Error(
        `Failed to write guild permissions: ${JSON.stringify(result)}`,
      );
    }
  }

  return token;
};

export const verifyToken = async (token: string, env: Env, origin: string) => {
  const secretKey = Uint8Array.from(
    env.TOKEN_SECRET.split("").map((x) => x.charCodeAt(0)),
  );
  try {
    const data = await jwtVerify(token, secretKey, {
      issuer: origin,
      algorithms: ["HS256"],
    });
    if (!data.payload.jti) throw Error("No jti");
    // if (!data.payload.uid) throw Error("No uid");
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
    headers?: Record<string, string>;
    // This option is an override for the "is this an API route" logic,
    // preventing a redirect to /auth/discord when it's not desired
    errorLoggedOut?: boolean;
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
    const user = await getUser(
      request,
      context,
      options?.errorLoggedOut === undefined
        ? new URL(request.url).pathname.startsWith("/api/")
          ? undefined
          : true
        : options.errorLoggedOut
          ? undefined
          : true,
    );
    if (user === null) {
      throw json({ message: "Must provide proper authorization" }, 401);
    }
    const token = await regenerateToken(context.env, context.origin, user.id);

    // TODO: Allow users to see a list of these w/ country code to inspect
    // suspicious activity. Not super useful since it would also mean access
    // to the Discord account at which point you could do anything you could
    // do through Discohook, but undetected.
    // const countryCode = request.headers.get("CF-IPCountry") ?? undefined;
    // const db = getDb(context.env.HYPERDRIVE);
    // await db.insert(tokens).values({
    //   platform: "discord",
    //   prefix: "user",
    //   id: makeSnowflake(token.id),
    //   userId: user.id,
    //   country: countryCode,
    //   expiresAt: token.expiresAt,
    // });

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
        if (options?.headers) {
          for (const [k, v] of Object.entries(options.headers)) {
            response.headers.append(k, v);
          }
        }
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
      throw json({ message: "Invalid token" }, 401);
    }
    // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
    const tokenId = payload.jti!;
    const userId = payload.uid?.toString();
    if (!userId) {
      if (!options?.requireToken) {
        return await serveNewToken();
      }
      throw json(
        { message: "User or token data missing, obtain a new token" },
        401,
      );
    }

    const db = getDb(context.env.HYPERDRIVE);
    const dbUser = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, makeSnowflake(userId)),
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
    if (!dbUser) {
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
        id: BigInt(tokenId),
        prefix: prefix as TokenPrefix,
        // Yuck! This `as` assignment kind of nullifies the purpose of the
        // doubleDecode call; to ensure our `with` result matches `User`.
        // Nonetheless, we jsonify to match `upsertDiscordUser`
        user: dbUser as User,
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

export interface TokenGuildChannelPermissions extends TokenGuildPermissions {
  channel?: APIGuildChannel<GuildChannelType>;
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
    const db = getDb(env.HYPERDRIVE);
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
    } catch (e) {
      if (isDiscordError(e)) {
        throw json(
          {
            ...e.rawError,
            message:
              e.code === RESTJSONErrorCodes.UnknownGuild
                ? "Server does not exist or Discohook Utils is not a member of it"
                : e.rawError.message,
          },
          e.status,
        );
      }
      throw json({ message: String(e) }, 500);
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
        if (isDiscordError(e)) {
          throw json(
            {
              ...e.rawError,
              message:
                e.code === RESTJSONErrorCodes.UnknownGuild
                  ? "Server does not exist or you are not a member of it"
                  : e.rawError.message,
            },
            e.status,
          );
        }
        throw json({ message: String(e) }, 500);
      }
    } else {
      try {
        member = (await rest.get(
          Routes.guildMember(String(guildId), String(token.user.discordId)),
        )) as RESTGetAPIGuildMemberResult;
      } catch (e) {
        if (isDiscordError(e)) {
          throw json(
            {
              ...e.rawError,
              message:
                e.code === RESTJSONErrorCodes.UnknownGuild
                  ? "Server does not exist or you are not a member of it"
                  : e.rawError.message,
            },
            e.status,
          );
        }
        throw json({ message: String(e) }, 500);
      }
    }
    const permissions = new PermissionsBitField(
      member.roles
        .map((roleId) => {
          const role = guild.roles.find((r) => r.id === roleId);
          return role?.permissions ?? "0";
        })
        .reduce((prev, cur) => BigInt(cur) | prev, 0n),
    );

    const permExpireAt = new Date().getTime() + 21_600_000;
    await env.KV.put(
      key,
      JSON.stringify({
        permissions: permissions.toString(),
        owner: guild.owner_id === member.user?.id,
        expiresAt: permExpireAt,
      } satisfies KVTokenPermissions),
      { expiration: permExpireAt / 1000 },
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

export const getTokenGuildChannelPermissions = async (
  token: TokenWithUser,
  channelId: bigint | string,
  env: Env,
): Promise<TokenGuildChannelPermissions> => {
  const key = `token-${token.id}-channel-${channelId}`;
  const cached = await env.KV.get<KVTokenPermissions>(key, "json");
  let data: TokenGuildChannelPermissions;
  if (cached) {
    data = {
      ...cached,
      permissions: new PermissionsBitField(BigInt(cached.permissions)),
    };
  } else {
    const db = getDb(env.HYPERDRIVE);
    if (!token.user.discordId) {
      throw json({ message: "User has no linked Discord user" }, 401);
    }

    const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
    let channel: APIGuildChannel<GuildChannelType>;
    try {
      channel = (await rest.get(
        Routes.channel(String(channelId)),
      )) as typeof channel;
    } catch {
      throw json(
        {
          message: "Channel does not exist or Discohook Utils cannot access it",
        },
        404,
      );
    }
    if (!channel.guild_id) {
      // Could be confusing
      return {
        permissions: new PermissionsBitField().add(
          PermissionFlags.ViewChannel,
          PermissionFlags.SendMessages,
          PermissionFlags.EmbedLinks,
          PermissionFlags.AttachFiles,
          PermissionFlags.AddReactions,
          PermissionFlags.SendVoiceMessages,
          PermissionFlags.SendTTSMessages,
          PermissionFlags.UseExternalEmojis,
          PermissionFlags.UseExternalSounds,
          PermissionFlags.UseExternalStickers,
          PermissionFlags.UseApplicationCommands,
        ),
      };
    }

    const oauth = await getDiscordUserOAuth(db, env, token.user.discordId);
    let member: APIGuildMember;
    if (oauth) {
      try {
        member = (await rest.get(Routes.userGuildMember(channel.guild_id), {
          headers: { Authorization: `Bearer ${oauth.accessToken}` },
          auth: false,
        })) as RESTGetAPIGuildMemberResult;
      } catch {
        throw json(
          { message: "Server does not exist or you are not a member of it" },
          404,
        );
      }
    } else {
      try {
        member = (await rest.get(
          Routes.guildMember(channel.guild_id, String(token.user.discordId)),
        )) as RESTGetAPIGuildMemberResult;
      } catch {
        throw json(
          { message: "Server does not exist or you are not a member of it" },
          404,
        );
      }
    }

    let guild: APIGuild;
    try {
      guild = await getGuild(channel.guild_id, rest, env);
    } catch {
      // This shouldn't fail since we were able to get the channel
      throw json(
        {
          message:
            "Server does not exist or Discohook Utils is not a member of it",
        },
        404,
      );
    }

    const guildPermissions = new PermissionsBitField(
      member.roles
        .map((roleId) => {
          const role = guild.roles.find((r) => r.id === roleId);
          return role?.permissions ?? "0";
        })
        .reduce((prev, cur) => BigInt(cur) | prev, 0n),
    );
    const permissions = new PermissionsBitField(guildPermissions);

    const overwrites = channel.permission_overwrites ?? [];
    for (const overwrite of overwrites) {
      if (
        (overwrite.type === OverwriteType.Member &&
          overwrite.id === String(token.user.discordId)) ||
        (overwrite.type === OverwriteType.Role &&
          member.roles.includes(overwrite.id))
      ) {
        permissions.add(BigInt(overwrite.allow));
        permissions.remove(BigInt(overwrite.deny));
      }
    }

    const permExpireAt = new Date().getTime() + 21_600_000;
    await env.KV.put(
      `token-${token.id}-guild-${guild.id}`,
      JSON.stringify({
        permissions: guildPermissions.toString(),
        owner: guild.owner_id === member.user?.id,
        expiresAt: permExpireAt,
      } satisfies KVTokenPermissions),
      { expiration: permExpireAt / 1000 },
    );
    await env.KV.put(
      key,
      JSON.stringify({
        permissions: permissions.toString(),
        owner: guild.owner_id === member.user?.id,
        expiresAt: permExpireAt,
      } satisfies KVTokenPermissions),
      { expiration: permExpireAt / 1000 },
    );

    data = {
      owner: guild.owner_id === member.user?.id,
      permissions,
      member,
      guild,
      channel,
    };

    await db
      .insert(discordMembers)
      .values({
        guildId: makeSnowflake(guild.id),
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
  env: Env,
) => {
  const guild = (await rest.get(Routes.guild(String(guildId)))) as APIGuild;
  // TODO: Leads to unnecessary writes
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
