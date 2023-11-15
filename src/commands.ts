import { APIInteractionResponse } from "discord-api-types/v10";

export const AWW_COMMAND = {
  name: 'awwww',
  description: 'Drop some cuteness on this channel.',
};

export const INVITE_COMMAND = {
  name: 'invite',
  description: 'Get an invite link to add the bot to your server',
};

export type DiscordInteractionResponse = APIInteractionResponse | { error: string; status?: number };

class JsonResponse extends Response {
  constructor(body: DiscordInteractionResponse, init?: ResponseInit | null) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

export const respond = (body: DiscordInteractionResponse) => {
  return new JsonResponse(body, 'error' in body ? { status: body.status ?? 400 } : null);
}
