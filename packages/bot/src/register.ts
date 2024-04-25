import {
  ContextMenuCommandBuilder,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ToAPIApplicationCommandOptions,
} from "@discordjs/builders";
import {
  ApplicationCommandType,
  ChannelType,
  LocaleString,
  LocalizationMap,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import dotenv from "dotenv";
import fs from "fs/promises";
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
] as const;

const messageChannelTypes = [
  ChannelType.GuildAnnouncement,
  ChannelType.GuildText,
  ChannelType.GuildVoice,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.AnnouncementThread,
] as const;

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

async function loadLocalization(lang: string) {
  return (
    JSON.parse(await fs.readFile(`./src/i18n/${lang}.json`, "utf8")).commands ??
    {}
  );
}

function localizeProp(
  languages: Partial<Record<LocaleString, any>>,
  key: string,
  maxLength?: number,
) {
  const drill = key.split(".");
  return Object.fromEntries(
    Object.keys(languages)
      .map((lang) => {
        let final: string | Record<string, any> | undefined;
        for (const drillKey of drill) {
          if (final) {
            if (typeof final !== "string") {
              final = final[drillKey];
            }
            if (typeof final === "string") {
              return [lang, final.slice(0, maxLength)];
            }
          } else {
            final = languages[lang as LocaleString]?.[drillKey];
            if (!final) {
              return [lang, undefined];
            }
          }
        }

        return [lang, undefined];
      })
      .filter((pair) => Boolean(pair[1])),
  ) as LocalizationMap;
}

async function main() {
  const languages = {
    nl: await loadLocalization("nl"),
    fr: await loadLocalization("fr"),
    // "zh-CN": await loadLocalization("zh-CN"),
  };
  const english = { "en-US": await loadLocalization("en") };

  const localize = (key: string) => {
    const ized = localizeProp(languages, key);
    if (Object.keys(ized).length === 0) return null;
    return ized;
  };
  const getEnglish = (key: string) =>
    localizeProp(english, key)["en-US"] ?? "...";

  const addLocalizations = (
    command:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
      | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">,
  ) => {
    const n = command.name;
    command.setDescription(getEnglish(`${n}.description`));
    command.setNameLocalizations(localize(`${n}.name`));
    command.setDescriptionLocalizations(localize(`${n}.description`));
    const doOpts = <
      T extends ReturnType<ToAPIApplicationCommandOptions["toJSON"]>[],
    >(
      opts: T,
      path: string,
      splice: (index: number, newOpt: T[number]) => void,
    ) => {
      let i = -1;
      for (const option of opts) {
        i += 1;
        option.description = getEnglish(
          `${path}.options.${option.name}.description`,
        );
        option.name_localizations = {
          ...localize(`${path}.options.${option.name}.name`),
          ...option.name_localizations,
        };
        option.description_localizations = {
          ...localize(`${path}.options.${option.name}.description`),
          ...option.description_localizations,
        };
        if ("options" in option && option.options) {
          doOpts(
            option.options,
            `${path}.options.${option.name}`,
            (ind, opt) => {
              // @ts-expect-error
              option.options?.splice(ind, 1, opt);
            },
          );
        }

        splice(i, option);
      }
    };
    // They don't give you the full builders /shrug
    doOpts(
      command.options.map((o) => o.toJSON()),
      n,
      (index, option) => {
        command.options.splice(index, 1, {
          toJSON: () => option,
        });
      },
    );
    return command;
  };

  const webhookAutocompleteOption = new SlashCommandStringOption()
    .setName("webhook")
    .setDescription(getEnglish("_options.webhook.description"))
    .setNameLocalizations(localize("_options.webhook.name"))
    .setDescriptionLocalizations(localize("_options.webhook.description"))
    .setRequired(true)
    .setAutocomplete(true);

  const webhookFilterAutocompleteOption = new SlashCommandChannelOption()
    .setName("filter-channel")
    .setDescription(getEnglish("_options.filter-channel.description"))
    .setNameLocalizations(localize("_options.filter-channel.name"))
    .setDescriptionLocalizations(
      localize("_options.filter-channel.description"),
    )
    .setRequired(false)
    .addChannelTypes(...webhookChannelTypes);

  const allAppCommands = [
    addLocalizations(
      new SlashCommandBuilder()
        .setName("buttons")
        .setDescription("...")
        .setDefaultMemberPermissions(
          PermissionFlags.ManageMessages | PermissionFlags.ManageGuild,
        )
        .setDMPermission(false)
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("add")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addChannelOption(
              new SlashCommandChannelOption()
                .setName("channel")
                .setDescription("...")
                .setRequired(false)
                .addChannelTypes(...webhookChannelTypes),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("format")
        .setDescription("...")
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("mention")
            .setDescription("...")
            .addMentionableOption(
              new SlashCommandMentionableOption()
                .setName("target")
                .setDescription("...")
                .setRequired(true),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("channel")
            .setDescription("...")
            .addChannelOption(
              new SlashCommandChannelOption()
                .setName("target")
                .setDescription("...")
                .setRequired(true)
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildForum,
                  ChannelType.GuildMedia,
                  ChannelType.GuildStageVoice,
                  ChannelType.GuildText,
                  ChannelType.GuildVoice,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread,
                ),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("emoji")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("target")
                .setDescription("...")
                .setRequired(true),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder().setName("invite").setDescription("..."),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("triggers")
        .setDescription("...")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlags.ManageGuild)
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("add")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("name")
                .setDescription("...")
                .setMaxLength(100)
                .setRequired(true),
            )
            .addIntegerOption(
              new SlashCommandIntegerOption()
                .setName("event")
                .setDescription("...")
                .setChoices(
                  {
                    name: getEnglish("triggers.options.add.event.choices.0"),
                    name_localizations: localize(
                      "triggers.options.add.event.choices.0",
                    ),
                    value: TriggerEvent.MemberAdd,
                  },
                  {
                    name: getEnglish("triggers.options.add.event.choices.1"),
                    name_localizations: localize(
                      "triggers.options.add.event.choices.1",
                    ),
                    value: TriggerEvent.MemberRemove,
                  },
                )
                .setRequired(true),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("view")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("name")
                .setDescription("...")
                .setMaxLength(100)
                .setRequired(true)
                .setAutocomplete(true),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("webhook")
        .setDescription("...")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlags.ManageWebhooks)
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("create")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("name")
                .setDescription("...")
                .setRequired(true)
                .setMaxLength(80),
            )
            .addAttachmentOption(
              new SlashCommandAttachmentOption()
                .setName("avatar")
                .setDescription("..."),
            )
            .addChannelOption(
              new SlashCommandChannelOption()
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...webhookChannelTypes),
            )
            .addBooleanOption(
              new SlashCommandBooleanOption()
                .setName("show-url")
                .setDescription("..."),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("delete")
            .setDescription("...")
            .addStringOption(webhookAutocompleteOption)
            .addChannelOption(webhookFilterAutocompleteOption),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("info")
            .setDescription("...")
            .addStringOption(webhookAutocompleteOption)
            .addChannelOption(webhookFilterAutocompleteOption)
            .addBooleanOption(
              new SlashCommandBooleanOption()
                .setName("show-url")
                .setDescription("..."),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("welcomer")
        .setDMPermission(false)
        .setDescription("..."),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("help")
        .setDescription("...")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("tag")
            .setDescription("...")
            .setAutocomplete(true)
            .setRequired(true),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("reaction-role")
        .setDescription("...")
        .setDefaultMemberPermissions(
          PermissionFlags.ManageRoles | PermissionFlags.AddReactions,
        )
        .setDMPermission(false)
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("create")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addStringOption(
              new SlashCommandStringOption()
                .setName("emoji")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addRoleOption(
              new SlashCommandRoleOption()
                .setName("role")
                .setRequired(true)
                .setDescription("..."),
            )
            .addChannelOption(
              new SlashCommandChannelOption()
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...messageChannelTypes),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("delete")
            .setDescription("...")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addStringOption(
              new SlashCommandStringOption()
                .setName("emoji")
                .setDescription("...")
                .setAutocomplete(true),
            )
            .addChannelOption(
              new SlashCommandChannelOption()
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...messageChannelTypes),
            ),
        ),
    ),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.components.name"))
      .setNameLocalizations(localize("_ctx.components.name"))
      .setDMPermission(false)
      .setDefaultMemberPermissions(
        PermissionFlags.ManageMessages | PermissionFlags.ManageGuild,
      ),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.edit.name"))
      .setNameLocalizations(localize("_ctx.edit.name"))
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlags.ManageMessages),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.restore.name"))
      .setNameLocalizations(localize("_ctx.restore.name"))
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlags.ViewChannel),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.webhook.name"))
      .setNameLocalizations(localize("_ctx.webhook.name"))
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlags.ViewChannel),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.debug.name"))
      .setNameLocalizations(localize("_ctx.debug.name"))
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlags.ManageMessages),
  ];

  const payload = allAppCommands.map((c) => c.toJSON());
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
}

await main();
