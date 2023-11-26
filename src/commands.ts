import { APIApplicationCommandAutocompleteInteraction, APIApplicationCommandAutocompleteResponse, APIChatInputApplicationCommandInteraction, APIInteraction, APIInteractionResponse, APIMessageApplicationCommandInteraction, APIUserApplicationCommandInteraction, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { InteractionContext } from "./interactions.js";
import { addComponentChatEntry, addComponentMessageEntry } from "./commands/components/command.js";
import { webhookInfoMsgCallback } from "./commands/webhooks/webhookInfoMsg.js";
import { PermissionFlags } from "discord-bitflag";
import { inviteCallback } from "./commands/invite.js";

export type AppCommandCallbackT<T extends APIInteraction> = (ctx: InteractionContext<T>) => Promise<APIInteractionResponse>
export type ChatInputAppCommandCallback = AppCommandCallbackT<APIChatInputApplicationCommandInteraction>;
export type MessageAppCommandCallback = AppCommandCallbackT<APIMessageApplicationCommandInteraction>;
export type UserAppCommandCallback = AppCommandCallbackT<APIUserApplicationCommandInteraction>;

type Choices = NonNullable<APIApplicationCommandAutocompleteResponse["data"]["choices"]>;
export type AppCommandAutocompleteCallback = (ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction>) => Promise<Choices>

export type AppCommandCallback =
  | ChatInputAppCommandCallback
  | MessageAppCommandCallback
  | UserAppCommandCallback

export type AppCommand = RESTPostAPIApplicationCommandsJSONBody & {
  handlers: Record<string, AppCommandCallback>;
  autocompleteHandlers?: Record<string, AppCommandAutocompleteCallback>;
};

export const appCommands: Record<ApplicationCommandType, Record<string, AppCommand>> = {
  [ApplicationCommandType.ChatInput]: {
    buttons: {
      name: "buttons",
      description: "Add, remove, and manage buttons",
      default_member_permissions: String(PermissionFlags.ManageMessages | PermissionFlags.ManageGuild),
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "add",
          description: "Add a button",
          options: [{
            type: ApplicationCommandOptionType.String,
            name: "message-link",
            description: "Add a button to this message",
            required: true,
          }]
        }
      ],
      handlers: {
        add: addComponentChatEntry,
      },
    },
    invite: {
      name: "invite",
      description: "Invite URL for this bot",
      handlers: {
        BASE: inviteCallback,
      }
    },
  },
  [ApplicationCommandType.Message]: {
    "buttons & components": {
      type: ApplicationCommandType.Message,
      name: "Buttons & Components",
      default_member_permissions: String(PermissionFlags.ManageMessages | PermissionFlags.ManageGuild),
      // description: "Add, remove, and manage buttons",
      handlers: {
        BASE: addComponentMessageEntry,
      },
    },
    "quick edit": {
      type: ApplicationCommandType.Message,
      name: "Quick Edit",
      default_member_permissions: String(PermissionFlags.ManageMessages),
      // description: "Quickly edit a webhook message",
      handlers: {
      },
    },
    restore: {
      type: ApplicationCommandType.Message,
      name: "Restore",
      default_member_permissions: String(PermissionFlags.ViewChannel),
      // description: "Copy a message into Boogiehook or Discohook",
      handlers: {
      },
    },
    // repeat: {
    //   name: "Repeat",
    //   description: "Send an identical copy of the message in the same channel or a different one",
    //   handlers: {
    //   },
    // },
    "webhook info": {
      type: ApplicationCommandType.Message,
      name: "Webhook Info",
      default_member_permissions: String(PermissionFlags.ViewChannel),
      // description: "Show information about the webhook that sent a message",
      handlers: {
        BASE: webhookInfoMsgCallback,
      },
    },
  },
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
