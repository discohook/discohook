import { REST } from "@discordjs/rest";
import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import {
  ChannelType,
  type RESTGetAPIGuildChannelsResult,
  Routes,
} from "discord-api-types/v10";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import {
  type ResolvableAPIChannel,
  tagToResolvableTag,
} from "~/util/cache/CacheManager";
import { snowflakeAsString, zxParseParams } from "~/util/zod";
import { getChannelIconType } from "../util/channels";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  await getTokenGuildPermissions(token, guildId, context.env);

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const channels = (await rest.get(
    Routes.guildChannels(String(guildId)),
  )) as RESTGetAPIGuildChannelsResult;

  return respond(
    json(
      channels
        .filter(
          (c) =>
            ![ChannelType.GuildCategory, ChannelType.GuildDirectory].includes(
              c.type,
            ),
        )
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: getChannelIconType(channel),
          tags:
            "available_tags" in channel
              ? channel.available_tags.map(tagToResolvableTag)
              : undefined,
        })) satisfies ResolvableAPIChannel[] as ResolvableAPIChannel[],
    ),
  );
};
