import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  APIMessage,
  APIWebhook,
  ButtonStyle,
  ComponentType,
  RESTJSONErrorCodes,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { getDOToken } from "~/durable/sessions";
import {
  TokenWithUser,
  User,
  authorizeRequest,
  doubleDecode,
  getEditorTokenStorage,
  getTokenGuildChannelPermissions,
  verifyToken,
} from "~/session.server";
import {
  StorableComponent,
  discordMessageComponents,
  discordMessageComponentsToFlows,
  eq,
  flowActions,
  flows,
  generateId,
  getDb,
  inArray,
  makeSnowflake,
  sql,
} from "~/store.server";
import { ZodAPIMessageActionRowComponent } from "~/types/components";
import { Env } from "~/types/env";
import { refineZodDraftFlowMax } from "~/types/flows";
import { isDiscordError } from "~/util/discord";
import { ActionArgs } from "~/util/loader";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";
import { getComponentId } from "./log.webhooks.$webhookId.$webhookToken.messages.$messageId";

// TODO: RPC function in discohook-bot to use stored tokens
export const getWebhook = async (
  webhookId: string,
  env: Env,
): Promise<APIWebhook> => {
  const db = getDb(env.HYPERDRIVE);
  const dbWebhook = await db.query.webhooks.findFirst({
    where: (webhooks, { eq, and }) =>
      and(eq(webhooks.platform, "discord"), eq(webhooks.id, webhookId)),
    columns: {
      id: true,
      name: true,
      avatar: true,
      channelId: true,
      token: true,
      applicationId: true,
      discordGuildId: true,
    },
  });
  if (dbWebhook) {
    return {
      type: WebhookType.Incoming, // hopefully we are not storing non-incoming webhooks
      id: dbWebhook.id,
      name: dbWebhook.name,
      channel_id: dbWebhook.channelId,
      avatar: dbWebhook.avatar,
      token: dbWebhook.token ?? undefined,
      guild_id: dbWebhook.discordGuildId?.toString(),
      application_id: dbWebhook.applicationId,
    } satisfies APIWebhook;
  }

  const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
  const webhook = (await rest.get(Routes.webhook(webhookId))) as APIWebhook;
  return webhook;
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  console.log(`[${request.method} Component]`, id);

  let [token, respond]:
    | Awaited<ReturnType<typeof authorizeRequest>>
    | [undefined, undefined] = [undefined, undefined];

  try {
    [token, respond] = await authorizeRequest(request, context);
  } catch (e) {
    // We need to accept temporary editor tokens as authentication here, but
    // we don't want to patch those in site-wide for API authentication.
    const storage = getEditorTokenStorage(context);
    const session = await storage.getSession(request.headers.get("Cookie"));
    const auth = session.get("Authorization");
    if (!auth) throw e;

    const [, tokenValue] = auth.split(" ");
    const { payload } = await verifyToken(
      tokenValue,
      context.env,
      context.origin,
    );
    if (payload.scp !== "editor") {
      throw json({ message: "Invalid token" }, 401);
    }

    // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
    const tokenId = payload.jti!;
    if (!(await getDOToken(context.env, tokenId, id))) {
      throw e;
    }

    const db = getDb(context.env.HYPERDRIVE);
    const dbToken = await db.query.tokens.findFirst({
      where: (tokens, { eq }) => eq(tokens.id, makeSnowflake(tokenId)),
      columns: {
        id: true,
        prefix: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            firstSubscribed: true,
            subscribedSince: true,
            subscriptionExpiresAt: true,
            lifetime: true,
            discordId: true,
          },
          with: {
            discordUser: {
              columns: {
                id: true,
                name: true,
                globalName: true,
                discriminator: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    if (!dbToken || !dbToken.user) {
      throw e;
    }

    token = doubleDecode<TokenWithUser>({
      id: dbToken.id,
      prefix: dbToken.prefix,
      user: dbToken.user as User,
    });
    respond = (response) => response;
  }

  switch (request.method) {
    case "PUT": {
      const component = await zxParseJson(
        request,
        ZodAPIMessageActionRowComponent,
      );
      const premium = userIsPremium(token.user);
      if ("flow" in component && component.flow) {
        const parsed = await refineZodDraftFlowMax(premium).safeParseAsync(
          component.flow,
        );
        if (parsed && !parsed.success) {
          throw respond(
            json(
              {
                message: parsed.error.message,
                issues: parsed.error.format(),
              },
              400,
            ),
          );
        }
      }
      if ("flows" in component && component.flows) {
        const errors = [];
        for (const flow of Object.values(component.flows)) {
          const parsed =
            await refineZodDraftFlowMax(premium).safeParseAsync(flow);
          if (!parsed.success) {
            errors.push(parsed.error);
          }
        }
        if (errors.length !== 0) {
          const issue = errors[0];
          for (const error of errors.splice(1)) {
            issue.addIssues(error.issues);
          }
          throw respond(
            json(
              {
                message: "Bad Request",
                issues: issue.format(),
              },
              400,
            ),
          );
        }
      }

      const db = getDb(context.env.HYPERDRIVE);
      const current = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          createdById: true,
          data: true,
          channelId: true,
        },
        with: {
          componentsToFlows: {
            columns: { flowId: true },
          },
        },
      });
      if (current?.channelId) {
        const permissions = await getTokenGuildChannelPermissions(
          token,
          current.channelId,
          context.env,
        );
        if (
          !permissions.owner &&
          !permissions.permissions.has(
            PermissionFlags.ViewChannel,
            PermissionFlags.ManageMessages,
            PermissionFlags.ManageWebhooks,
          )
        ) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }
      }
      if (!current) {
        throw respond(json({ message: "Unknown Component" }, 404));
      }
      if (!current.channelId && current.createdById !== BigInt(token.user.id)) {
        throw respond(json({ message: "You do not own this component" }, 403));
      }
      if (current.data.type !== component.type) {
        throw respond(json({ message: "Incorrect Type" }, 400));
      }

      const updated = await db.transaction(async (tx) => {
        await tx
          .delete(discordMessageComponentsToFlows)
          .where(
            eq(discordMessageComponentsToFlows.discordMessageComponentId, id),
          );
        const curFlowIds = current.componentsToFlows.map((ctf) => ctf.flowId);
        if (curFlowIds.length !== 0) {
          await tx.delete(flows).where(inArray(flows.id, curFlowIds));
        }

        const { custom_id: _, ...c } = component;
        let data: StorableComponent | undefined;
        let allFlowIds: string[] = [];
        switch (c.type) {
          case ComponentType.Button: {
            if (
              c.style === ButtonStyle.Link ||
              c.style === ButtonStyle.Premium
            ) {
              data = c; //{ ...current.data, ...c };
              break;
            }

            const { flow, ...rest } = c;

            const flowId = generateId();
            allFlowIds = [flowId];
            await tx
              .insert(flows)
              .values({ id: BigInt(flowId), name: flow?.name });
            if (flow && flow.actions.length !== 0) {
              await tx.insert(flowActions).values(
                flow.actions.map((action) => ({
                  flowId: BigInt(flowId),
                  type: action.type,
                  data: action,
                })),
              );
            }

            data = { ...rest, flowId };
            break;
          }
          case ComponentType.StringSelect: {
            let { flows: cFlows, ...rest } = c;
            cFlows = cFlows ?? {};
            const flowIds = Object.fromEntries(
              Object.keys(cFlows).map((optionValue) => [
                optionValue,
                generateId(),
              ]),
            );
            allFlowIds = Object.values(flowIds);

            if (Object.keys(flowIds).length !== 0) {
              await tx.insert(flows).values(
                Object.entries(cFlows).map(([optionValue, flow]) => ({
                  id: BigInt(flowIds[optionValue]),
                  name: flow.name,
                })),
              );
              const flowsWithActions = Object.entries(cFlows)
                .filter(([, flow]) => flow.actions.length !== 0)
                .map(([optionValue, flow]) => ({
                  id: BigInt(flowIds[optionValue]),
                  ...flow,
                }));
              if (flowsWithActions.length !== 0) {
                await tx.insert(flowActions).values(
                  flowsWithActions.flatMap((flow) =>
                    flow.actions.map((action) => ({
                      flowId: flow.id,
                      type: action.type,
                      data: action,
                    })),
                  ),
                );
              }
            }

            data = { ...rest, flowIds };
            break;
          }
          case ComponentType.UserSelect:
          case ComponentType.RoleSelect:
          case ComponentType.MentionableSelect:
          case ComponentType.ChannelSelect: {
            const flowId = generateId();
            allFlowIds = [flowId];
            const {
              flow,
              default_values: defaultValues,
              min_values: _,
              max_values: __,
              ...rest
            } = c;
            await tx
              .insert(flows)
              .values({ id: BigInt(flowId), name: flow?.name });
            if (flow && flow.actions.length !== 0) {
              await tx.insert(flowActions).values(
                flow.actions.map((action) => ({
                  flowId: BigInt(flowId),
                  type: action.type,
                  data: action,
                })),
              );
            }

            data = {
              ...rest,
              // See above
              minValues: 1,
              maxValues: 1,
              flowId,
              defaultValues,
            };
            break;
          }
          default:
            break;
        }
        if (!data) {
          throw json(
            { message: "Failed to compile data structure for the component" },
            500,
          );
        }

        if (allFlowIds.length !== 0) {
          await tx
            .insert(discordMessageComponentsToFlows)
            .values(
              allFlowIds.map((flowId) => ({
                discordMessageComponentId: id,
                flowId: BigInt(flowId),
              })),
            )
            .onConflictDoNothing();
        }

        const updated = (
          await tx
            .update(discordMessageComponents)
            .set({
              data,
              updatedById: token.user.id,
              updatedAt: sql`NOW()`,
            })
            .where(eq(discordMessageComponents.id, id))
            .returning({
              id: discordMessageComponents.id,
              data: discordMessageComponents.data,
              draft: discordMessageComponents.draft,
            })
        )[0];
        return updated;
      });

      return respond(json(updated));
    }
    case "DELETE": {
      const db = getDb(context.env.HYPERDRIVE);
      const current = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          createdById: true,
          channelId: true,
          messageId: true,
        },
      });
      if (current?.channelId) {
        const permissions = await getTokenGuildChannelPermissions(
          token,
          current.channelId,
          context.env,
        );
        if (
          !permissions.owner &&
          !permissions.permissions.has(
            PermissionFlags.ViewChannel,
            PermissionFlags.ManageMessages,
            PermissionFlags.ManageWebhooks,
          )
        ) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }
      }
      if (
        !current ||
        (!current.channelId && current.createdById !== token.user.id)
      ) {
        throw respond(json({ message: "Unknown Component" }, 404));
      }

      if (current.channelId && current.messageId) {
        const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
        let message: APIMessage | undefined;
        try {
          message = (await rest.get(
            Routes.channelMessage(
              String(current.channelId),
              String(current.messageId),
            ),
          )) as APIMessage;
        } catch (e) {
          if (
            !isDiscordError(e) ||
            e.code !== RESTJSONErrorCodes.UnknownMessage
          ) {
            // If the message no longer exists, we want to
            // still allow the user to delete the component
            throw e;
          }
        }

        if (message) {
          let columnIndex = 0;
          const row = message.components?.find((row) => {
            const x = row.components.findIndex((c) => getComponentId(c) === id);
            columnIndex = x;
            return x !== -1;
          });
          if (message.components && row) {
            if (!message.webhook_id) {
              throw respond(
                json(
                  {
                    message: "The associated message is not a webhook message.",
                  },
                  400,
                ),
              );
            }
            const webhook = await getWebhook(message.webhook_id, context.env);
            if (!webhook.token) {
              throw respond(
                json(
                  {
                    message:
                      "Could not obtain the token for the associated webhook. Try deleting through Discord.",
                  },
                  400,
                ),
              );
            }
            row.components.splice(columnIndex, 1);
            if (row.components.length === 0) {
              message.components.splice(message.components.indexOf(row), 1);
            }
            try {
              await rest.patch(
                Routes.webhookMessage(webhook.id, webhook.token, message.id),
                {
                  body: { components: message.components },
                  query:
                    message.position !== undefined
                      ? new URLSearchParams({ thread_id: message.channel_id })
                      : undefined,
                },
              );
            } catch (e) {
              if (isDiscordError(e) && e.status !== 404) {
                throw respond(
                  json(
                    {
                      message: `The component removal was rejected by Discord. You may have to edit or remove other components before removing this one. The error from Discord was: ${e.code} ${e.rawError.message}`,
                      raw: e.rawError,
                    },
                    400,
                  ),
                );
              }
            }
          }
        }
      }
      await db
        .delete(discordMessageComponents)
        .where(eq(discordMessageComponents.id, id));

      throw respond(new Response(null, { status: 204 }));
    }
    default:
      throw respond(
        new Response(null, {
          status: 405,
          statusText: "Method Not Allowed",
        }),
      );
  }
};
