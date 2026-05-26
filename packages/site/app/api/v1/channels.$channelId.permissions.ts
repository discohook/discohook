import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type APIGuildMember,
  OverwriteType,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { getBucket } from "~/durable/rate-limits";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildChannelPermissions,
} from "~/session.server";
import { injectErrorContext, isDiscordError } from "~/util/discord";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

// Like /guilds/:id/permissions for situations in which guild ID is yet unknown
export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { channelId } = zxParseParams(params, {
    channelId: snowflakeAsString(),
  });

  const headers = await getBucket(request, context, "channelPermissions");
  const [token, respond] = await authorizeRequest(request, context, {
    headers,
  });
  const data = await getTokenGuildChannelPermissions(
    token,
    channelId,
    context.env,
  );
  const { owner, permissions: userPermissions, member: userMember } = data;
  if (!owner && !userPermissions.has(PermissionFlags.ViewChannel)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let channel = "channel" in data ? data.channel : undefined;
  if (!channel) {
    try {
      channel = (await rest.get(
        Routes.channel(String(channelId)),
      )) as NonNullable<typeof channel>;
    } catch (e) {
      if (isDiscordError(e)) {
        throw respond(
          json(
            injectErrorContext(e.rawError, {
              channelId,
              permissions: PermissionFlags.ViewChannel,
            }),
            e.status,
          ),
        );
      }
      throw respond(json({ message: "Failed to fetch channel" }, 500));
    }
  }
  if (!channel.guild_id) {
    throw respond(json({ message: "Channel is not a server channel" }, 500));
  }

  let guild = data.guild;
  if (!guild) {
    try {
      guild = await getGuild(channel.guild_id, rest, context.env);
    } catch (e) {
      if (isDiscordError(e)) {
        throw json(
          {
            ...e.rawError,
            message:
              e.code === RESTJSONErrorCodes.UnknownGuild
                ? "Discohook Utils cannot access this server"
                : e.rawError.message,
          },
          e.status,
        );
      }
      throw json({ message: `Failed to fetch server: ${String(e)}` }, 500);
    }
  }

  let me: APIGuildMember;
  try {
    me = (await rest.get(
      // assuming new bot app for convenience
      Routes.guildMember(String(guild.id), context.env.DISCORD_CLIENT_ID),
    )) as APIGuildMember;
  } catch (e) {
    if (isDiscordError(e)) {
      throw respond(
        json(
          injectErrorContext(e.rawError, { guildId: guild.id, channelId }),
          e.status,
        ),
      );
    }
    throw respond(json({ message: "Failed to fetch current member" }, 500));
  }

  const botGuildPermissions = new PermissionsBitField(
    me.roles
      .map((roleId) => {
        const role = guild.roles.find((r) => r.id === roleId);
        return role?.permissions ?? "0";
      })
      .reduce((prev, cur) => BigInt(cur) | prev, 0n),
  );
  const botChannelPermissions = new PermissionsBitField(botGuildPermissions);
  for (const overwrite of channel.permission_overwrites ?? []) {
    if (
      (overwrite.type === OverwriteType.Member &&
        overwrite.id === me.user.id) ||
      (overwrite.type === OverwriteType.Role && me.roles.includes(overwrite.id))
    ) {
      botChannelPermissions
        .add(BigInt(overwrite.allow))
        .remove(BigInt(overwrite.deny));
    }
  }

  // don't bother fetching userMember if we don't already have it for now.
  // if channel_id is provided, assume the recipient only actually cares
  // about channel permissions
  let userGuildPermissions: PermissionsBitField | undefined;
  if (userMember) {
    userGuildPermissions = new PermissionsBitField();
    for (const roleId of userMember?.roles ?? []) {
      const role = guild.roles.find((r) => r.id === roleId);
      if (!role) continue;
      userGuildPermissions.add(BigInt(role.permissions));
    }
  }

  return respond(
    json({
      user: userPermissions.toString(),
      bot: botChannelPermissions.toString(),
      guild: {
        user: userGuildPermissions?.toString(),
        bot: botGuildPermissions.toString(),
        userOwner: owner,
      },
    }),
  );
};
