import { REST } from "@discordjs/rest";
import { data as json } from "react-router";
import {
  type APIThreadOnlyChannel,
  ChannelType,
  type RESTGetAPIGuildChannelsResult,
  Routes,
} from "discord-api-types/v10";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import {
  type ResolvableAPIChannel,
  tagToResolvableTag,
} from "~/util/cache/CacheManager";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";
import { getChannelIconType } from "./channels.$channelId";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  await getTokenGuildPermissions(token, guildId, context.env);

  const key = `cache-guildChannels-${guildId}`;
  const cached = await context.env.KV.get<ResolvableAPIChannel[]>(key, "json");
  if (cached) return respond(json(cached));

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const channels = (await rest.get(
    Routes.guildChannels(String(guildId)),
  )) as RESTGetAPIGuildChannelsResult;

  const resolvable = channels
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
          ? (
              channel as APIThreadOnlyChannel<
                ChannelType.GuildForum | ChannelType.GuildMedia
              >
            ).available_tags?.map(tagToResolvableTag)
          : undefined,
    })) satisfies ResolvableAPIChannel[] as ResolvableAPIChannel[];

  const stringified = JSON.stringify(resolvable);
  if (stringified) {
    context.waitUntil(
      context.env.KV.put(key, stringified, { expirationTtl: 60 * 30 }),
    );
  }

  return respond(json(resolvable));
};
