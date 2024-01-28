import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  APIMessageApplicationCommandInteraction,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType,
  MessageFlags
} from "discord-api-types/v10";
import {
  addComponentChatAutocomplete,
  addComponentChatEntry,
  addComponentMessageEntry,
} from "./commands/components/entry.js";
import { helpAutocomplete, helpEntry } from "./commands/help.js";
import { inviteCallback } from "./commands/invite.js";
import { addTriggerCallback, triggerAutocompleteCallback, viewTriggerCallback } from "./commands/triggers.js";
import { webhookAutocomplete } from "./commands/webhooks/autocomplete.js";
import { webhookCreateEntry } from "./commands/webhooks/webhookCreate.js";
import { webhookInfoMsgCallback } from "./commands/webhooks/webhookInfoMsg.js";
import { InteractionContext } from "./interactions.js";

export type AppCommandCallbackT<T extends APIInteraction> = (
  ctx: InteractionContext<T>,
) => Promise<
  APIInteractionResponse | [APIInteractionResponse, () => Promise<void>]
>;
export type ChatInputAppCommandCallback =
  AppCommandCallbackT<APIChatInputApplicationCommandInteraction>;
export type MessageAppCommandCallback =
  AppCommandCallbackT<APIMessageApplicationCommandInteraction>;
export type UserAppCommandCallback =
  AppCommandCallbackT<APIUserApplicationCommandInteraction>;

type AutocompleteChoices = NonNullable<
  APIApplicationCommandAutocompleteResponse["data"]["choices"]
>;
export type AppCommandAutocompleteCallback = (
  ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction>,
) => Promise<AutocompleteChoices>;

export type AppCommandCallback =
  | ChatInputAppCommandCallback
  | MessageAppCommandCallback
  | UserAppCommandCallback;

export type AppCommandHandlers = {
  handlers: Record<string, AppCommandCallback>;
  autocompleteHandlers?: Record<string, AppCommandAutocompleteCallback>;
};

export const appCommands: Record<
  ApplicationCommandType,
  Record<string, AppCommandHandlers>
> = {
  [ApplicationCommandType.ChatInput]: {
    buttons: {
      handlers: {
        add: addComponentChatEntry,
      },
      autocompleteHandlers: {
        add: addComponentChatAutocomplete,
      },
    },
    invite: {
      handlers: {
        BASE: inviteCallback,
      },
    },
    triggers: {
      handlers: {
        add: addTriggerCallback,
        view: viewTriggerCallback,
      },
      autocompleteHandlers: {
        view: triggerAutocompleteCallback,
      },
    },
    webhook: {
      handlers: {
        create: webhookCreateEntry,
      },
      autocompleteHandlers: {
        delete: webhookAutocomplete,
        info: webhookAutocomplete,
      },
    },
    welcomer: {
      handlers: {
        BASE: (async (ctx) =>
          ctx.reply({
            content:
              "In order to set up a welcomer, please use the **/triggers** command.",
            flags: MessageFlags.Ephemeral,
          })) as ChatInputAppCommandCallback,
      },
    },
    help: {
      handlers: { BASE: helpEntry },
      autocompleteHandlers: { BASE: helpAutocomplete },
    },
  },
  [ApplicationCommandType.Message]: {
    "buttons & components": {
      handlers: {
        BASE: addComponentMessageEntry,
      },
    },
    "quick edit": {
      handlers: {},
    },
    restore: {
      handlers: {},
    },
    // repeat: {
    //   handlers: {
    //   },
    // },
    "webhook info": {
      handlers: {
        BASE: webhookInfoMsgCallback,
      },
    },
  },
  [ApplicationCommandType.User]: {},
};

export type DiscordInteractionResponse =
  | APIInteractionResponse
  | { error: string; status?: number };

class JsonResponse extends Response {
  constructor(body: DiscordInteractionResponse, init?: ResponseInit | null) {
    const jsonBody = JSON.stringify(body);
    const responseInit = init || {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    };
    super(jsonBody, responseInit);
  }
}

export const respond = (body: DiscordInteractionResponse) => {
  return new JsonResponse(
    body,
    "error" in body ? { status: body.status ?? 400 } : null,
  );
};
