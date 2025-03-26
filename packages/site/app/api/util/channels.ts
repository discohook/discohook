import { type APIChannel, ChannelType } from "discord-api-types/v10";

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
