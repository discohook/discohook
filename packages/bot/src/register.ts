import { ApplicationCommandOptionChannelTypesMixin } from "@discordjs/builders";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import dotenv from "dotenv";
import process from "node:process";
import { TriggerEvent } from "store/src/types";

/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */

dotenv.config({ path: ".dev.vars" });

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

export const allAppCommands: Record<
  ApplicationCommandType,
  Record<string, RESTPostAPIApplicationCommandsJSONBody>
> = {
  [ApplicationCommandType.ChatInput]: {
    buttons: {
      name: "buttons",
      description: "Add, remove, and manage buttons",
      default_member_permissions: String(
        PermissionFlags.ManageMessages | PermissionFlags.ManageGuild,
      ),
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "add",
          description: "Add a button",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "message",
              description:
                "Add a button to this message. A message link is also accepted here",
              required: true,
              autocomplete: true,
            },
            {
              type: ApplicationCommandOptionType.Channel,
              name: "channel",
              description:
                "The channel that the message is in, for autocomplete results",
              required: false,
              channel_types: webhookChannelTypes,
            },
          ],
        },
      ],
      dm_permission: false,
    },
    invite: {
      name: "invite",
      name_localizations: {
        fr: "ajouter",
      },
      description: "Invite URL for this bot",
    },
    triggers: {
      name: "triggers",
      description: "Set up triggers to respond to events in your server",
      dm_permission: false,
      default_member_permissions: String(PermissionFlags.ManageGuild),
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "add",
          description: "Add a new trigger",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              description: "The name of the trigger",
              max_length: 100,
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Integer,
              name: "event",
              description: "The event that will set off the trigger",
              choices: [
                {
                  name: "Member Join",
                  value: TriggerEvent.MemberAdd,
                },
                {
                  name: "Member Remove",
                  value: TriggerEvent.MemberRemove,
                },
              ] as { name: string; value: TriggerEvent }[],
              required: true,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "view",
          description: "View & manage a trigger",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              description: "The name of the trigger",
              max_length: 100,
              required: true,
              autocomplete: true,
            },
          ],
        },
      ],
    },
    webhook: {
      name: "webhook",
      description: "Manage webhooks",
      default_member_permissions: String(PermissionFlags.ManageWebhooks),
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "create",
          name_localizations: {
            fr: "créer",
          },
          description: "Create a webhook",
          description_localizations: {
            fr: "Créer un webhook",
          },
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              name_localizations: {
                fr: "nom",
              },
              description: "The webhook's name",
              description_localizations: {
                fr: "Le nom du webhook",
              },
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
              name_localizations: {
                fr: "salon",
              },
              description: "The channel to create the webhook in",
              description_localizations: {
                fr: "Le canal dans lequel créer le webhook",
              },
              required: false,
              channel_types: webhookChannelTypes,
            },
            {
              type: ApplicationCommandOptionType.Boolean,
              name: "show-url",
              description:
                "Only enable this if you need the URL for an external application",
              required: false,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "delete",
          name_localizations: {
            fr: "supprimer",
          },
          description: "Delete a webhook",
          description_localizations: {
            fr: "Supprimer un webhook",
          },
          options: [webhookAutocompleteOption, webhookFilterAutocompleteOption],
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
              description:
                'Whether to skip the "Get URL" step. This makes the message hidden',
              required: false,
            },
          ],
        },
      ],
      dm_permission: false,
    },
    welcomer: {
      name: "welcomer",
      description: "Welcomer functionality has been moved to /triggers!",
      dm_permission: false,
    },
    help: {
      name: "help",
      description: "Get help with various topics",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "tag",
          description: "The tag to get help for",
          autocomplete: true,
          required: true,
        },
      ],
    },
  },
  [ApplicationCommandType.Message]: {
    "buttons & components": {
      // Add, remove, edit, relocate within msg, move all buttons to diff message
      type: ApplicationCommandType.Message,
      name: "Buttons & Components",
      default_member_permissions: String(
        PermissionFlags.ManageMessages | PermissionFlags.ManageGuild,
      ),
      dm_permission: false,
      // description: "Add, remove, and manage buttons",
    },
    "quick edit": {
      type: ApplicationCommandType.Message,
      name: "Quick Edit",
      default_member_permissions: String(PermissionFlags.ManageMessages),
      dm_permission: false,
      // description: "Quickly edit a webhook message",
    },
    restore: {
      type: ApplicationCommandType.Message,
      name: "Restore",
      default_member_permissions: String(PermissionFlags.ViewChannel),
      dm_permission: false,
      // description: "Copy a message into Discohook",
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
    },
  },
  [ApplicationCommandType.User]: {},
};

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error("The DISCORD_TOKEN environment variable is required.");
}
if (!applicationId) {
  throw new Error(
    "The DISCORD_APPLICATION_ID environment variable is required.",
  );
}

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */
const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

const payload = [];
for (const [type, commands] of Object.entries(allAppCommands)) {
  for (const command of Object.values(commands)) {
    const c = {
      type: Number(type),
      ...command,
      handlers: {},
    };
    payload.push(c);
  }
}

const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${token}`,
  },
  method: "PUT",
  body: JSON.stringify(payload),
});

if (response.ok) {
  console.log("Registered all commands");
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
} else {
  console.error("Error registering commands");
  let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;
  try {
    const error = await response.text();
    if (error) {
      errorText = `${errorText} \n\n ${error}`;
    }
  } catch (err) {
    console.error("Error reading body from request:", err);
  }
  console.error(errorText);
}
