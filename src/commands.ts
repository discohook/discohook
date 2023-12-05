import { APIApplicationCommandAutocompleteInteraction, APIApplicationCommandAutocompleteResponse, APIChatInputApplicationCommandInteraction, APIInteraction, APIInteractionResponse, APIMessageApplicationCommandInteraction, APIUserApplicationCommandInteraction, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { InteractionContext } from "./interactions.js";
import { addComponentChatAutocomplete, addComponentChatEntry, addComponentMessageEntry } from "./commands/components/entry.js";
import { webhookInfoMsgCallback } from "./commands/webhooks/webhookInfoMsg.js";
import { PermissionFlags } from "discord-bitflag";
import { inviteCallback } from "./commands/invite.js";
import { webhookCreateEntry } from "./commands/webhooks/webhookCreate.js";
import { helpAutocomplete, helpEntry } from "./commands/help.js";
import { webhookAutocomplete } from "./commands/webhooks/autocomplete.js";
import { ApplicationCommandOptionChannelTypesMixin } from "@discordjs/builders";

export type AppCommandCallbackT<T extends APIInteraction> = (ctx: InteractionContext<T>) => Promise<APIInteractionResponse | [APIInteractionResponse, () => Promise<void>]>
export type ChatInputAppCommandCallback = AppCommandCallbackT<APIChatInputApplicationCommandInteraction>;
export type MessageAppCommandCallback = AppCommandCallbackT<APIMessageApplicationCommandInteraction>;
export type UserAppCommandCallback = AppCommandCallbackT<APIUserApplicationCommandInteraction>;

type AutocompleteChoices = NonNullable<APIApplicationCommandAutocompleteResponse["data"]["choices"]>;
export type AppCommandAutocompleteCallback = (ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction>) => Promise<AutocompleteChoices>

export type AppCommandCallback =
  | ChatInputAppCommandCallback
  | MessageAppCommandCallback
  | UserAppCommandCallback

export type AppCommand = RESTPostAPIApplicationCommandsJSONBody & {
  handlers: Record<string, AppCommandCallback>;
  autocompleteHandlers?: Record<string, AppCommandAutocompleteCallback>;
};

const webhookChannelTypes = [
  ChannelType.GuildAnnouncement,
  ChannelType.GuildText,
  ChannelType.GuildVoice,
  ChannelType.GuildForum,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.AnnouncementThread,
] as ApplicationCommandOptionChannelTypesMixin["channel_types"];

const webhookAutocompleteOption = {
  type: ApplicationCommandOptionType.String,
  name: "webhook",
  description: "The target webhook",
  autocomplete: true,
  required: true,
} as const;

const webhookFilterAutocompleteOption = {
  type: ApplicationCommandOptionType.Channel,
  name: "filter-channel",
  description: "The channel to filter autocomplete results with",
  required: false,
  channel_types: webhookChannelTypes,
} as const;

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
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "message",
              description: "Add a button to this message. A message link is also accepted here",
              required: true,
              autocomplete: true,
            },
            {
              type: ApplicationCommandOptionType.Channel,
              name: "channel",
              description: "The channel that the message is in, for autocomplete results",
              required: false,
              channel_types: webhookChannelTypes,
            },
          ]
        }
      ],
      dm_permission: false,
      handlers: {
        add: addComponentChatEntry,
      },
      autocompleteHandlers: {
        add: addComponentChatAutocomplete,
      },
    },
    invite: {
      name: "invite",
      description: "Invite URL for this bot",
      handlers: {
        BASE: inviteCallback,
      }
    },
    webhook: {
      name: "webhook",
      description: "Manage webhooks",
      default_member_permissions: String(PermissionFlags.ManageWebhooks),
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "create",
          description: "Create a webhook",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              description: "The webhook's name",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Attachment,
              name: "avatar",
              description: "The webhook's avatar",
              required: false,
            },
            {
              type: ApplicationCommandOptionType.Channel,
              name: "channel",
              description: "The channel to create the webhook in",
              required: false,
              channel_types: webhookChannelTypes,
            },
            {
              type: ApplicationCommandOptionType.Boolean,
              name: "show-url",
              description: "Only enable this if you need the URL for an external application",
              required: false,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "delete",
          description: "Delete a webhook",
          options: [
            webhookAutocompleteOption,
            webhookFilterAutocompleteOption,
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "info",
          description: "Get info on a webhook",
          options: [
            webhookAutocompleteOption,
            webhookFilterAutocompleteOption,
            {
              type: ApplicationCommandOptionType.Boolean,
              name: "show-url",
              description: "Whether to skip the \"Get URL\" step. This makes the message hidden",
              required: false,
            },
          ],
        },
      ],
      dm_permission: false,
      handlers: {
        create: webhookCreateEntry,
      },
      autocompleteHandlers: {
        delete: webhookAutocomplete,
        info: webhookAutocomplete,
      },
    },
    help: {
      name: "help",
      description: "Get help with various topics",
      options: [{
        type: ApplicationCommandOptionType.String,
        name: "tag",
        description: "The tag to get help for",
        autocomplete: true,
        required: true,
      }],
      handlers: { BASE: helpEntry },
      autocompleteHandlers: { BASE: helpAutocomplete },
    }
  },
  [ApplicationCommandType.Message]: {
    "buttons & components": {
      // Add, remove, edit, relocate within msg, move all buttons to diff message
      type: ApplicationCommandType.Message,
      name: "Buttons & Components",
      default_member_permissions: String(PermissionFlags.ManageMessages | PermissionFlags.ManageGuild),
      dm_permission: false,
      // description: "Add, remove, and manage buttons",
      handlers: {
        BASE: addComponentMessageEntry,
      },
    },
    "quick edit": {
      type: ApplicationCommandType.Message,
      name: "Quick Edit",
      default_member_permissions: String(PermissionFlags.ManageMessages),
      dm_permission: false,
      // description: "Quickly edit a webhook message",
      handlers: {
      },
    },
    restore: {
      type: ApplicationCommandType.Message,
      name: "Restore",
      default_member_permissions: String(PermissionFlags.ViewChannel),
      dm_permission: false,
      // description: "Copy a message into Boogiehook or Discohook",
      handlers: {
      },
    },
    // repeat: {
    //   name: "Repeat",
    //   dm_permission: false,
    //   description: "Send an identical copy of the message in the same channel or a different one",
    //   handlers: {
    //   },
    // },
    "webhook info": {
      type: ApplicationCommandType.Message,
      name: "Webhook Info",
      default_member_permissions: String(PermissionFlags.ViewChannel),
      dm_permission: false,
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
