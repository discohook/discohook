import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type APIGuildMember,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { z } from "zod";
import { getBucket } from "~/durable/rate-limits";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { isDiscordError } from "~/util/discord";
import {
  type ActionArgs,
  getZodErrorMessage,
  type LoaderArgs,
} from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

const getFileDataUrl = async (file: File): Promise<string> => {
  const b64 = Buffer.from(await file.bytes()).toString("base64");
  return `data:${file.type};base64,${b64}`;
};

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const headers = await getBucket(request, context, "guildProfile");
  const [token, respond] = await authorizeRequest(request, context, {
    headers,
  });
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.ManageNicknames)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  // commit
  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let member: APIGuildMember;
  try {
    // empty PATCH to get own bio
    member = (await rest.patch(Routes.guildMember(String(guildId), "@me"), {
      // This won't show up in audit log since it's blank so
      // the reason shouldn't matter
      body: {},
    })) as APIGuildMember;
  } catch (e) {
    if (
      // perhaps rate limit or empty body was forbidden
      isDiscordError(e) &&
      e.code !== RESTJSONErrorCodes.UnknownMember &&
      e.code !== RESTJSONErrorCodes.UnknownGuild
    ) {
      console.error(
        "Failed to submit empty PATCH current member, falling back to GET",
        e.rawError,
      );
      member = (await rest.get(
        Routes.guildMember(String(guildId), context.env.DISCORD_CLIENT_ID),
      )) as APIGuildMember;
    } else {
      throw e;
    }
  }

  return respond(
    json({
      nick: member.nick,
      avatar: member.avatar,
      banner: member.banner,
      bio: "bio" in member ? (member.bio as string) : undefined,
      user: {
        id: member.user.id,
        username: member.user.username,
        global_name: member.user.global_name,
        discriminator: member.user.discriminator,
        avatar: member.user.avatar,
        banner: member.user.banner,
        public_flags: member.user.public_flags,
      },
    }),
  );
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const headers = await getBucket(request, context, "guildProfile");

  const size = request.headers.get("Content-Length");
  if (!size || Number.isNaN(Number(size)))
    throw json(
      { message: "Missing or invalid Content-Length" },
      { status: 400, headers },
    );
  // TODO: 100mb should be plenty, but I'm not actually sure what the
  // limit is for the avatar/banner
  if (Number(size) > 100_000_000) {
    throw json({ message: "Files are too large" }, { status: 400, headers });
  }

  // parse
  const body: {
    nick?: string | null;
    avatar?: string | null;
    banner?: string | null;
    bio?: string | null;
  } = {};

  // We use formdata here instead of JSON because of a bug on iOS Safari that
  // prevents large file uploads over JSON. See `WebhookEditModal` ~L100
  const formData = await request.formData();

  const nick_ = formData.get("nick")?.toString()?.trim();
  if (nick_ === "") {
    body.nick = null;
  } else if (nick_) {
    body.nick = nick_;
  }

  const bio_ = formData.get("bio")?.toString()?.trim();
  if (bio_ === "") {
    body.bio = null;
  } else if (bio_) {
    body.bio = bio_;
  }

  const safeParsed = await z
    .object({
      nick: z
        .string()
        .min(1)
        .max(32, "Nickname is too long")
        .optional()
        .nullable(),
      bio: z
        .string()
        .min(1)
        // Unconfirmed, based on user bio limit
        .max(190, "Bio is too long")
        .optional()
        .nullable(),
    })
    .spa(body);
  if (!safeParsed.success) {
    throw json(
      {
        message: getZodErrorMessage(safeParsed.error),
        error: safeParsed.error.format(),
      },
      { status: 400, headers },
    );
  }

  const avatar_ = formData.get("avatar");
  if (avatar_ && avatar_ instanceof File) {
    if (!avatar_.type.startsWith("image/")) {
      throw json(
        { message: "Avatar must be an image file" },
        { status: 400, headers },
      );
    }
    body.avatar = await getFileDataUrl(avatar_);
  } else if (avatar_ === "") {
    body.avatar = null;
  }

  const banner_ = formData.get("banner");
  if (banner_ && banner_ instanceof File) {
    if (!banner_.type.startsWith("image/")) {
      throw json(
        { message: "Banner must be an image file" },
        { status: 400, headers },
      );
    }
    body.banner = await getFileDataUrl(banner_);
  } else if (banner_ === "") {
    body.banner = null;
  }

  // authorize
  const [token, respond] = await authorizeRequest(request, context, {
    headers,
  });
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.ManageNicknames)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  // commit
  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let member: APIGuildMember;
  try {
    member = (await rest.patch(Routes.guildMember(String(guildId), "@me"), {
      body,
      reason: `${token.user.discordUser?.name ?? token.user.name} (${token.user.discordId}) via the dashboard`,
    })) as APIGuildMember;
  } catch (e) {
    if (isDiscordError(e)) {
      throw respond(json(e.rawError, e.status));
    }
    throw e;
  }

  return respond(
    json({
      nick: member.nick,
      avatar: member.avatar,
      banner: member.banner,
      bio: ("bio" in member ? (member.bio as string) : body.bio) ?? "",
      user: {
        id: member.user.id,
        username: member.user.username,
        global_name: member.user.global_name,
        discriminator: member.user.discriminator,
        avatar: member.user.avatar,
        banner: member.user.banner,
        public_flags: member.user.public_flags,
      },
    }),
  );
};
