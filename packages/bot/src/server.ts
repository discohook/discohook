import { REST } from "@discordjs/rest";
import {
  APIApplicationCommandInteractionDataOption,
  APIInteraction,
  APIMessageComponentInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GatewayDispatchEvents,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";
import { PlatformAlgorithm, isValidRequest } from "discord-verify";
import { Router } from "itty-router";
import { AppCommandCallbackT, appCommands, respond } from "./commands.js";
import {
  ComponentCallbackT,
  ComponentRoutingId,
  MinimumKVComponentState,
  ModalRoutingId,
  componentStore,
  modalStore,
} from "./components.js";
import { getErrorMessage } from "./errors.js";
import { eventNameToCallback } from "./events.js";
import { InteractionContext } from "./interactions.js";
import { Env } from "./types/env.js";
import { isDiscordError } from "./util/error.js";

const router = Router();

router.get("/", (_, env: Env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post("/", async (request, env: Env, eCtx: ExecutionContext) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response("Bad request signature.", { status: 401 });
  }

  const rest = new REST().setToken(env.DISCORD_TOKEN);

  if (interaction.type === InteractionType.Ping) {
    return respond({ type: InteractionResponseType.Pong });
  }

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
          const errorResponse = getErrorMessage(ctx, e.raw);
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

      const stored =
        componentStore[state.componentRoutingId as ComponentRoutingId];
      if (!stored) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env, state);
      try {
        const response = await (
          stored.handler as ComponentCallbackT<APIMessageComponentInteraction>
        )(ctx);
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
          const errorResponse = getErrorMessage(ctx, e.raw);
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

      const stored = modalStore[state.componentRoutingId as ModalRoutingId];
      if (!stored) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env, state);
      try {
        const response = await stored.handler(ctx);
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
          const errorResponse = getErrorMessage(ctx, e.raw);
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

  console.error("Unknown Type");
  return respond({ error: "Unknown Type" });
});

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

  const callback = eventNameToCallback[eventName as GatewayDispatchEvents];
  if (callback) {
    eCtx.waitUntil(callback(env, await request.json()));
    return new Response(null, { status: 204 });
  }
  return respond({ error: "No event callback found.", status: 404 });
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

async function verifyDiscordRequest(request: Request, env: Env) {
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

  const body = (await request.json()) as APIInteraction;
  return { interaction: body, isValid: true };
}

const server = {
  verifyDiscordRequest: verifyDiscordRequest,
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    return router.handle(request, env, ctx);
  },
};

export default server;
