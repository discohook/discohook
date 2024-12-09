import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIChatInputApplicationCommandDMInteraction,
  APIChatInputApplicationCommandGuildInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  APIMessageApplicationCommandDMInteraction,
  APIMessageApplicationCommandGuildInteraction,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { deleteComponentChatEntry } from "./commands/components/delete.js";
import { editComponentChatEntry } from "./commands/components/edit.js";
import {
  addComponentChatEntry,
  addComponentMessageAutocomplete,
  addComponentMessageEntry,
  autocompleteMessageCallback,
} from "./commands/components/entry.js";
import { migrateComponentsChatEntry } from "./commands/components/migrate.js";
import { debugMessageCallback } from "./commands/debug.js";
import { deluxeInfoCallback, deluxeSyncCallback } from "./commands/deluxe.js";
import {
  formatChannelCallback,
  formatEmojiCallback,
  formatMentionCallback,
} from "./commands/format.js";
import { helpAutocomplete, helpEntry } from "./commands/help.js";
import {
  idChannelCallback,
  idEmojiCallback,
  idMentionCallback,
} from "./commands/id.js";
import { inviteCallback } from "./commands/invite.js";
import { leaveCommandHandler } from "./commands/leave.js";
import {
  createReactionRoleHandler,
  deleteReactionRoleHandler,
  listReactionRolesHandler,
  messageAndEmojiAutocomplete,
} from "./commands/reactionRoles.js";
import {
  restoreMessageChatInputCallback,
  restoreMessageEntry,
} from "./commands/restore.js";
import {
  addTriggerCallback,
  triggerAutocompleteCallback,
  viewTriggerCallback,
} from "./commands/triggers.js";
import { webhookAutocomplete } from "./commands/webhooks/autocomplete.js";
import { webhookCreateEntry } from "./commands/webhooks/webhookCreate.js";
import { webhookDeleteEntryCallback } from "./commands/webhooks/webhookDelete.js";
import { webhookInfoCallback } from "./commands/webhooks/webhookInfo.js";
import { webhookInfoMsgCallback } from "./commands/webhooks/webhookInfoMsg.js";
import { welcomerDeleteEntry } from "./commands/welcomer/delete.js";
import { welcomerSetupEntry } from "./commands/welcomer/set.js";
import { welcomerViewEntry } from "./commands/welcomer/view.js";
import { InteractionContext } from "./interactions.js";

export type InteractionInstantOrDeferredResponse =
  | APIInteractionResponse
  | [APIInteractionResponse, () => Promise<void>];

export type AppCommandCallbackT<T extends APIInteraction> = (
  ctx: InteractionContext<T>,
) => Promise<InteractionInstantOrDeferredResponse>;
export type ChatInputAppCommandCallback<
  GuildOnly extends boolean = false,
  DMOnly extends boolean = false,
> = AppCommandCallbackT<
  GuildOnly extends true
    ? APIChatInputApplicationCommandGuildInteraction
    : DMOnly extends true
      ? APIChatInputApplicationCommandDMInteraction
      : APIChatInputApplicationCommandInteraction
>;
export type MessageAppCommandCallback<
  T extends
    | APIMessageApplicationCommandDMInteraction
    | APIMessageApplicationCommandGuildInteraction = APIMessageApplicationCommandGuildInteraction,
> = AppCommandCallbackT<T>;
export type UserAppCommandCallback =
  AppCommandCallbackT<APIUserApplicationCommandInteraction>;

type AutocompleteChoices = NonNullable<
  APIApplicationCommandAutocompleteResponse["data"]["choices"]
>;
export type AppCommandAutocompleteCallback = (
  ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction>,
) => Promise<AutocompleteChoices>;

export type AppCommandCallback =
  | ChatInputAppCommandCallback<boolean>
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
        edit: editComponentChatEntry,
        delete: deleteComponentChatEntry,
        migrate: migrateComponentsChatEntry,
      },
      autocompleteHandlers: {
        add: addComponentMessageAutocomplete,
        edit: addComponentMessageAutocomplete,
        delete: addComponentMessageAutocomplete,
        migrate: addComponentMessageAutocomplete,
      },
    },
    format: {
      handlers: {
        mention: formatMentionCallback,
        channel: formatChannelCallback,
        emoji: formatEmojiCallback,
      },
    },
    id: {
      handlers: {
        mention: idMentionCallback,
        channel: idChannelCallback,
        emoji: idEmojiCallback,
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
        info: webhookInfoCallback,
        delete: webhookDeleteEntryCallback,
      },
      autocompleteHandlers: {
        delete: webhookAutocomplete,
        info: webhookAutocomplete,
      },
    },
    welcomer: {
      handlers: {
        set: welcomerSetupEntry,
        view: welcomerViewEntry,
        delete: welcomerDeleteEntry,
      },
      autocompleteHandlers: {
        set: webhookAutocomplete,
      },
    },
    help: {
      handlers: { BASE: helpEntry },
      autocompleteHandlers: { BASE: helpAutocomplete },
    },
    "reaction-role": {
      handlers: {
        create: createReactionRoleHandler,
        delete: deleteReactionRoleHandler,
        list: listReactionRolesHandler,
      },
      autocompleteHandlers: {
        create: messageAndEmojiAutocomplete,
        // I think it would be cool to have the delete `message` results
        // filtered by messages that have registered reaction roles, but I
        // can't think of a particularly efficient way to do that right now
        delete: messageAndEmojiAutocomplete,
        list: autocompleteMessageCallback,
      },
    },
    restore: {
      handlers: {
        BASE: restoreMessageChatInputCallback,
      },
      autocompleteHandlers: {
        BASE: autocompleteMessageCallback,
      },
    },
    deluxe: {
      handlers: {
        info: deluxeInfoCallback,
        sync: deluxeSyncCallback,
      },
    },
    // dev server
    leave: {
      handlers: { BASE: leaveCommandHandler },
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
      handlers: {
        BASE: restoreMessageEntry,
      },
    },
    "webhook info": {
      handlers: {
        BASE: webhookInfoMsgCallback,
      },
    },
    debug: {
      handlers: {
        BASE: debugMessageCallback,
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
