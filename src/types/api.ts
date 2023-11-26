import { APIPartialChannel, APIThreadChannel, ChannelType } from "discord-api-types/v10";

export type APIPartialResolvedChannelBase = APIPartialChannel & { permissions: string };

export type APIPartialResolvedThread = APIPartialResolvedChannelBase & {
  type:
    | ChannelType.AnnouncementThread
    | ChannelType.PublicThread
    | ChannelType.PrivateThread
  thread_metadata: APIThreadChannel["thread_metadata"];
  parent_id: APIThreadChannel["parent_id"];
}

export type APIPartialResolvedChannel = APIPartialResolvedChannelBase | APIPartialResolvedThread;
