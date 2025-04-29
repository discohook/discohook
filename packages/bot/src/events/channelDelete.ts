import { APIGuildChannel, ChannelType } from "discord-api-types/v10";
import { and, eq } from "drizzle-orm";
import { getDb, webhooks } from "store";
import { GatewayEventCallback } from "../events.js";

export const channelDeleteCallback: GatewayEventCallback = async (
  env,
  // Type checked by bot-ws before bulk sending
  channel: APIGuildChannel<
    | ChannelType.GuildAnnouncement
    | ChannelType.GuildForum
    | ChannelType.GuildMedia
    | ChannelType.GuildText
    | ChannelType.GuildVoice
  >,
) => {
  const db = getDb(env.HYPERDRIVE);
  await db
    .delete(webhooks)
    .where(
      and(eq(webhooks.platform, "discord"), eq(webhooks.channelId, channel.id)),
    );
};
