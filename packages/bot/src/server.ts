import { REST } from "@discordjs/rest";
import {
  APIApplicationCommandInteractionDataOption,
  APIInteraction,
  APIMessageComponentInteraction,
  APIMessageStringSelectInteractionData,
  APIUser,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  GatewayDispatchEvents,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { PlatformAlgorithm, isValidRequest } from "discord-verify";
import { eq } from "drizzle-orm";
import { IRequest, Router } from "itty-router";
import { getDb, getchTriggerGuild, upsertDiscordUser } from "store";
import { DurableStoredComponent } from "store/src/durable/components.js";
import {
  backups,
  discordMessageComponents,
  generateId,
  makeSnowflake,
  buttons as oButtons,
} from "store/src/schema";
import {
  Flow,
  FlowAction,
  FlowActionSendMessage,
  FlowActionToggleRole,
  FlowActionType,
  QueryData,
  StorableComponent,
} from "store/src/types";
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
import { LiveVariables, executeFlow } from "./flows/flows.js";
import { InteractionContext } from "./interactions.js";
import { Env } from "./types/env.js";
import { parseAutoComponentId } from "./util/components.js";
import { isDiscordError } from "./util/error.js";
export { DurableComponentState } from "store/src/durable/components.js";

const router = Router();

router.get("/", (_, env: Env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

const handleInteraction = async (
  request: IRequest,
  env: Env,
  eCtx: ExecutionContext,
) => {
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
      const db = getDb(env.HYPERDRIVE.connectionString);
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
        const dbComponent = await db.query.discordMessageComponents.findFirst({
          where: eq(
            discordMessageComponents.messageId,
            makeSnowflake(interaction.message.id),
          ),
          columns: {
            id: true,
            data: true,
            draft: true,
          },
        });
        if (!dbComponent) {
          return respond({
            error: response.statusText,
            status: response.status,
          });
        }
        await stub.fetch(`http://do/?id=${dbComponent.id}`, { method: "POST" });
        component = dbComponent;
      } else if (!response.ok) {
        return respond({
          error: response.statusText,
          status: response.status,
        });
      } else {
        component = (await response.json()) as DurableStoredComponent;
      }
      if (component.draft) {
        return respond({ error: "Component is marked as draft" });
      }
      const guildId = interaction.guild_id;
      if (!guildId) {
        return respond({ error: "No guild ID" });
      }

      const liveVars: LiveVariables = {
        guild: await getchTriggerGuild(rest, env.KV, guildId),
        member: interaction.member,
        user: interaction.member?.user,
      };

      let flows: Flow[] = [];
      switch (component.data.type) {
        case ComponentType.Button: {
          if (component.data.type !== interaction.data.component_type) break;

          if (component.data.style === ButtonStyle.Link) break;
          flows = [component.data.flow];
          break;
        }
        case ComponentType.StringSelect: {
          if (component.data.type !== interaction.data.component_type) break;

          flows = Object.entries(component.data.flows)
            .filter(([key]) =>
              (
                interaction.data as APIMessageStringSelectInteractionData
              ).values.includes(key),
            )
            .map(([_, flow]) => flow);
          break;
        }
        case ComponentType.ChannelSelect:
        case ComponentType.MentionableSelect:
        case ComponentType.RoleSelect:
        case ComponentType.UserSelect: {
          if (component.data.type !== interaction.data.component_type) break;

          flows = [component.data.flow];
          break;
        }
        default:
          break;
      }
      const ctx = new InteractionContext(rest, interaction, env);
      if (flows.length === 0) {
        return respond(
          ctx.reply({
            content: `There was no flow registered for this component. Configure one [here](${env.DISCOHOOK_ORIGIN}/component?id=${component.id}).`,
            flags: MessageFlags.Ephemeral,
          }),
        );
      }

      // Don't like this. We should be returning a response
      // from one of the flows instead, especially for modals.
      eCtx.waitUntil(
        (async () => {
          for (const flow of flows) {
            const result = await executeFlow(
              flow,
              rest,
              db,
              liveVars,
              {
                guildId,
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
      return respond(ctx.updateMessage({}));
    } else if (customId.startsWith("a_")) {
      // "Auto" components require only the state defined in their custom ID,
      // allowing them to have an unlimited timeout.
      // Example: `a_delete-reaction-role_123456789012345679:✨`
      //           auto  routing id       message id         reaction
      const { routingId } = parseAutoComponentId(customId);
      const stored = componentStore[routingId as ComponentRoutingId];
      if (!stored) {
        return respond({ error: "Unknown routing ID" });
      }

      const ctx = new InteractionContext(rest, interaction, env);
      try {
        const response = await (
          stored.handler as ComponentCallbackT<APIMessageComponentInteraction>
        )(ctx);
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
      const db = getDb(env.HYPERDRIVE.connectionString);
      const oldMessageButtons = await db.query.buttons.findMany({
        where: eq(oButtons.messageId, makeSnowflake(interaction.message.id)),
        columns: {
          id: true,
          roleId: true,
          customId: true,
          customLabel: true,
          emoji: true,
          style: true,
          customDmMessageData: true,
          customEphemeralMessageData: true,
          customPublicMessageData: true,
          type: true,
          url: true,
        },
      });

      const ctx = new InteractionContext(rest, interaction, env);
      if (oldMessageButtons.length === 0) {
        return respond(
          ctx.reply({
            content: "This message has no registered, migratable components.",
            flags: MessageFlags.Ephemeral,
          }),
        );
      }

      const getOldCustomId = (button: {
        roleId: bigint | null;
        customId: string | null;
      }): string | undefined => {
        if (button.roleId) {
          return `button_role:${interaction.message.id}-${button.roleId}`;
        } else if (button.customId) {
          // const match = /^button_role:\d+-(\d+)$/.exec(button.customId);
          // if (match) {
          // }
          return button.customId;
        }
      };

      eCtx.waitUntil(
        (async () => {
          const guildId = interaction.guild_id;
          if (!guildId) {
            return respond({ error: "No guild ID" });
          }

          const guild = await getchTriggerGuild(rest, env.KV, guildId);
          // Not sure if it's better for RL reasons to use guildMember instead?
          const owner = (await rest.get(
            Routes.user(guild.owner_id),
          )) as APIUser;
          const ownerUser = await upsertDiscordUser(db, owner);
          const customIdToTempId: Record<string, string> = Object.fromEntries(
            oldMessageButtons
              .filter((b) => !!getOldCustomId(b))
              .map((b) => [
                getOldCustomId(b),
                `Button: ${Math.floor(Math.random() * 10000000000)}`,
              ]),
          );
          const insertedBackups = await db
            .insert(backups)
            .values(
              oldMessageButtons
                .filter((b) => !!getOldCustomId(b))
                .map((b) => {
                  const dataStr =
                    b.customPublicMessageData ??
                    b.customEphemeralMessageData ??
                    b.customDmMessageData;
                  return {
                    // biome-ignore lint/style/noNonNullAssertion: Filter
                    name: customIdToTempId[getOldCustomId(b)!],
                    ownerId: ownerUser.id,
                    data: {
                      messages: [
                        {
                          data: b.roleId
                            ? {
                                content: `Toggled the <@&${b.roleId}> role for you.`,
                              }
                            : dataStr
                              ? JSON.parse(dataStr)
                              : {
                                  content: "No content available",
                                },
                        },
                      ],
                    } satisfies QueryData,
                    dataVersion: "d2",
                  };
                }),
            )
            .returning({ id: backups.id, name: backups.name });

          const oldIdMap: Record<string, string> = {};
          const inserted = await db
            .insert(discordMessageComponents)
            .values(
              oldMessageButtons.map((button) => {
                const old = getOldCustomId(button);
                const newId = generateId();
                const newCustomId = `p_${newId}`;
                if (old) {
                  oldIdMap[old] = newId;
                }
                // const newCustomId = old
                //   ? `p_${old}-${getCustomId(false).replace(/^p_/, "")}`.slice(
                //       0,
                //       100,
                //     )
                //   : undefined;

                return {
                  id: BigInt(newId),
                  channelId: makeSnowflake(interaction.channel.id),
                  guildId: makeSnowflake(guildId),
                  messageId: makeSnowflake(interaction.message.id),
                  draft: false,
                  data: {
                    type: ComponentType.Button,
                    label: button.customLabel ?? undefined,
                    emoji: button.emoji
                      ? button.emoji.startsWith("<")
                        ? {
                            id: button.emoji.split(":")[2].replace(/\>$/, ""),
                            name: button.emoji.split(":")[1],
                            animated: button.emoji.split(":")[0] === "<a",
                          }
                        : {
                            name: button.emoji,
                          }
                      : undefined,
                    ...(button.url
                      ? {
                          url: button.url,
                          style: ButtonStyle.Link,
                        }
                      : (() => {
                          const backupId = insertedBackups.find(
                            // biome-ignore lint/style/noNonNullAssertion:
                            (b) => b.name === customIdToTempId[old!],
                          )?.id;
                          return {
                            customId: newCustomId,
                            flow: {
                              name: "Flow",
                              actions: [
                                ...(button.roleId
                                  ? [
                                      {
                                        type: FlowActionType.ToggleRole,
                                        roleId: String(button.roleId),
                                      } satisfies FlowActionToggleRole,
                                    ]
                                  : []),
                                ...(backupId
                                  ? [
                                      {
                                        type: FlowActionType.SendMessage,
                                        backupId: backupId.toString(),
                                        response: true,
                                        flags:
                                          button.roleId ||
                                          button.customEphemeralMessageData
                                            ? MessageFlags.Ephemeral
                                            : undefined,
                                      } satisfies FlowActionSendMessage,
                                    ]
                                  : []),
                              ] satisfies FlowAction[],
                            } as Flow,
                            style:
                              (
                                {
                                  primary: ButtonStyle.Primary,
                                  secondary: ButtonStyle.Secondary,
                                  success: ButtonStyle.Success,
                                  danger: ButtonStyle.Danger,
                                } as const
                              )[button.style ?? "primary"] ??
                              ButtonStyle.Primary,
                          };
                        })()),
                  } satisfies StorableComponent,
                };
              }),
            )
            .onConflictDoNothing()
            .returning({
              id: discordMessageComponents.id,
              data: discordMessageComponents.data,
            });

          // TODO verify emojis for this
          const rows = interaction.message.components?.map((row) => ({
            ...row,
            components: row.components.map((component) => {
              if (
                component.type !== ComponentType.Button ||
                component.style === ButtonStyle.Link
              ) {
                return component;
              }

              const button = inserted.find(
                (b) => String(b.id) === oldIdMap[component.custom_id],
              );
              return {
                ...component,
                disabled: !button,
                // This shouldn't happen, but fall back anyway to avoid failure
                custom_id: button ? `p_${button.id}` : component.custom_id,
              };
            }),
          }));
          await ctx.followup.editOriginalMessage({
            // components: rows,
          });
          // Free up space. Not 100% sure about this
          // await db
          //   .delete(oButtons)
          //   .where(
          //     eq(oButtons.messageId, makeSnowflake(interaction.message.id)),
          //   );

          const thisButton = inserted.find(
            (b) => String(b.id) === oldIdMap[customId],
          );
          if (
            thisButton &&
            thisButton.data.type === ComponentType.Button &&
            thisButton.data.style !== ButtonStyle.Link
          ) {
            // Store the durable object for later
            const doId = env.COMPONENTS.idFromName(
              `${interaction.message.id}-${customId}`,
            );
            const stub = env.COMPONENTS.get(doId);
            await stub.fetch(`http://do/?id=${thisButton.id}`, {
              method: "POST",
            });

            const liveVars: LiveVariables = {
              guild,
              member: interaction.member,
              user: interaction.member?.user,
            };
            const result = await executeFlow(
              thisButton.data.flow,
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
    if (env.ENVIRONMENT === "dev") {
      env.HYPERDRIVE = { connectionString: env.DATABASE_URL } as Hyperdrive;
    }
    return router.handle(request, env, ctx);
  },
};

export default server;
