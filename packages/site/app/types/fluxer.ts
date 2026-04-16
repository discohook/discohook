import type { APIEmbed } from "./QueryData-raw";

export interface FluxerAPIUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  avatar_color: number | null;
  flags: number;
  bot?: boolean;
  system?: boolean;
}

export interface FluxerAPIWebhook {
  id: string;
  guild_id: string;
  channel_id: string;
  name: string;
  token: string;
  user: FluxerAPIUser;
  avatar: string | null;
}

export type FluxerAPIWebhookWithoutUser = Omit<FluxerAPIWebhook, "user"> &
  Partial<Pick<FluxerAPIWebhook, "user">>;

export type FluxerRESTGetAPIWebhookWithTokenResult =
  FluxerAPIWebhookWithoutUser;

export type FluxerRESTPatchAPIWebhookWithTokenResult =
  FluxerAPIWebhookWithoutUser;

export interface FluxerRESTPatchAPIWebhookWithTokenJSONBody {
  name?: string;
  avatar?: string | null;
}

interface FluxerAPIAttachment {
  id: string;
  filename: string;
  size: number;
  flags: number;
  title?: string | null;
  description?: string | null;
  content_type?: string | null;
  content_hash?: string | null;
  url?: string | null;
  proxy_url?: string | null;
  width?: number | null;
  height?: number | null;
  placeholder?: string | null;
  nsfw?: boolean | null;
  /** Duration in seconds (integer) */
  duration?: number | null;
  /** base64 encoded audio waveform data */
  waveform?: string | null;
  expires_at?: string | null;
  expired?: boolean | null;
}

export interface FluxerRESTPostAPIWebhookWithTokenJSONBody {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: APIEmbed[];
  attachments?: ({ id: string | number } & Partial<
    Omit<FluxerAPIAttachment, "id">
  >)[];
  flags?: number;
}

export interface FluxerRESTPostAPIWebhookWithTokenWaitResult {
  id: string;
  channel_id: string;
  author: FluxerAPIUser;
  type: number;
  flags: number;
  content: string;
  timestamp: string;
  pinned: boolean;
  mention_everyone: boolean;
  webhook_id?: string | null;
  edited_timestamp?: string | null;
  tts?: boolean;
  mentions?: unknown[] | null;
  embeds?: unknown[] | null;
  // attachments?: {}[] | null;
  // stickers?: {}[] | null;
  // reactions?: {}[] | null;
  // message_reference?: {};
  // message_snapshots?: {}[] | null;
  nonce?: string | null;
  // call?: {};
  // referenced_message: {};
}
