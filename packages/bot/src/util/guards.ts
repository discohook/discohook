import {
  type APIChannel,
  type APIGuildChannel,
  type APIThreadChannel,
  ChannelType
} from "discord-api-types/v10";

export const isThread = (
  channel: APIChannel | APIGuildChannel<ChannelType>,
): channel is APIThreadChannel =>
  [
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
    ChannelType.AnnouncementThread,
  ].includes(channel.type);
