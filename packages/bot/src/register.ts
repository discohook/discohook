import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ToAPIApplicationCommandOptions,
} from "@discordjs/builders";
import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  InteractionContextType,
  LocaleString,
  LocalizationMap,
  RESTPutAPIApplicationGuildCommandsJSONBody,
  RouteBases,
  Routes,
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
  ChannelType.GuildMedia,
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
const url = RouteBases.api + Routes.applicationCommands(applicationId);

const loadLocalization = async (lang: string) =>
  JSON.parse(await fs.readFile(`./src/i18n/${lang}.json`, "utf8")).commands ??
  {};

const localizeProp = (
  languages: Partial<Record<LocaleString, any>>,
  key: string,
  maxLength?: number,
) => {
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
};

const main = async () => {
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
      | SlashCommandOptionsOnlyBuilder
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

  const welcomerEventChoices: APIApplicationCommandOptionChoice<number>[] = [
    {
      name: getEnglish("welcomer.options.set.options.event.choices.0"),
      name_localizations: localize(
        "welcomer.options.set.options.event.choices.0",
      ),
      value: TriggerEvent.MemberAdd,
    },
    {
      name: getEnglish("welcomer.options.set.options.event.choices.1"),
      name_localizations: localize(
        "welcomer.options.set.options.event.choices.1",
      ),
      value: TriggerEvent.MemberRemove,
    },
  ];

  const allAppCommands = [
    addLocalizations(
      new SlashCommandBuilder()
        .setName("buttons")
        .setDescription("...")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(
          PermissionFlags.ManageMessages | PermissionFlags.ManageWebhooks,
        )
        .addSubcommand((opt) =>
          opt
            .setName("add")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .setRequired(false)
                .addChannelTypes(...webhookChannelTypes),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("edit")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .setRequired(false)
                .addChannelTypes(...webhookChannelTypes),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("delete")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .setRequired(false)
                .addChannelTypes(...webhookChannelTypes),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("migrate")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .setRequired(false)
                .addChannelTypes(...webhookChannelTypes),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("deluxe")
        .setDescription("...")
        .setContexts(
          InteractionContextType.Guild,
          InteractionContextType.BotDM,
          InteractionContextType.PrivateChannel,
        )
        .addSubcommand((c) => c.setName("info").setDescription("..."))
        .addSubcommand((c) => c.setName("sync").setDescription("...")),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("format")
        .setDescription("...")
        .setContexts(
          InteractionContextType.Guild,
          InteractionContextType.BotDM,
          InteractionContextType.PrivateChannel,
        )
        .addSubcommand((opt) =>
          opt
            .setName("mention")
            .setDescription("...")
            .addMentionableOption((opt) =>
              opt.setName("target").setDescription("...").setRequired(true),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("channel")
            .setDescription("...")
            .addChannelOption((opt) =>
              opt
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
        .addSubcommand((opt) =>
          opt
            .setName("emoji")
            .setDescription("...")
            .addStringOption((opt) =>
              opt.setName("target").setDescription("...").setRequired(true),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("id")
        .setDescription("...")
        .setContexts(
          InteractionContextType.Guild,
          InteractionContextType.BotDM,
          InteractionContextType.PrivateChannel,
        )
        .addSubcommand((opt) =>
          opt
            .setName("mention")
            .setDescription("...")
            .addMentionableOption((opt) =>
              opt.setName("target").setDescription("...").setRequired(true),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("channel")
            .setDescription("...")
            .addChannelOption((opt) =>
              opt.setName("target").setDescription("...").setRequired(true),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("emoji")
            .setDescription("...")
            .addStringOption((opt) =>
              opt.setName("target").setDescription("...").setRequired(true),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("invite")
        .setDescription("...")
        .setContexts(
          InteractionContextType.Guild,
          InteractionContextType.BotDM,
          InteractionContextType.PrivateChannel,
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("triggers")
        .setDescription("...")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlags.ManageGuild)
        .addSubcommand((opt) =>
          opt
            .setName("add")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("name")
                .setDescription("...")
                .setMaxLength(100)
                .setRequired(true),
            )
            .addIntegerOption((opt) =>
              opt
                .setName("event")
                .setDescription("...")
                .setChoices(
                  {
                    name: getEnglish(
                      "triggers.options.add.options.event.choices.0",
                    ),
                    name_localizations: localize(
                      "triggers.options.add.options.event.choices.0",
                    ),
                    value: TriggerEvent.MemberAdd,
                  },
                  {
                    name: getEnglish(
                      "triggers.options.add.options.event.choices.1",
                    ),
                    name_localizations: localize(
                      "triggers.options.add.options.event.choices.1",
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
            .addStringOption((opt) =>
              opt
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
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlags.ManageWebhooks)
        .addSubcommand((opt) =>
          opt
            .setName("create")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("name")
                .setDescription("...")
                .setRequired(true)
                .setMaxLength(80),
            )
            .addAttachmentOption((opt) =>
              opt.setName("avatar").setDescription("..."),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...webhookChannelTypes),
            )
            .addBooleanOption((opt) =>
              opt.setName("show-url").setDescription("..."),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("delete")
            .setDescription("...")
            .addStringOption(webhookAutocompleteOption)
            .addChannelOption(webhookFilterAutocompleteOption),
        )
        .addSubcommand((opt) =>
          opt
            .setName("info")
            .setDescription("...")
            .addStringOption(webhookAutocompleteOption)
            .addChannelOption(webhookFilterAutocompleteOption)
            .addBooleanOption((opt) =>
              opt.setName("show-url").setDescription("..."),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("welcomer")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlags.ManageGuild)
        .setDescription("...")
        .addSubcommand((o) =>
          o
            .setName("set")
            .setDescription("...")
            .addIntegerOption((o) =>
              o
                .setName("event")
                .setDescription("...")
                .addChoices(welcomerEventChoices)
                .setRequired(true),
            )
            .addChannelOption((o) =>
              o
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...messageChannelTypes),
            )
            .addStringOption((o) =>
              o.setName("webhook").setDescription("...").setAutocomplete(true),
            )
            .addStringOption((o) =>
              o
                .setName("share-link")
                .setDescription("...")
                .setMinLength(30)
                .setMaxLength(40),
            )
            .addIntegerOption((o) =>
              o
                .setName("delete-after")
                .setDescription("...")
                .setMinValue(0)
                .setMaxValue(60),
            ),
        )
        .addSubcommand((o) =>
          o
            .setName("view")
            .setDescription("...")
            .addIntegerOption((o) =>
              o
                .setName("event")
                .setDescription("...")
                .addChoices(welcomerEventChoices)
                .setRequired(true),
            ),
        )
        .addSubcommand((o) =>
          o
            .setName("delete")
            .setDescription("...")
            .addIntegerOption((o) =>
              o
                .setName("event")
                .setDescription("...")
                .addChoices(welcomerEventChoices)
                .setRequired(true),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("help")
        .setContexts(
          InteractionContextType.Guild,
          InteractionContextType.BotDM,
          InteractionContextType.PrivateChannel,
        )
        .setDescription("...")
        .addStringOption((opt) =>
          opt
            .setName("tag")
            .setDescription("...")
            .setAutocomplete(true)
            .setRequired(true),
        )
        .addUserOption((opt) =>
          opt.setName("mention").setDescription("...").setRequired(false),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("reaction-role")
        .setDescription("...")
        .setDefaultMemberPermissions(
          PermissionFlags.ManageRoles | PermissionFlags.AddReactions,
        )
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((opt) =>
          opt
            .setName("create")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addStringOption((opt) =>
              opt
                .setName("emoji")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addRoleOption((opt) =>
              opt.setName("role").setRequired(true).setDescription("..."),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...messageChannelTypes),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("delete")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addStringOption((opt) =>
              opt.setName("emoji").setDescription("...").setAutocomplete(true),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...messageChannelTypes),
            ),
        )
        .addSubcommand((opt) =>
          opt
            .setName("list")
            .setDescription("...")
            .addStringOption((opt) =>
              opt
                .setName("message")
                .setDescription("...")
                .setRequired(true)
                .setAutocomplete(true),
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("...")
                .addChannelTypes(...messageChannelTypes),
            ),
        ),
    ),
    addLocalizations(
      new SlashCommandBuilder()
        .setName("restore")
        .setDescription("...")
        .setDefaultMemberPermissions(PermissionFlags.ViewChannel)
        .setContexts(InteractionContextType.Guild)
        .addStringOption((opt) =>
          opt
            .setName("message")
            .setDescription("...")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addStringOption((opt) =>
          opt
            .setName("mode")
            .setDescription("...")
            .setRequired(false)
            .setChoices(
              {
                name: getEnglish("restore.options.mode.choices.edit"),
                name_localizations: localize(
                  "restore.options.mode.choices.edit",
                ),
                value: "edit",
              },
              // {
              //   name: getEnglish("restore.options.mode.choices.link"),
              //   name_localizations: localize(
              //     "restore.options.mode.choices.link",
              //   ),
              //   value: "link",
              // },
            ),
        ),
    ),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.components.name"))
      .setNameLocalizations(localize("_ctx.components.name"))
      .setContexts(InteractionContextType.Guild)
      .setDefaultMemberPermissions(
        PermissionFlags.ManageMessages | PermissionFlags.ManageWebhooks,
      ),
    // new ContextMenuCommandBuilder()
    //   .setType(ApplicationCommandType.Message)
    //   .setName(getEnglish("_ctx.edit.name"))
    //   .setNameLocalizations(localize("_ctx.edit.name"))
    //   .setContexts(InteractionContextType.Guild)
    //   .setDefaultMemberPermissions(
    //     PermissionFlags.ManageMessages | PermissionFlags.ManageWebhooks,
    //   ),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.restore.name"))
      .setNameLocalizations(localize("_ctx.restore.name"))
      .setContexts(InteractionContextType.Guild)
      .setDefaultMemberPermissions(PermissionFlags.ViewChannel),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.webhook.name"))
      .setNameLocalizations(localize("_ctx.webhook.name"))
      .setContexts(InteractionContextType.Guild)
      .setDefaultMemberPermissions(PermissionFlags.ViewChannel),
    new ContextMenuCommandBuilder()
      .setType(ApplicationCommandType.Message)
      .setName(getEnglish("_ctx.debug.name"))
      .setNameLocalizations(localize("_ctx.debug.name"))
      .setContexts(InteractionContextType.Guild)
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

  if (process.env.DEV_GUILD_ID) {
    await fetch(
      RouteBases.api +
        Routes.applicationGuildCommands(
          applicationId,
          process.env.DEV_GUILD_ID,
        ),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${token}`,
        },
        method: "PUT",
        body: JSON.stringify([
          {
            type: ApplicationCommandType.ChatInput,
            name: "leave",
            description: "Leave a guild (dangerous!)",
            options: [
              {
                type: ApplicationCommandOptionType.String,
                name: "guild-id",
                description: "The guild ID to leave",
                required: true,
              },
              {
                type: ApplicationCommandOptionType.String,
                name: "reason",
                description: "The reason for leaving",
                required: true,
              },
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "send-reason-message",
                description: "Whether to send a message to the owner",
              },
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "ban",
                description:
                  "Whether to ban the server so the bot cannot be re-added",
              },
            ],
          },
        ] satisfies RESTPutAPIApplicationGuildCommandsJSONBody),
      },
    );
  }
};

await main();
