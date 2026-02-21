import type { APIMessage } from "discord-api-types/v10";

export const isThreadMessage = (
  message: Pick<APIMessage, "id" | "channel_id" | "position">,
) =>
  // `position` should only be present for thread messages.
  // If this breaks, reopen this:
  // https://github.com/discord/discord-api-docs/issues/7570
  message.position !== undefined ||
  // starter messages may be missing a position but still share an ID with
  // their parent
  message.id === message.channel_id;

// TODO: probably won't need this since we're using djs/api now
export const getWebhookThreadQuery = (
  message: Pick<APIMessage, "id" | "channel_id" | "position">,
) => {
  const params = new URLSearchParams();
  if (isThreadMessage(message)) {
    params.set("thread_id", message.channel_id);
  }
  return params;
};
