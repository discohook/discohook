import { REST } from "@discordjs/rest";
import {
  type APIMessage,
  ButtonStyle,
  ComponentType,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import { data as json } from "react-router";
import {
  canModifyComponent,
  getWebhook,
} from "~/api/v1/util/components.server";
import {
  getActionRowComponentPath,
  removeEmptyActionRows,
  replaceComponentByPath,
} from "~/routes/edit.component.$id";
import {
  authorizeRequest,
  doubleDecode,
  getEditorTokenStorage,
  type TokenWithUser,
  type User,
  verifyToken,
} from "~/session.server";
import {
  autoRollbackTx,
  destroyComponentKV,
  discordMessageComponents,
  type DraftComponent,
  eq,
  getDb,
  makeSnowflake,
} from "~/store.server";
import { ZodAPIMessageActionRowComponent } from "~/types/components";
import { hasGuildOnlyActions, refineZodDraftFlowMax } from "~/types/flows";
import { APIComponentInMessageActionRow } from "~/types/QueryData";
import { isComponentsV2, isDiscordError } from "~/util/discord";
import { type ActionArgs, jsonR } from "~/util/loader";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";

const checkActionValidity = async ({
  current,
  component,
  onFailure = (message, status = 400) => {
    throw Error(`${status}: ${message}`);
  },
}: {
  current: { guildId: bigint | null };
  component: APIComponentInMessageActionRow;
  onFailure: (message: string, status?: number) => void;
}) => {
  if (!current.guildId) {
    if ("flow" in component && component.flow) {
      if (hasGuildOnlyActions(component.flow)) {
        return onFailure(
          "The component is not part of a server, but it contains server-only flow actions",
        );
      }
    }
    if ("flows" in component && component.flows) {
      const optionVals: string[] = [];
      for (const [val, flow] of Object.entries(component.flows)) {
        if (hasGuildOnlyActions(flow)) optionVals.push(val);
      }
      if (optionVals.length !== 0) {
        return onFailure(
          `The component is not part of a server, but its flows contain server-only actions. Affected options: ${optionVals.join(", ")}`,
        );
      }
    }
  }
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });

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
      throw jsonR({ message: "Invalid token" }, 401);
    }
    if (!payload.sub) throw e;
    const subject = JSON.parse(payload.sub) as {
      user: {
        id: string;
        name: string;
        avatar: string | null;
      };
    };

    // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
    const tokenId = payload.jti!;

    const db = getDb(context.env.HYPERDRIVE);
    const dbUser = await db.query.users.findFirst({
      where: (table, { eq }) =>
        eq(table.discordId, makeSnowflake(subject.user.id)),
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
    });
    if (!dbUser) throw e;

    token = doubleDecode<TokenWithUser>({
      id: BigInt(tokenId),
      prefix: "editor",
      user: dbUser as User,
    });
    respond = (response) => response;
  }

  try {
    switch (request.method) {
      case "PUT": {
        const body = await request.json();
        const parsed = await ZodAPIMessageActionRowComponent.spa(body);
        if (!parsed.success) {
          throw respond(
            json(
              { message: parsed.error.message, issues: parsed.error.format() },
              400,
            ),
          );
        }
        const component = parsed.data;

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
            guildId: true,
            channelId: true,
          },
        });
        if (!current) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }
        if (!(await canModifyComponent(context.env, current, token))) {
          throw respond(
            json({ message: "You do not own this component" }, 403),
          );
        }
        if (current.data.type !== component.type) {
          throw respond(json({ message: "Incorrect Type" }, 400));
        }
        // await checkActionValidity({
        //   current,
        //   component,
        //   onFailure(message, status = 400) {
        //     throw respond(json({ message }, { status }));
        //   },
        // });

        const updated = await db.transaction(
          autoRollbackTx(async (tx) => {
            const { custom_id: _, ...c } = component;
            let data: DraftComponent | undefined;
            switch (c.type) {
              case ComponentType.Button: {
                if (
                  c.style === ButtonStyle.Link ||
                  c.style === ButtonStyle.Premium
                ) {
                  data = c;
                  break;
                }
                data = { ...c, flow: c.flow ?? { actions: [] } };
                break;
              }
              case ComponentType.StringSelect: {
                const {
                  min_values: _,
                  max_values: __,
                  flows = {},
                  ...rest
                } = c;
                data = { ...rest, minValues: 1, maxValues: 1, flows };
                break;
              }
              case ComponentType.UserSelect:
              case ComponentType.RoleSelect:
              case ComponentType.MentionableSelect:
              case ComponentType.ChannelSelect: {
                const {
                  default_values: defaultValues,
                  min_values: _,
                  max_values: __,
                  flow = { actions: [] },
                  ...rest
                } = c;
                data = {
                  ...rest,
                  minValues: 1,
                  maxValues: 1,
                  defaultValues,
                  flow,
                };
                break;
              }
              default:
                break;
            }

            if (!data) {
              throw respond(
                json(
                  {
                    message:
                      "Failed to compile data structure for the component",
                  },
                  500,
                ),
              );
            }

            const updated = (
              await tx
                .update(discordMessageComponents)
                .set({
                  data,
                  updatedById: token.user.id,
                })
                .where(eq(discordMessageComponents.id, id))
                .returning({
                  id: discordMessageComponents.id,
                  data: discordMessageComponents.data,
                  draft: discordMessageComponents.draft,
                })
            )[0];
            return updated;
          }),
        );

        return respond(json(updated));
      }
      case "PATCH": {
        const db = getDb(context.env.HYPERDRIVE);
        const current = await db.query.discordMessageComponents.findFirst({
          where: (table, { eq }) => eq(table.id, id),
          columns: {
            createdById: true,
            updatedById: true,
            guildId: true,
            channelId: true,
            messageId: true,
          },
        });
        if (
          !current ||
          !(await canModifyComponent(context.env, current, token))
        ) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }

        // We're eventually going to move to "placements" which don't bind
        // components to one guild in particular, alleviating lots of headaches
        const payload = await zxParseJson(request, {
          guildId: snowflakeAsString().optional(),
          channelId: snowflakeAsString().optional(),
          messageId: snowflakeAsString().optional(),
          // draft: z.boolean().optional(),
        });
        const update: Pick<
          typeof discordMessageComponents.$inferInsert,
          "channelId" | "messageId" | "guildId" | "draft" | "updatedById"
        > = {
          updatedById: BigInt(token.user.id),
        };
        if (payload.channelId && payload.messageId && payload.guildId) {
          if (
            current.guildId &&
            payload.guildId !== current.guildId &&
            current.createdById !== BigInt(token.user.id)
          ) {
            throw respond(
              json(
                {
                  message:
                    "Only the component owner can modify guild ID when one is already set",
                },
                403,
              ),
            );
          }

          update.messageId = payload.messageId;
          update.channelId = payload.channelId;
          update.guildId = payload.guildId;
          update.draft = false;
        }

        if (
          Object.keys(update).length > 2 ||
          // "take responsibility" button with empty patch
          update.updatedById !== current.updatedById
        ) {
          await db
            .update(discordMessageComponents)
            .set(update)
            .where(eq(discordMessageComponents.id, id));
        }

        throw respond(new Response(null, { status: 204 }));
      }
      case "DELETE": {
        const db = getDb(context.env.HYPERDRIVE);
        const current = await db.query.discordMessageComponents.findFirst({
          where: (table, { eq }) => eq(table.id, id),
          columns: {
            createdById: true,
            channelId: true,
            messageId: true,
            data: true,
          },
        });
        if (
          !current ||
          !(await canModifyComponent(context.env, current, token))
        ) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }

        if (current.channelId && current.messageId) {
          await destroyComponentKV(context.env, id);

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
            if (message.components && message.components.length !== 0) {
              const components = message.components;
              let path: number[] | undefined;
              try {
                ({ path } = getActionRowComponentPath(
                  components,
                  current.data,
                  id,
                  isComponentsV2(message),
                ));
              } catch (e) {
                if (
                  !(
                    e instanceof Error &&
                    e.message.startsWith("Failed to find the component")
                  )
                ) {
                  throw e;
                }
              }
              if (path) {
                replaceComponentByPath(components, path, null);
                removeEmptyActionRows(components);

                const webhook = await getWebhook(
                  message.webhook_id,
                  context.env,
                );
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

                try {
                  await rest.patch(
                    Routes.webhookMessage(
                      webhook.id,
                      webhook.token,
                      message.id,
                    ),
                    {
                      body: { components },
                      query:
                        message.position !== undefined
                          ? new URLSearchParams({
                              thread_id: message.channel_id,
                            })
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
  } catch (e) {
    if (e instanceof Response) throw e;

    const eid = Math.floor(Math.random() * 10000);
    console.error(`Component ${request.method} error: ${eid}`, e);
    throw respond(
      json(
        {
          message: `Unexpected server error. Reference number: ${eid}${
            e instanceof Error ? `, message: ${e.message}` : ""
          }`,
        },
        { status: 500 },
      ),
    );
  }
};
