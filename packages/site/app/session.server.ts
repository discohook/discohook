import { REST } from "@discordjs/rest";
import {
  Cookie,
  SerializeFrom,
  createCookie,
  createSessionStorage,
  json,
  redirect,
} from "@remix-run/cloudflare";
import {
  APIGuild,
  APIGuildChannel,
  APIGuildMember,
  GuildChannelType,
  OverwriteType,
  RESTGetAPIGuildMemberResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { isSnowflake } from "discord-snowflake";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { getSessionManagerStub } from "~/store.server";
import { getDiscordUserOAuth } from "./auth-discord.server";
import {
  discordMembers,
  generateId,
  getDb,
  makeSnowflake,
  tokens,
  upsertDiscordUser,
} from "./store.server";
import { Env } from "./types/env";
import { Context } from "./util/loader";

export const createWorkersDOSessionStorage = ({
  env,
  cookie,
}: { env: Env; cookie: Cookie }) =>
  createSessionStorage({
    cookie,
    async createData(data, expires) {
      const id = generateId();
      const stub = getSessionManagerStub(env, id);
      await stub.fetch("http://do/", {
        method: "PUT",
        body: JSON.stringify({ data, expires }),
        headers: { "Content-Type": "application/json" },
      });
      // console.log("[Create Session]", id, data);
      return id;
    },
    async readData(id) {
      const stub = getSessionManagerStub(env, id);
      const response = await stub.fetch("http://do/", { method: "GET" });
      const { data } = response.ok
        ? ((await response.json()) as { data: any })
        : { data: null };
      // console.log("[Read Session]", id, data);
      return data;
    },
    async updateData(id, data, expires) {
      const stub = getSessionManagerStub(env, id);
      await stub.fetch("http://do/", {
        method: "PUT",
        body: JSON.stringify({ data, expires }),
        headers: { "Content-Type": "application/json" },
      });
      // console.log("[Update Session]", id, data);
    },
    async deleteData(id) {
      const stub = getSessionManagerStub(env, id);
      await stub.fetch("http://do/", { method: "DELETE" });
      // console.log("[Destroy Session]", id);
    },
  });

export const getSessionStorage = (context: Context) => {
  const sessionStorage = createWorkersDOSessionStorage({
    env: context.env,
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
  const sessionStorage = createWorkersDOSessionStorage({
    env: context.env,
    cookie: createCookie("__discohook_token", {
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
  const sessionStorage = createWorkersDOSessionStorage({
    env: context.env,
    cookie: createCookie("__discohook_editor_token", {
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

  const db = getDb(context.env.HYPERDRIVE);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
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

export interface KVTokenGuildChannelPermissions {
  permissions: string;
  owner?: boolean;
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

  const permExpireAt = (new Date().getTime() + 21_600_000) / 1000;
  if (memberships.length !== 0) {
    await env.KV.send("MULTI");
    try {
      for (const membership of memberships) {
        // A user can be in up to 200 guilds, so assuming proper state management
        // (memberships are deleted when a member is removed), then that should
        // be the maximum number of transaction members here.
        await env.KV.put(
          `token-${token.id}-guild-${membership.guildId}`,
          JSON.stringify({
            permissions: membership.permissions,
            owner: membership.owner,
          } satisfies KVTokenPermissions),
          { expiration: Math.floor(permExpireAt) },
        );
      }
      await env.KV.send("EXEC");
    } catch (e) {
      await env.KV.send("DISCARD");
      throw e;
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

    const db = getDb(context.env.HYPERDRIVE);
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

    const db = getDb(context.env.HYPERDRIVE);
    const token = await db.query.tokens.findFirst({
      where: (tokens, { eq }) => eq(tokens.id, makeSnowflake(tokenId)),
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
        .reduce((prev, cur) => BigInt(cur) | prev, 0n),
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

export const getTokenGuildChannelPermissions = async (
  token: TokenWithUser,
  channelId: bigint | string,
  env: Env,
): Promise<TokenGuildChannelPermissions> => {
  const key = `token-${token.id}-channel-${channelId}`;
  const cached = await env.KV.get<KVTokenGuildChannelPermissions>(key, "json");
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
      } catch (e) {
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
      } catch (e) {
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

    const permExpireAt = (new Date().getTime() + 21_600_000) / 1000;
    await env.KV.put(
      `token-${token.id}-guild-${guild.id}`,
      JSON.stringify({
        permissions: guildPermissions.toString(),
        owner: guild.owner_id === member.user?.id,
      } satisfies KVTokenPermissions),
      { expiration: permExpireAt },
    );
    await env.KV.put(
      key,
      JSON.stringify({
        permissions: permissions.toString(),
        owner: guild.owner_id === member.user?.id,
      } satisfies KVTokenGuildChannelPermissions),
      { expiration: permExpireAt },
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
