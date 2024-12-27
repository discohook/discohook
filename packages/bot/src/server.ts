import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import {
  APIActionRowComponent,
  APIApplicationCommandInteractionDataOption,
  APIInteraction,
  APIMessageActionRowComponent,
  APIMessageComponentInteraction,
  APIMessageStringSelectInteractionData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  GatewayDispatchEvents,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField, PermissionFlags } from "discord-bitflag";
import { PlatformAlgorithm, isValidRequest } from "discord-verify";
import i18next, { t } from "i18next";
import { IRequest, Router } from "itty-router";
import { getDb, getRedis, getchTriggerGuild } from "store";
import {
  DurableStoredComponent,
  launchComponentDurableObject,
} from "store/src/durable/components.js";
import { discordMessageComponents } from "store/src/schema";
import { Flow, TriggerKVGuild } from "store/src/types";
import { AppCommandCallbackT, appCommands, respond } from "./commands.js";
import { migrateLegacyButtons } from "./commands/components/migrate.js";
import {
  ComponentCallbackT,
  ComponentRoutingId,
  MinimumKVComponentState,
  ModalRoutingId,
  componentStore,
  modalStore,
} from "./components.js";
import { getErrorMessage } from "./errors.js";
import {
  gatewayEventNameToCallback,
  webhookEventNameToCallback,
} from "./events.js";
import { LiveVariables, executeFlow } from "./flows/flows.js";
import { InteractionContext } from "./interactions.js";
import { Env } from "./types/env.js";
import { APIWebhookEvent, WebhookEventType } from "./types/webhook-events.js";
import { getComponentId, parseAutoComponentId } from "./util/components.js";
import { isDiscordError } from "./util/error.js";
export { DurableComponentState } from "store/src/durable/components.js";
export { EmojiManager } from "./emojis.js";

const resources = {
  en: { translation: require("./i18n/en.json") },
  "en-GB": { translation: require("./i18n/en-GB.json") },
  fr: { translation: require("./i18n/fr.json") },
  nl: { translation: require("./i18n/nl.json") },
  "zh-CN": { translation: require("./i18n/zh-CN.json") },
};

const router = Router();

router.get("/", (_, env: Env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

const bannedUserIds = ["1201838301674479672"];

const handleInteraction = async (
  request: IRequest,
  env: Env,
  eCtx: ExecutionContext,
) => {
  const { isValid, body: interaction } =
    await server.verifyDiscordRequest<APIInteraction>(request, env);
  if (!isValid || !interaction) {
    return new Response("Bad request signature.", { status: 401 });
  }

  const rest = new REST().setToken(env.DISCORD_TOKEN);

  if (interaction.type === InteractionType.Ping) {
    return respond({ type: InteractionResponseType.Pong });
  }

  if (interaction.user && bannedUserIds.includes(interaction.user.id)) {
    return respond({ error: "Forbidden" });
  }

  await i18next.init({
    lng: interaction.locale,
    resources,
    // These are all plaintext strings passed to Discord (or another service that sanitizes afterward)
    interpolation: { escapeValue: false },
  });

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
      appCommands[interaction.data.type][interaction.data.name.toLowerCase()];
    if (!commandData) {
      return respond({ error: "Unknown command" });
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      const handler = commandData.handlers[qualifiedOptions.trim() || "BASE"];
      if (!handler) {
        return respond({ error: "Cannot handle this command" });
      }

      const ctx = new InteractionContext(rest, interaction, env);
      try {
        const response = await (handler as AppCommandCallbackT<APIInteraction>)(
          ctx,
        );
        if (Array.isArray(response)) {
          eCtx.waitUntil(response[1]());
          return respond(response[0]);
        } else {
          return respond(response);
        }
      } catch (e) {
        if (isDiscordError(e)) {
          const errorResponse = getErrorMessage(ctx, e.rawError);
          if (errorResponse) {
            return respond(errorResponse);
          }
        } else {
          console.error(e);
        }
        return respond({
          error: "You've found a super unlucky error. Try again later!",
          status: 500,
        });
      }
    } else {
      const noChoices = respond({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: { choices: [] },
      });

      if (!commandData.autocompleteHandlers) return noChoices;
      const handler =
        commandData.autocompleteHandlers[qualifiedOptions.trim() || "BASE"];
      if (!handler) return noChoices;

      const ctx = new InteractionContext(rest, interaction, env);
      try {
        const response = await handler(ctx);
        return respond({
          // Normally I wouldn't truncate data at this level but this just
          // makes it a lot easier if the limit is changed in the future,
          // and there's hardly a reason I would *want* to go over the limit
          // in a callback
          type: InteractionResponseType.ApplicationCommandAutocompleteResult,
          data: { choices: response.slice(0, 25) },
        });
      } catch (e) {
        console.error(e);
      }
      return noChoices;
    }
  } else if (interaction.type === InteractionType.MessageComponent) {
    const { custom_id: customId, component_type: type } = interaction.data;
    if (customId.startsWith("t_")) {
      const state = await env.KV.get<MinimumKVComponentState>(
        `component-${type}-${customId}`,
        "json",
      );
      if (!state) {
        return respond({ error: "Unknown component" });
      }

      const handler = componentStore[
        state.componentRoutingId as ComponentRoutingId
      ] as ComponentCallbackT<APIMessageComponentInteraction>;
      if (!handler) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env, state);
      try {
        const response = await handler(ctx);
        if (state.componentOnce) {
          try {
            await env.KV.delete(`component-${type}-${customId}`);
          } catch {}
        }
        if (Array.isArray(response)) {
          eCtx.waitUntil(response[1]());
          return respond(response[0]);
        } else {
          return respond(response);
        }
      } catch (e) {
        if (isDiscordError(e)) {
          const errorResponse = getErrorMessage(ctx, e.rawError);
          if (errorResponse) {
            return respond(errorResponse);
          }
        } else {
          console.error(e);
        }
        return respond({
          error: "You've found a super unlucky error. Try again later!",
          status: 500,
        });
      }
    } else if (customId.startsWith("p_")) {
      const ctx = new InteractionContext(rest, interaction, env);
      const db = getDb(env.HYPERDRIVE);
      const doId = env.COMPONENTS.idFromName(
        `${interaction.message.id}-${customId}`,
      );
      const stub = env.COMPONENTS.get(doId, { locationHint: "enam" });
      const response = await stub.fetch("http://do/", { method: "GET" });
      let component: DurableStoredComponent;
      if (response.status === 404) {
        // In case a durable object does not exist for this component for
        // whatever reason. Usually because of migrated components that have
        // not yet actually been activated.
        const componentId = getComponentId(
          type === ComponentType.Button
            ? { type, style: ButtonStyle.Primary, custom_id: customId }
            : { type, custom_id: customId },
        );

        if (componentId === undefined) {
          return respond({ error: "Bad Request", status: 400 });
        }

        // Don't allow component data to leak into other servers
        const dryComponent = await db.query.discordMessageComponents.findFirst({
          where: (table, { eq }) => eq(table.id, componentId),
          columns: { guildId: true },
        });
        if (!dryComponent) {
          return respond(
            ctx.reply({
              content:
                "No data could be found for this component. It may have been deleted by a moderator but not removed from the message.",
              ephemeral: true,
            }),
          );
        }
        if (!dryComponent.guildId) {
          return respond(
            ctx.reply({
              content: [
                "In order to prevent private data from leaking into other servers,",
                "please send a message with this component in a private channel and",
                "use it at least once. This links the component with the current server.",
                "After you do this, the component used in this context should work as expected.",
              ].join(" "),
              ephemeral: true,
            }),
          );
        }
        if (dryComponent.guildId.toString() !== interaction.guild_id) {
          return respond({
            error: response.statusText,
            status: response.status,
          });
          // ctx.reply({
          //   content: [
          //     "The server associated with this component does not match the current server.",
          //     "If this component should be able to be used in this server,",
          //     "contact support to have its server association changed.",
          //   ].join(" "),
          //   ephemeral: true,
          // }),
        }

        const params = new URLSearchParams({ id: componentId.toString() });
        if (
          new MessageFlagsBitField(interaction.message.flags ?? 0).has(
            MessageFlags.Ephemeral,
          )
        ) {
          // Ephemeral buttons last one hour to avoid durable object clutter.
          // To be honest, this is not necessary at all, but if someone spams
          // any button then we would rather the requests go to Cloudflare and
          // not the database.
          params.set(
            "expireAt",
            new Date(new Date().getTime() + 3_600_000).toISOString(),
          );
        }
        const doResponse = await stub.fetch(`http://do/?${params}`, {
          method: "PUT",
        });
        if (!doResponse.ok) {
          return respond({
            error: doResponse.statusText,
            status: doResponse.status,
          });
        }
        component = await doResponse.json();
      } else if (!response.ok) {
        return respond({
          error: response.statusText,
          status: response.status,
        });
      } else {
        component = (await response.json()) as DurableStoredComponent;
      }
      // if (component.draft) {
      //   return respond({ error: "Component is marked as draft" });
      // }
      const guildId = interaction.guild_id;
      if (!guildId) {
        return respond({ error: "No guild ID" });
      }

      const liveVars: LiveVariables = {
        guild: await getchTriggerGuild(rest, env, guildId),
        member: interaction.member,
        user: interaction.member?.user,
      };
      switch (interaction.data.component_type) {
        case ComponentType.ChannelSelect:
        case ComponentType.MentionableSelect:
        case ComponentType.UserSelect:
        case ComponentType.RoleSelect:
          liveVars.selected_values = interaction.data.values;
          liveVars.selected_resolved = interaction.data.resolved;
          break;
        case ComponentType.StringSelect:
          liveVars.selected_values = interaction.data.values;
          break;
        default:
          break;
      }

      const allFlows = component.componentsToFlows.map((ctf) => ctf.flow);
      let flows: Flow[] = [];
      switch (component.data.type) {
        case ComponentType.Button: {
          if (component.data.type !== interaction.data.component_type) break;

          if (component.data.style === ButtonStyle.Link) break;
          flows = allFlows;
          break;
        }
        case ComponentType.StringSelect: {
          if (component.data.type !== interaction.data.component_type) break;

          // While we do have the logic to handle multiple selected values,
          // it's currently unsupported behavior and is overwritten when
          // saving components. Nonetheless, if a user manually saved a select
          // menu allowing multiple values, we are able to deal with it
          // gracefully. Should we truncate here too?
          flows = Object.entries(component.data.flowIds)
            .filter(([key]) =>
              (
                interaction.data as APIMessageStringSelectInteractionData
              ).values.includes(key),
            )
            .map(([_, flowId]) =>
              allFlows.find((flow) => String(flow.id) === flowId),
            )
            .filter((v): v is NonNullable<typeof v> => Boolean(v));
          break;
        }
        case ComponentType.ChannelSelect:
        case ComponentType.MentionableSelect:
        case ComponentType.RoleSelect:
        case ComponentType.UserSelect: {
          if (component.data.type !== interaction.data.component_type) break;

          flows = allFlows;
          break;
        }
        default:
          break;
      }
      if (flows.length === 0) {
        return respond(
          liveVars.guild?.owner_id === ctx.user.id ||
            ctx.userPermissons.has(
              PermissionFlags.ManageMessages,
              PermissionFlags.ManageWebhooks,
            )
            ? ctx.reply({
                content: t("noComponentFlow"),
                components: [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                      .setStyle(ButtonStyle.Link)
                      .setURL(
                        `${env.DISCOHOOK_ORIGIN}/edit/component/${component.id}`,
                      )
                      .setLabel(t("customize")),
                  ),
                ],
                ephemeral: true,
              })
            : ctx.updateMessage({}),
        );
      }

      // Don't like this. We should be returning a response
      // from one of the flows instead, especially for modals.
      eCtx.waitUntil(
        (async () => {
          for (const flow of flows) {
            const result = await executeFlow(
              env,
              flow,
              rest,
              db,
              liveVars,
              {
                guildId,
                channelId: interaction.channel.id,
                // Possible confusing conflict with Delete Message action
                messageId: interaction.message.id,
                userId: ctx.user.id,
              },
              ctx,
            );
            console.log(result);
          }
        })(),
      );
      return respond(ctx.updateMessage({}));
    } else if (customId.startsWith("a_")) {
      // "Auto" components require only the state defined in their custom ID,
      // allowing them to have an unlimited timeout.
      // Example: `a_delete-reaction-role_123456789012345679:✨`
      //           auto  routing id       message id         reaction
      const { routingId } = parseAutoComponentId(customId);
      const handler = componentStore[
        routingId as ComponentRoutingId
      ] as ComponentCallbackT<APIMessageComponentInteraction>;
      if (!handler) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env);
      try {
        const response = await handler(ctx);
        if (Array.isArray(response)) {
          eCtx.waitUntil(response[1]());
          return respond(response[0]);
        } else {
          return respond(response);
        }
      } catch (e) {
        if (isDiscordError(e)) {
          const errorResponse = getErrorMessage(ctx, e.rawError);
          if (errorResponse) {
            return respond(errorResponse);
          }
        } else {
          console.error(e);
        }
        return respond({
          error: "You've found a super unlucky error. Try again later!",
          status: 500,
        });
      }
    } else if (interaction.data.component_type === ComponentType.Button) {
      // Check for unmigrated buttons and migrate them
      const db = getDb(env.HYPERDRIVE);
      const ctx = new InteractionContext(rest, interaction, env);
      const guildId = interaction.guild_id;
      if (!guildId) {
        return respond({ error: "No guild ID" });
      }

      eCtx.waitUntil(
        (async () => {
          let inserted: Pick<
            typeof discordMessageComponents.$inferSelect,
            "id" | "data"
          >[];
          let rows: APIActionRowComponent<APIMessageActionRowComponent>[];
          let guild: TriggerKVGuild;
          let oldIdMap: Record<string, string>;
          try {
            ({ inserted, rows, guild, oldIdMap } = await migrateLegacyButtons(
              env,
              rest,
              db,
              guildId,
              interaction.message,
            ));
          } catch (e) {
            return respond(
              ctx.reply({
                content: String(e),
                flags: MessageFlags.Ephemeral,
              }),
            );
          }
          await ctx.followup.editOriginalMessage({ components: rows });

          const thisButton = inserted.find(
            (b) => String(b.id) === oldIdMap[customId],
          );
          if (
            thisButton &&
            thisButton.data.type === ComponentType.Button &&
            thisButton.data.style !== ButtonStyle.Link &&
            thisButton.data.style !== ButtonStyle.Premium
          ) {
            const thisButtonData = await launchComponentDurableObject(env, {
              messageId: interaction.message.id,
              customId,
              componentId: thisButton.id,
            });

            const liveVars: LiveVariables = {
              guild,
              member: interaction.member,
              user: interaction.member?.user,
            };
            const result = await executeFlow(
              env,
              thisButtonData.componentsToFlows[0].flow,
              rest,
              db,
              liveVars,
              {
                channelId: interaction.channel.id,
                messageId: interaction.message.id,
                userId: ctx.user.id,
              },
              ctx,
            );
            console.log(result);
          }
        })(),
      );

      // Discord needs to know whether our eventual response will be ephemeral
      // const thisOldButton = oldMessageButtons.find((b) => getOldCustomId(b));
      // const ephemeral = !!(
      //   thisOldButton &&
      //   (thisOldButton.roleId || thisOldButton.customEphemeralMessageData)
      // );

      // We might have an ephemeral followup but our first followup is always
      // editOriginalMessage. Luckily this doesn't matter anymore.
      return respond(ctx.defer({ thinking: false, ephemeral: false }));
    }
    return respond({
      error: "Component custom ID does not contain a valid prefix",
    });
  } else if (interaction.type === InteractionType.ModalSubmit) {
    const { custom_id: customId } = interaction.data;
    if (customId.startsWith("t_")) {
      const state = await env.KV.get<MinimumKVComponentState>(
        `modal-${customId}`,
        "json",
      );
      if (!state) {
        return respond({ error: "Unknown modal" });
      }

      const handler = modalStore[state.componentRoutingId as ModalRoutingId];
      if (!handler) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env, state);
      try {
        const response = await handler(ctx);
        if (state.componentOnce) {
          try {
            await env.KV.delete(`modal-${customId}`);
          } catch {}
        }
        if (Array.isArray(response)) {
          eCtx.waitUntil(response[1]());
          return respond(response[0]);
        } else {
          return respond(response);
        }
      } catch (e) {
        if (isDiscordError(e)) {
          const errorResponse = getErrorMessage(ctx, e.rawError);
          if (errorResponse) {
            return respond(errorResponse);
          }
        } else {
          console.error(e);
        }
        return respond({
          error: "You've found a super unlucky error. Try again later!",
          status: 500,
        });
      }
    } else if (customId.startsWith("a_")) {
      const { routingId } = parseAutoComponentId(customId);
      const handler = modalStore[routingId as ModalRoutingId];
      if (!handler) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env);
      try {
        const response = await handler(ctx);
        if (Array.isArray(response)) {
          eCtx.waitUntil(response[1]());
          return respond(response[0]);
        } else {
          return respond(response);
        }
      } catch (e) {
        if (isDiscordError(e)) {
          const errorResponse = getErrorMessage(ctx, e.rawError);
          if (errorResponse) {
            return respond(errorResponse);
          }
        } else {
          console.error(e);
        }
        return respond({
          error: "You've found a super unlucky error. Try again later!",
          status: 500,
        });
      }
    }
  }

  console.error("Unknown interaction type");
  return respond({ error: "Unknown interaction type" });
};

router.post("/", handleInteraction);

interface KVCustomBot {
  applicationId: string;
  publicKey: string;
  token: string | null;
}

router.post(
  "/custom/:botId",
  async (request, env: Env, eCtx: ExecutionContext) => {
    // is a durable object faster?
    const config = await env.KV.get<KVCustomBot>(
      `custom-bot-${request.params.botId}`,
      "json",
    );
    if (!config) {
      return new Response("Unknown bot ID", { status: 404 });
    }
    return await handleInteraction(
      request,
      {
        ...env,
        // This might cause some confusion if the custom
        // bot's token does not match the ID
        DISCORD_APPLICATION_ID: config.applicationId,
        DISCORD_TOKEN: config.token ?? env.DISCORD_TOKEN,
        DISCORD_PUBLIC_KEY: config.publicKey,
      },
      eCtx,
    );
  },
);

router.post("/ws", async (request, env: Env, eCtx: ExecutionContext) => {
  const auth = request.headers.get("Authorization");
  if (!auth || !env.DISCORD_TOKEN) {
    return new Response(null, { status: 401 });
  }
  const [scope, token] = auth.split(" ");
  if (scope !== "Bot" || token !== env.DISCORD_TOKEN) {
    return new Response(null, { status: 403 });
  }

  const eventName = request.headers.get("X-Discohook-Event");
  if (!eventName) {
    return new Response(null, { status: 400 });
  }

  const query = new URL(request.url).searchParams;
  const wait = query.get("wait") === "true";

  console.log(`[/ws] Handling ${eventName}`);
  const callback =
    gatewayEventNameToCallback[eventName as GatewayDispatchEvents];
  if (callback && wait) {
    try {
      await callback(env, await request.json());
    } catch (e) {
      console.error(e);
      return respond({ error: String(e), status: 500 });
    }
    return new Response(null, { status: 204 });
  } else if (callback) {
    eCtx.waitUntil(callback(env, await request.json()));
    return new Response(null, { status: 204 });
  }
  return respond({ error: "No event callback found.", status: 404 });
});

router.post("/ws/bulk", async (request, env: Env, eCtx: ExecutionContext) => {
  const auth = request.headers.get("Authorization");
  if (!auth || !env.DISCORD_TOKEN) {
    return new Response(null, { status: 401 });
  }
  const [scope, token] = auth.split(" ");
  if (scope !== "Bot" || token !== env.DISCORD_TOKEN) {
    return new Response(null, { status: 403 });
  }

  const data = (
    (await request.json()) as {
      t: GatewayDispatchEvents;
      d: any;
      ms: number;
    }[]
  ).sort((p) => p.ms);

  const callbacks: (() => Promise<void>)[] = [];
  for (const payload of data) {
    const callback = gatewayEventNameToCallback[payload.t];
    if (callback) {
      callbacks.push(async () => callback(env, payload.d).catch(console.error));
    }
  }

  if (callbacks.length === 0) {
    return respond({ error: "No event callback found.", status: 404 });
  }

  console.log(`[/ws/bulk] Handling ${callbacks.length} events`);
  eCtx.waitUntil(Promise.all(callbacks.map((c) => c())));
  return new Response(null, { status: 204 });
});

router.post("/events", async (request, env: Env, eCtx: ExecutionContext) => {
  const { isValid, body } = await server.verifyDiscordRequest<APIWebhookEvent>(
    request,
    env,
  );
  if (!isValid || !body) {
    return new Response("Bad request signature.", { status: 401 });
  }

  switch (body.type) {
    case WebhookEventType.Ping: {
      return new Response(null, { status: 204 });
    }
    case WebhookEventType.Event: {
      break;
    }
    default:
      return new Response(null, { status: 204 });
  }

  console.log("[/events] Handling", body.event.type);
  const callback = webhookEventNameToCallback[body.event.type];
  if (callback) {
    eCtx.waitUntil(callback(env, body.event.data));
  } else {
    console.error("No event callback found for", body.event.type);
  }
  return new Response(null, { status: 204 });
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

async function verifyDiscordRequest<T>(request: Request, env: Env) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const valid =
    signature &&
    timestamp &&
    (await isValidRequest(
      request,
      env.DISCORD_PUBLIC_KEY,
      PlatformAlgorithm.Cloudflare,
    ));
  if (!valid) {
    return { isValid: false };
  }

  const body = (await request.json()) as T;
  return { body, isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    if (env.ENVIRONMENT === "dev") {
      env.HYPERDRIVE = { connectionString: env.DATABASE_URL } as Hyperdrive;
    }
    if (env.APPLICATIONS_RAW) {
      env.APPLICATIONS = JSON.parse(env.APPLICATIONS_RAW);
    } else {
      env.APPLICATIONS = {};
    }
    // Duplicate the "main" bot token so that custom bots can still access the same webhooks
    env.APPLICATIONS[env.DISCORD_APPLICATION_ID] = env.DISCORD_TOKEN;

    const kv = getRedis(env);
    // Not strictly compatible due to `get()` missing some features that we don't use
    env.KV = kv;

    return router.handle(request, env, ctx);
  },
};

export default server;
