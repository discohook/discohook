import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  APIChannel,
  ChannelType,
  RESTGetAPIChannelResult,
  Routes,
} from "discord-api-types/v10";
import { authorizeRequest } from "~/session.server";
import { ResolvableAPIChannel } from "~/util/cache/CacheManager";
import { isDiscordError } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const getChannelIconType = (channel: APIChannel) => {
  switch (channel.type) {
    case ChannelType.GuildText:
    case ChannelType.GuildAnnouncement:
      return "text";
    case ChannelType.GuildForum:
      return "forum";
    // case ChannelType.GuildMedia:
    //   return "media";
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread:
    case ChannelType.AnnouncementThread:
      if (
        // Don't seem to be able to check parent type without performing
        // another fetch, so we make a guess
        channel.type === ChannelType.PublicThread &&
        "applied_tags" in channel
      ) {
        return "post";
      }
      return "thread";
    case ChannelType.GuildVoice:
    case ChannelType.GuildStageVoice:
      return "voice";
    default:
      return "text";
  }
};

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { channelId } = zxParseParams(params, {
    channelId: snowflakeAsString(),
  });
  const [, respond] = await authorizeRequest(request, context);

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let channel: ResolvableAPIChannel;
  try {
    const rawChannel = (await rest.get(
      Routes.channel(String(channelId)),
    )) as RESTGetAPIChannelResult;
    channel = {
      id: rawChannel.id,
      name: rawChannel.name,
      type: getChannelIconType(rawChannel),
    };
  } catch (e) {
    throw respond(
      json(
        isDiscordError(e) ? e.rawError : { message: "Failed to fetch channel" },
        404,
      ),
    );
  }

  return respond(json(channel));
};
