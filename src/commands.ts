import { APIInteractionResponse, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { InteractionContext } from "./interactions.js";
import { addButtonCallback } from "./components/command.js";

export type AppCommandCallback = (ctx: InteractionContext) => Promise<APIInteractionResponse>

export type AppCommand = RESTPostAPIApplicationCommandsJSONBody & {
  handlers: Record<string, AppCommandCallback>
};

export const appCommands: Record<ApplicationCommandType, Record<string, AppCommand>> = {
  [ApplicationCommandType.ChatInput]: {
    buttons: {
      name: 'buttons',
      description: 'Manage buttons',
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "add",
          description: "Add a button",
          options: [{
            type: ApplicationCommandOptionType.String,
            name: "message-link",
            description: "Message link",
            required: true,
          }]
        }
      ],
      handlers: {
        add: addButtonCallback,
      }
    },
  },
  [ApplicationCommandType.Message]: {},
  [ApplicationCommandType.User]: {},
}

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
