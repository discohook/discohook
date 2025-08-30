import type {
  APIApplicationCommandInteractionDataOption,
  ToEventProps,
} from "@discordjs/core";
import {
  type APIApplicationCommandAutocompleteInteraction,
  type APIApplicationCommandAutocompleteResponse,
  type APIChatInputApplicationCommandDMInteraction,
  type APIChatInputApplicationCommandGuildInteraction,
  type APIChatInputApplicationCommandInteraction,
  type APIInteraction,
  type APIMessageApplicationCommandDMInteraction,
  type APIMessageApplicationCommandGuildInteraction,
  type APIUserApplicationCommandInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionType,
  MessageFlags,
} from "discord-api-types/v10";
import { sendErrorMessage } from "../errors.js";
// import {
//   grantDeluxeCommandHandler,
//   leaveCommandHandler,
//   revokeDeluxeCommandHandler,
// } from "./commands/admin.js";
// import { deleteComponentChatEntry } from "./commands/components/delete.js";
// import { editComponentChatEntry } from "./commands/components/edit.js";
// import {
//   addComponentChatEntry,
//   addComponentMessageAutocomplete,
//   addComponentMessageEntry,
//   autocompleteMessageCallback,
// } from "./commands/components/entry.js";
// import { migrateComponentsChatEntry } from "./commands/components/migrate.js";
// import { debugMessageCallback } from "./commands/debug.js";
// import { deluxeInfoCallback, deluxeSyncCallback } from "./commands/deluxe.js";
// import {
//   formatChannelCallback,
//   formatEmojiCallback,
//   formatMentionCallback,
// } from "./commands/format.js";
// import {
//   idChannelCallback,
//   idEmojiCallback,
//   idMentionCallback,
// } from "./commands/id.js";
// import { inviteCallback } from "./commands/invite.js";
// import { quickEditMessageEntry } from "./commands/quick-edit/entry.js";
// import {
//   createReactionRoleHandler,
//   deleteReactionRoleHandler,
//   listReactionRolesHandler,
//   messageAndEmojiAutocomplete,
// } from "./commands/reactionRoles.js";
// import {
//   restoreMessageChatInputCallback,
//   restoreMessageEntry,
// } from "./commands/restore.js";
// import {
//   addTriggerCallback,
//   triggerAutocompleteCallback,
//   viewTriggerCallback,
// } from "./commands/triggers.js";
// import { webhookAutocomplete } from "./commands/webhooks/autocomplete.js";
// import { webhookCreateEntry } from "./commands/webhooks/webhookCreate.js";
// import { webhookDeleteEntryCallback } from "./commands/webhooks/webhookDelete.js";
// import { webhookInfoCallback } from "./commands/webhooks/webhookInfo.js";
// import { webhookInfoMsgCallback } from "./commands/webhooks/webhookInfoMsg.js";
// import { welcomerDeleteEntry } from "./commands/welcomer/delete.js";
// import { welcomerSetupEntry } from "./commands/welcomer/set.js";
// import { welcomerViewEntry } from "./commands/welcomer/view.js";
import { InteractionContext } from "../interactions.js";
import { isDiscordError } from "../util/error.js";
import { helpAutocomplete, helpEntry } from "./help.js";

export type AppCommandCallbackT<T extends APIInteraction> = (
  ctx: InteractionContext<T>,
) => Promise<void>;
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
    // buttons: {
    //   handlers: {
    //     add: addComponentChatEntry,
    //     edit: editComponentChatEntry,
    //     delete: deleteComponentChatEntry,
    //     migrate: migrateComponentsChatEntry,
    //   },
    //   autocompleteHandlers: {
    //     add: addComponentMessageAutocomplete,
    //     edit: addComponentMessageAutocomplete,
    //     delete: addComponentMessageAutocomplete,
    //     migrate: addComponentMessageAutocomplete,
    //   },
    // },
    // format: {
    //   handlers: {
    //     mention: formatMentionCallback,
    //     channel: formatChannelCallback,
    //     emoji: formatEmojiCallback,
    //   },
    // },
    // id: {
    //   handlers: {
    //     mention: idMentionCallback,
    //     channel: idChannelCallback,
    //     emoji: idEmojiCallback,
    //   },
    // },
    // invite: {
    //   handlers: {
    //     BASE: inviteCallback,
    //   },
    // },
    // triggers: {
    //   handlers: {
    //     add: addTriggerCallback,
    //     view: viewTriggerCallback,
    //   },
    //   autocompleteHandlers: {
    //     view: triggerAutocompleteCallback,
    //   },
    // },
    // webhook: {
    //   handlers: {
    //     create: webhookCreateEntry,
    //     info: webhookInfoCallback,
    //     delete: webhookDeleteEntryCallback,
    //   },
    //   autocompleteHandlers: {
    //     delete: webhookAutocomplete,
    //     info: webhookAutocomplete,
    //   },
    // },
    // welcomer: {
    //   handlers: {
    //     set: welcomerSetupEntry,
    //     view: welcomerViewEntry,
    //     delete: welcomerDeleteEntry,
    //   },
    //   autocompleteHandlers: {
    //     set: webhookAutocomplete,
    //   },
    // },
    help: {
      handlers: { BASE: helpEntry },
      autocompleteHandlers: { BASE: helpAutocomplete },
    },
    // "reaction-role": {
    //   handlers: {
    //     create: createReactionRoleHandler,
    //     delete: deleteReactionRoleHandler,
    //     list: listReactionRolesHandler,
    //   },
    //   autocompleteHandlers: {
    //     create: messageAndEmojiAutocomplete,
    //     // I think it would be cool to have the delete `message` results
    //     // filtered by messages that have registered reaction roles, but I
    //     // can't think of a particularly efficient way to do that right now
    //     delete: messageAndEmojiAutocomplete,
    //     list: autocompleteMessageCallback,
    //   },
    // },
    // restore: {
    //   handlers: {
    //     BASE: restoreMessageChatInputCallback,
    //   },
    //   autocompleteHandlers: {
    //     BASE: autocompleteMessageCallback,
    //   },
    // },
    // deluxe: {
    //   handlers: {
    //     info: deluxeInfoCallback,
    //     sync: deluxeSyncCallback,
    //   },
    // },
    // // dev server
    // leave: {
    //   handlers: { BASE: leaveCommandHandler },
    // },
    // "grant-deluxe": {
    //   handlers: { BASE: grantDeluxeCommandHandler },
    // },
    // "revoke-deluxe": {
    //   handlers: { BASE: revokeDeluxeCommandHandler },
    // },
  },
  [ApplicationCommandType.Message]: {
    // "Buttons & Components": {
    //   handlers: {
    //     BASE: addComponentMessageEntry,
    //   },
    // },
    // "Quick Edit": {
    //   handlers: { BASE: quickEditMessageEntry },
    // },
    // Restore: {
    //   handlers: {
    //     BASE: restoreMessageEntry,
    //   },
    // },
    // "Webhook Info": {
    //   handlers: {
    //     BASE: webhookInfoMsgCallback,
    //   },
    // },
    // Debug: {
    //   handlers: {
    //     BASE: debugMessageCallback,
    //   },
    // },
  },
  [ApplicationCommandType.User]: {},
  [ApplicationCommandType.PrimaryEntryPoint]: {},
};

const bannedUserIds = ["1201838301674479672"];

export const interactionCreateHandler = async ({
  api,
  data: interaction,
}: ToEventProps<APIInteraction>) => {
  if (
    (interaction.user && bannedUserIds.includes(interaction.user.id)) ||
    (interaction.member && bannedUserIds.includes(interaction.member.user.id))
  ) {
    console.log(
      "Forbidden usage",
      interaction.member?.user?.id ?? interaction.user?.id,
    );
    await api.interactions.reply(interaction.id, interaction.token, {
      content:
        "Sorry, you are forbidden from using this bot. If this seems like a mistake, contact support.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // i18next.init({
  //   lng: interaction.locale,
  //   resources,
  //   // These are all plaintext strings passed to Discord (or another service that sanitizes afterward)
  //   interpolation: { escapeValue: false },
  // });

  if (
    interaction.type === InteractionType.ApplicationCommand ||
    interaction.type === InteractionType.ApplicationCommandAutocomplete
  ) {
    let qualifiedOptions = "";
    if (interaction.data.type === ApplicationCommandType.ChatInput) {
      const appendOption = (
        option: APIApplicationCommandInteractionDataOption,
      ) => {
        if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
          qualifiedOptions += ` ${option.name}`;
          for (const opt of option.options) {
            appendOption(opt);
          }
        } else if (option.type === ApplicationCommandOptionType.Subcommand) {
          qualifiedOptions += ` ${option.name}`;
        }
      };
      for (const option of interaction.data.options ?? []) {
        appendOption(option);
      }
    }

    const commandData =
      appCommands[interaction.data.type][interaction.data.name];
    if (!commandData) {
      return; // Unknown command;
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      const handler = commandData.handlers[qualifiedOptions.trim() || "BASE"];
      if (!handler) {
        return; // Cannot handle this command
      }

      const ctx = new InteractionContext(api, interaction);
      try {
        await (handler as AppCommandCallbackT<APIInteraction>)(ctx);
        return;
      } catch (e) {
        if (isDiscordError(e)) {
          await sendErrorMessage(ctx, e.rawError);
        } else {
          console.error(e);
        }
        return; // 500
      }
    } else {
      const ctx = new InteractionContext(api, interaction);
      if (!commandData.autocompleteHandlers) {
        await ctx.createAutocompleteResponse([]);
        return;
      }
      const handler =
        commandData.autocompleteHandlers[qualifiedOptions.trim() || "BASE"];
      if (!handler) {
        await ctx.createAutocompleteResponse([]);
        return;
      }

      try {
        const response = await handler(ctx);
        // Normally I wouldn't truncate data at this level but this just
        // makes it a lot easier if the limit is changed in the future,
        // and there's hardly a reason I would *want* to go over the limit
        // in a callback
        await ctx.createAutocompleteResponse(response.slice(0, 25));
        return;
      } catch (e) {
        console.error(e);
      }
      await ctx.createAutocompleteResponse([]);
      return;
    }
    // } else if (interaction.type === InteractionType.MessageComponent) {
    //   const { custom_id: customId, component_type: type } = interaction.data;
    //   if (customId.startsWith("t_")) {
    //     const state = await env.KV.get<MinimumKVComponentState>(
    //       `component-${type}-${customId}`,
    //       "json",
    //     );
    //     if (!state) {
    //       return respond({ error: "Unknown component" });
    //     }

    //     const handler = componentStore[
    //       state.componentRoutingId as ComponentRoutingId
    //     ] as ComponentCallbackT<APIMessageComponentInteraction>;
    //     if (!handler) {
    //       return respond({ error: "Unknown routing ID" });
    //     }

    //     const ctx = new InteractionContext(rest, interaction, env, state);
    //     try {
    //       const response = await handler(ctx);
    //       if (state.componentOnce) {
    //         try {
    //           await env.KV.delete(`component-${type}-${customId}`);
    //         } catch {}
    //       }
    //       if (Array.isArray(response)) {
    //         eCtx.waitUntil(response[1]());
    //         return respond(response[0]);
    //       } else {
    //         return respond(response);
    //       }
    //     } catch (e) {
    //       if (isDiscordError(e)) {
    //         const errorResponse = getErrorMessage(ctx, e.rawError);
    //         if (errorResponse) {
    //           return respond(errorResponse);
    //         }
    //       } else {
    //         console.error(e);
    //       }
    //       return respond({
    //         error: "You've found a super unlucky error. Try again later!",
    //         status: 500,
    //       });
    //     }
    //   } else if (customId.startsWith("p_")) {
    //     const ctx = new InteractionContext(rest, interaction, env);
    //     const guildId = interaction.guild_id;
    //     if (!guildId) {
    //       return respond({ error: "Must be in a guild context", status: 400 });
    //     }

    //     const db = getDb(env.HYPERDRIVE);
    //     const doId = env.COMPONENTS.idFromName(
    //       `${interaction.message.id}-${customId}`,
    //     );
    //     const stub = env.COMPONENTS.get(doId, { locationHint: "enam" });
    //     const response = await stub.fetch("http://do/", { method: "GET" });
    //     let component: DurableStoredComponent;
    //     if (response.status === 404) {
    //       // In case a durable object does not exist for this component for
    //       // whatever reason. Usually because of migrated components that have
    //       // not yet actually been activated.
    //       const componentId = getComponentId(
    //         type === ComponentType.Button
    //           ? { type, style: ButtonStyle.Primary, custom_id: customId }
    //           : { type, custom_id: customId },
    //       );

    //       if (componentId === undefined) {
    //         return respond({ error: "Bad Request", status: 400 });
    //       }

    //       // Don't allow component data to leak into other servers
    //       const dryComponent = await db.query.discordMessageComponents.findFirst({
    //         where: (table, { eq }) => eq(table.id, componentId),
    //         columns: { guildId: true, channelId: true },
    //         with: {
    //           createdBy: {
    //             columns: { discordId: true },
    //           },
    //         },
    //       });
    //       if (!dryComponent) {
    //         return respond(
    //           ctx.reply({
    //             content:
    //               "No data could be found for this component. It may have been deleted by a moderator but not removed from the message.",
    //             ephemeral: true,
    //           }),
    //         );
    //       }
    //       if (!dryComponent.guildId) {
    //         if (
    //           // Allow the component creator to set this data since it's obvious
    //           // they can access the component's contents
    //           dryComponent.createdBy?.discordId &&
    //           dryComponent.createdBy.discordId === BigInt(ctx.user.id)
    //         ) {
    //           await db
    //             .update(discordMessageComponents)
    //             .set({
    //               guildId: BigInt(guildId),
    //               channelId: BigInt(interaction.channel.id),
    //             })
    //             .where(eq(discordMessageComponents.id, componentId));

    //           dryComponent.guildId = BigInt(guildId);
    //           dryComponent.channelId = BigInt(interaction.channel.id);
    //         } else {
    //           return respond(
    //             ctx.reply({
    //               content: [
    //                 "This component hasn't been linked with a server. Please tell",
    //                 "the component owner (the person who created the component on",
    //                 "the Discohook site) to use the component at least once. This",
    //                 "will link the component with the current server. After you do",
    //                 "this, the component should work as expected.",
    //               ].join(" "),
    //               ephemeral: true,
    //             }),
    //           );
    //         }
    //       } else if (dryComponent.guildId.toString() !== interaction.guild_id) {
    //         return respond({
    //           error: response.statusText,
    //           status: response.status,
    //         });
    //         // ctx.reply({
    //         //   content: [
    //         //     "The server associated with this component does not match the current server.",
    //         //     "If this component should be able to be used in this server,",
    //         //     "contact support to have its server association changed.",
    //         //   ].join(" "),
    //         //   ephemeral: true,
    //         // }),
    //       }

    //       const params = new URLSearchParams({ id: componentId.toString() });
    //       if (
    //         new MessageFlagsBitField(interaction.message.flags ?? 0).has(
    //           MessageFlags.Ephemeral,
    //         )
    //       ) {
    //         // Ephemeral buttons last one hour to avoid durable object clutter.
    //         // To be honest, this is not necessary at all, but if someone spams
    //         // any button then we would rather the requests go to Cloudflare and
    //         // not the database.
    //         params.set(
    //           "expireAt",
    //           new Date(new Date().getTime() + 3_600_000).toISOString(),
    //         );
    //       }
    //       const doResponse = await stub.fetch(`http://do/?${params}`, {
    //         method: "PUT",
    //       });
    //       if (!doResponse.ok) {
    //         return respond({
    //           error: doResponse.statusText,
    //           status: doResponse.status,
    //         });
    //       }
    //       component = await doResponse.json();
    //     } else if (!response.ok) {
    //       return respond({
    //         error: response.statusText,
    //         status: response.status,
    //       });
    //     } else {
    //       component = (await response.json()) as DurableStoredComponent;
    //     }
    //     // if (component.draft) {
    //     //   return respond({ error: "Component is marked as draft" });
    //     // }

    //     let guild: TriggerKVGuild;
    //     try {
    //       guild = await getchTriggerGuild(rest, env, guildId);
    //     } catch (e) {
    //       if (isDiscordError(e) && e.code === RESTJSONErrorCodes.UnknownGuild) {
    //         return respond(
    //           ctx.reply({
    //             content:
    //               "Discohook Utils needs to be a member of this server in order to use components.",
    //             ephemeral: true,
    //             components: [
    //               {
    //                 type: ComponentType.ActionRow,
    //                 components: [
    //                   {
    //                     type: ComponentType.Button,
    //                     style: ButtonStyle.Link,
    //                     label: "Add Bot",
    //                     url: `https://discord.com/oauth2/authorize?${new URLSearchParams(
    //                       {
    //                         client_id: interaction.application_id,
    //                         scope: "bot",
    //                         guild_id: guildId,
    //                         disable_guild_select: "true",
    //                         integration_type: String(
    //                           ApplicationIntegrationType.GuildInstall,
    //                         ),
    //                       },
    //                     )}`,
    //                   },
    //                 ],
    //               },
    //             ],
    //           }),
    //         );
    //       }
    //       throw e;
    //     }

    //     const liveVars: LiveVariables = {
    //       guild,
    //       member: interaction.member,
    //       user: interaction.member?.user,
    //     };
    //     switch (interaction.data.component_type) {
    //       case ComponentType.ChannelSelect:
    //       case ComponentType.MentionableSelect:
    //       case ComponentType.UserSelect:
    //       case ComponentType.RoleSelect:
    //         liveVars.selected_values = interaction.data.values;
    //         liveVars.selected_resolved = interaction.data.resolved;
    //         break;
    //       case ComponentType.StringSelect:
    //         liveVars.selected_values = interaction.data.values;
    //         break;
    //       default:
    //         break;
    //     }

    //     const allFlows = component.componentsToFlows.map((ctf) => ctf.flow);
    //     let flows: Flow[] = [];
    //     switch (component.data.type) {
    //       case ComponentType.Button: {
    //         if (component.data.type !== interaction.data.component_type) break;

    //         if (component.data.style === ButtonStyle.Link) break;
    //         flows = allFlows;
    //         break;
    //       }
    //       case ComponentType.StringSelect: {
    //         if (component.data.type !== interaction.data.component_type) break;

    //         // While we do have the logic to handle multiple selected values,
    //         // it's currently unsupported behavior and is overwritten when
    //         // saving components. Nonetheless, if a user manually saved a select
    //         // menu allowing multiple values, we are able to deal with it
    //         // gracefully. Should we truncate here too?
    //         flows = Object.entries(component.data.flowIds)
    //           .filter(([key]) =>
    //             (
    //               interaction.data as APIMessageStringSelectInteractionData
    //             ).values.includes(key),
    //           )
    //           .map(([_, flowId]) =>
    //             allFlows.find((flow) => String(flow.id) === flowId),
    //           )
    //           .filter((v): v is NonNullable<typeof v> => Boolean(v));
    //         break;
    //       }
    //       case ComponentType.ChannelSelect:
    //       case ComponentType.MentionableSelect:
    //       case ComponentType.RoleSelect:
    //       case ComponentType.UserSelect: {
    //         if (component.data.type !== interaction.data.component_type) break;

    //         flows = allFlows;
    //         break;
    //       }
    //       default:
    //         break;
    //     }
    //     if (env.ENVIRONMENT === "dev") console.log(flows.map((f) => f.actions));
    //     if (flows.length === 0) {
    //       const messageCreatedAt = Snowflake.parse(
    //         interaction.message.id,
    //         new Date(2015, 0),
    //       ).timestamp;
    //       const maybeMigrate =
    //         messageCreatedAt < new Date("2024-09-06").valueOf();

    //       return respond(
    //         liveVars.guild?.owner_id === ctx.user.id ||
    //           ctx.userPermissons.has(
    //             PermissionFlags.ManageMessages,
    //             PermissionFlags.ManageWebhooks,
    //           )
    //           ? ctx.reply({
    //               content: `${t("noComponentFlow")} ${
    //                 maybeMigrate ? t("noComponentFlowMigratePrompt") : ""
    //               }`,
    //               components: [
    //                 new ActionRowBuilder<ButtonBuilder>().addComponents(
    //                   new ButtonBuilder()
    //                     .setStyle(ButtonStyle.Link)
    //                     .setURL(
    //                       `${env.DISCOHOOK_ORIGIN}/edit/component/${component.id}`,
    //                     )
    //                     .setLabel(t("customize")),
    //                 ),
    //               ],
    //               ephemeral: true,
    //             })
    //           : ctx.updateMessage({}),
    //       );
    //     }

    //     // Don't like this. We should be returning a response
    //     // from one of the flows instead, especially for modals.
    //     eCtx.waitUntil(
    //       (async () => {
    //         for (const flow of flows) {
    //           const result = await executeFlow({
    //             env,
    //             flow,
    //             rest,
    //             db,
    //             liveVars,
    //             setVars: {
    //               guildId,
    //               channelId: interaction.channel.id,
    //               // Possible confusing conflict with Delete Message action
    //               messageId: interaction.message.id,
    //               userId: ctx.user.id,
    //             },
    //             ctx,
    //             recursion: 0,
    //             deferred: true,
    //           });
    //           if (env.ENVIRONMENT === "dev") console.log(result);
    //         }
    //       })(),
    //     );
    //     return respond(ctx.updateMessage({}));
    //   } else if (customId.startsWith("a_")) {
    //     // "Auto" components require only the state defined in their custom ID,
    //     // allowing them to have an unlimited timeout.
    //     // Example: `a_delete-reaction-role_123456789012345679:✨`
    //     //           auto  routing id       message id         reaction
    //     const { routingId } = parseAutoComponentId(customId);
    //     const handler = componentStore[
    //       routingId as ComponentRoutingId
    //     ] as ComponentCallbackT<APIMessageComponentInteraction>;
    //     if (!handler) {
    //       return respond({ error: "Unknown routing ID" });
    //     }

    //     const ctx = new InteractionContext(rest, interaction, env);
    //     try {
    //       const response = await handler(ctx);
    //       if (Array.isArray(response)) {
    //         eCtx.waitUntil(response[1]());
    //         return respond(response[0]);
    //       } else {
    //         return respond(response);
    //       }
    //     } catch (e) {
    //       if (isDiscordError(e)) {
    //         const errorResponse = getErrorMessage(ctx, e.rawError);
    //         if (errorResponse) {
    //           return respond(errorResponse);
    //         }
    //       } else {
    //         console.error(e);
    //       }
    //       return respond({
    //         error: "You've found a super unlucky error. Try again later!",
    //         status: 500,
    //       });
    //     }
    //   } else if (interaction.data.component_type === ComponentType.Button) {
    //     // Check for unmigrated buttons and migrate them
    //     const db = getDb(env.HYPERDRIVE);
    //     const ctx = new InteractionContext(rest, interaction, env);
    //     const guildId = interaction.guild_id;
    //     if (!guildId) {
    //       return respond({ error: "No guild ID" });
    //     }

    //     eCtx.waitUntil(
    //       (async () => {
    //         let inserted: Pick<
    //           typeof discordMessageComponents.$inferSelect,
    //           "id" | "data"
    //         >[];
    //         let rows: APIActionRowComponent<APIComponentInMessageActionRow>[];
    //         let guild: TriggerKVGuild;
    //         let oldIdMap: Record<string, string>;
    //         try {
    //           ({ inserted, rows, guild, oldIdMap } = await migrateLegacyButtons(
    //             env,
    //             rest,
    //             db,
    //             guildId,
    //             interaction.message,
    //           ));
    //         } catch (e) {
    //           return respond(
    //             ctx.reply({
    //               content: String(e),
    //               flags: MessageFlags.Ephemeral,
    //             }),
    //           );
    //         }
    //         await ctx.followup.editOriginalMessage({ components: rows });

    //         const thisButton = inserted.find(
    //           (b) => String(b.id) === oldIdMap[customId],
    //         );
    //         if (
    //           thisButton &&
    //           thisButton.data.type === ComponentType.Button &&
    //           thisButton.data.style !== ButtonStyle.Link &&
    //           thisButton.data.style !== ButtonStyle.Premium
    //         ) {
    //           const thisButtonData = await launchComponentDurableObject(env, {
    //             messageId: interaction.message.id,
    //             customId,
    //             componentId: thisButton.id,
    //           });

    //           const liveVars: LiveVariables = {
    //             guild,
    //             member: interaction.member,
    //             user: interaction.member?.user,
    //           };
    //           const result = await executeFlow({
    //             env,
    //             flow: thisButtonData.componentsToFlows[0].flow,
    //             rest,
    //             db,
    //             liveVars,
    //             setVars: {
    //               channelId: interaction.channel.id,
    //               messageId: interaction.message.id,
    //               userId: ctx.user.id,
    //             },
    //             ctx,
    //             recursion: 0,
    //             deferred: true,
    //           });
    //           if (env.ENVIRONMENT === "dev") console.log(result);
    //         }
    //       })(),
    //     );

    //     // Discord needs to know whether our eventual response will be ephemeral
    //     // const thisOldButton = oldMessageButtons.find((b) => getOldCustomId(b));
    //     // const ephemeral = !!(
    //     //   thisOldButton &&
    //     //   (thisOldButton.roleId || thisOldButton.customEphemeralMessageData)
    //     // );

    //     // We might have an ephemeral followup but our first followup is always
    //     // editOriginalMessage. Luckily this doesn't matter anymore.
    //     return respond(ctx.defer({ thinking: false, ephemeral: false }));
    //   }
    //   return respond({
    //     error: "Component custom ID does not contain a valid prefix",
    //   });
    // } else if (interaction.type === InteractionType.ModalSubmit) {
    //   const { custom_id: customId } = interaction.data;
    //   if (customId.startsWith("t_")) {
    //     const state = await env.KV.get<MinimumKVComponentState>(
    //       `modal-${customId}`,
    //       "json",
    //     );
    //     if (!state) {
    //       return respond({ error: "Unknown modal" });
    //     }

    //     const handler = modalStore[state.componentRoutingId as ModalRoutingId];
    //     if (!handler) {
    //       return respond({ error: "Unknown routing ID" });
    //     }

    //     const ctx = new InteractionContext(rest, interaction, env, state);
    //     try {
    //       const response = await handler(ctx);
    //       if (state.componentOnce) {
    //         try {
    //           await env.KV.delete(`modal-${customId}`);
    //         } catch {}
    //       }
    //       if (Array.isArray(response)) {
    //         eCtx.waitUntil(response[1]());
    //         return respond(response[0]);
    //       } else {
    //         return respond(response);
    //       }
    //     } catch (e) {
    //       if (isDiscordError(e)) {
    //         const errorResponse = getErrorMessage(ctx, e.rawError);
    //         if (errorResponse) {
    //           return respond(errorResponse);
    //         }
    //       } else {
    //         console.error(e);
    //       }
    //       return respond({
    //         error: "You've found a super unlucky error. Try again later!",
    //         status: 500,
    //       });
    //     }
    //   } else if (customId.startsWith("a_")) {
    //     const { routingId } = parseAutoComponentId(customId);
    //     const handler = modalStore[routingId as ModalRoutingId];
    //     if (!handler) {
    //       return respond({ error: "Unknown routing ID" });
    //     }

    //     const ctx = new InteractionContext(rest, interaction, env);
    //     try {
    //       const response = await handler(ctx);
    //       if (Array.isArray(response)) {
    //         eCtx.waitUntil(response[1]());
    //         return respond(response[0]);
    //       } else {
    //         return respond(response);
    //       }
    //     } catch (e) {
    //       if (isDiscordError(e)) {
    //         const errorResponse = getErrorMessage(ctx, e.rawError);
    //         if (errorResponse) {
    //           return respond(errorResponse);
    //         }
    //       } else {
    //         console.error(e);
    //       }
    //       return respond({
    //         error: "You've found a super unlucky error. Try again later!",
    //         status: 500,
    //       });
    //     }
    //   }
    // }
  }

  console.error("Unknown interaction type");
  return;
};
