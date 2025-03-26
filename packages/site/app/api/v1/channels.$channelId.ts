import { REST } from "@discordjs/rest";
import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { type RESTGetAPIChannelResult, Routes } from "discord-api-types/v10";
import { authorizeRequest } from "~/session.server";
import {
  type ResolvableAPIChannel,
  tagToResolvableTag,
} from "~/util/cache/CacheManager";
import { isDiscordError } from "~/util/discord";
import { snowflakeAsString, zxParseParams } from "~/util/zod";
import { getChannelIconType } from "../util/channels";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { channelId } = zxParseParams(params, {
    channelId: snowflakeAsString(),
  });
  const [, respond] = await authorizeRequest(request, context);

  const key = `cache-channel-${channelId}`;
  const cached = await context.env.KV.get<ResolvableAPIChannel>(key, "json");
  if (cached) return cached;

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
      tags:
        "available_tags" in rawChannel
          ? rawChannel.available_tags.map(tagToResolvableTag)
          : undefined,
    };
  } catch (e) {
    throw respond(
      json(
        isDiscordError(e) ? e.rawError : { message: "Failed to fetch channel" },
        404,
      ),
    );
  }

  const stringified = JSON.stringify(channel);
  if (stringified) {
    // Was experiencing strange behavior where empty strings were being set
    await context.env.KV.put(key, stringified, {
      // 2 hours
      expirationTtl: 7200,
    });
  }
  return respond(json(channel));
};
