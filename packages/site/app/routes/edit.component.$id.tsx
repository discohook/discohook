import { REST } from "@discordjs/rest";
import { defer, json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIActionRowComponent,
  APIChannel,
  APIComponentInContainer,
  APIComponentInModalActionRow,
  APIMessage,
  APISectionComponent,
  APIWebhook,
  ButtonStyle,
  ChannelType,
  ComponentType,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  Routes,
} from "discord-api-types/v10";
import { TFunction } from "i18next";
import { JWTPayload } from "jose";
import { useEffect, useMemo, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { getChannelIconType } from "~/api/v1/channels.$channelId";
import { loader as ApiGetGuildWebhookToken } from "~/api/v1/guilds.$guildId.webhooks.$webhookId.token";
import type { action as ApiAuditLogAction } from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { getComponentId } from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { submitComponent } from "~/components/editor/ComponentEditor";
import {
  getComponentText,
  getComponentWidth,
  getRowWidth,
} from "~/components/editor/TopLevelComponentEditor";
import { CoolIcon, CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { Message } from "~/components/preview/Message.client";
import { getDOToken } from "~/durable/sessions";
import { ComponentEditForm } from "~/modals/ComponentEditModal";
import { EditingFlowData, FlowEditModal } from "~/modals/FlowEditModal";
import { submitMessage } from "~/modals/MessageSendModal";
import {
  getEditorTokenStorage,
  getGuild,
  getUser,
  verifyToken,
} from "~/session.server";
import {
  DraftComponent,
  Flow,
  StorableComponent,
  discordMessageComponents,
  eq,
  getDb,
  launchComponentDurableObject,
  makeSnowflake,
  messageLogEntries,
  tokens,
} from "~/store.server";
import type {
  APIButtonComponentWithCustomId,
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
} from "~/types/QueryData";
import { ZodAPITopLevelComponentRaw } from "~/types/components-raw";
import {
  ResolutionKey,
  ResolvableAPIChannel,
  ResolvableAPIEmoji,
  ResolvableAPIRole,
  useCache,
} from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS, MAX_V1_ROWS } from "~/util/constants";
import {
  cdnImgAttributes,
  getRemainingComponentsCount,
  isActionRow,
  isComponentHousable,
  isComponentsV2,
  isDiscordError,
  isStorableComponent,
  onlyActionRows,
} from "~/util/discord";
import { draftFlowToFlow, flowToDraftFlow } from "~/util/flow";
import { ActionArgs, LoaderArgs, useSafeFetcher } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { getUserAvatar, userIsPremium } from "~/util/users";
import {
  snowflakeAsString,
  zxParseJson,
  zxParseParams,
  zxParseQuery,
} from "~/util/zod";
import { safePushState } from "./_index";

const ROW_MAX_WIDTH = 5;
const ROW_MAX_INDEX = ROW_MAX_WIDTH - 1;
const MAX_V1_ROWS_INDEX = MAX_V1_ROWS - 1;

interface KVComponentEditorState {
  interactionId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  path?: number[];
}

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const { token: editorToken } = zxParseQuery(request, {
    token: z.ostring(),
  });
  const db = getDb(context.env.HYPERDRIVE);

  const redirectUrl = `/auth/discord?${new URLSearchParams({
    // We're purposely trimming the original request's query because it
    // probably contains the token and nothing else. We don't need that.
    redirect: new URL(request.url).pathname,
  })}`;

  const user = await getUser(request, context);
  let needUserAuth = false;

  const headers = new Headers();
  let editingMeta: KVComponentEditorState | undefined;

  const processEditorToken = async (tokenValue: string) => {
    // Fall back to user auth if the editor token is invalid in any way
    const needsUserAuthInner = async (): Promise<boolean> => {
      let payload: JWTPayload;
      try {
        ({ payload } = await verifyToken(
          tokenValue,
          context.env,
          context.origin,
        ));
      } catch {
        return true;
      }
      if (payload.scp !== "editor") {
        return true;
      }
      // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
      const tokenId = payload.jti!;

      const cached = await getDOToken(context.env, tokenId, id);
      if (cached) {
        editingMeta = cached;

        const storage = getEditorTokenStorage(context);
        const session = await storage.getSession(request.headers.get("Cookie"));
        session.set("Authorization", `Editor ${tokenValue}`);
        headers.append("Set-Cookie", await storage.commitSession(session));
      } else {
        // Token does not have permission data for this component. At the moment
        // this means the token is expired, since we don't generate multiple
        // permissions for a single token. Additionally, if someone manually
        // transplanted this token onto a different component editor, then it's
        // been leaked and should be deleted anyway.
        await db.delete(tokens).where(eq(tokens.id, makeSnowflake(tokenId)));
        return true;
      }

      const token = await db.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.id, makeSnowflake(tokenId)),
        columns: {
          id: true,
          prefix: true,
        },
      });
      if (!token || token.prefix !== payload.scp) {
        return true;
      }
      return needUserAuth;
    };
    needUserAuth = await needsUserAuthInner();
  };

  if (editorToken) {
    await processEditorToken(editorToken);
  } else if (!user) {
    const storage = getEditorTokenStorage(context);
    const session = await storage.getSession(request.headers.get("Cookie"));
    const auth = session.get("Authorization");
    if (!auth) {
      needUserAuth = true;
    } else {
      const [, tokenValue] = auth.split(" ");
      await processEditorToken(tokenValue);
    }
  }

  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    columns: {
      id: true,
      data: true,
      draft: true,
      createdById: true,
      guildId: true,
      channelId: true,
      messageId: true,
    },
    with: {
      componentsToFlows: {
        columns: {},
        with: {
          flow: {
            with: { actions: true },
          },
        },
      },
    },
  });
  if (!component) {
    throw json({ message: "Unknown Component" }, 404);
  }
  if (needUserAuth) {
    if (!user) {
      throw redirect(redirectUrl);
    }
    if (component.createdById !== BigInt(user.id)) {
      throw json(
        { message: "You do not have edit access to this component." },
        403,
      );
    }
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let threadId: string | undefined;
  let message:
    | Pick<APIMessage, "resolved" | "components" | "webhook_id" | "flags">
    | undefined;
  if (component.channelId && component.messageId) {
    let msg: APIMessage | undefined;
    try {
      msg = (await rest.get(
        Routes.channelMessage(
          String(component.channelId),
          String(component.messageId),
        ),
      )) as APIMessage;
    } catch (e) {
      if (isDiscordError(e)) {
        throw json(e.rawError, 500);
      }
      console.error(e);
      throw json({ message: "Failed to fetch message" }, 500);
    }
    if (msg.position !== undefined) {
      threadId = msg.channel_id;
    }
    const { resolved, components, webhook_id, flags } = msg;
    message = { resolved, components, webhook_id, flags };
  } else {
    console.log({
      message: "Component is missing a channelId or messageId",
      componentId: component.id,
      guildId: component.guildId,
      channelId: component.channelId,
      messageId: component.messageId,
    });
  }

  let emojis: ResolvableAPIEmoji[] = [];
  let roles: ResolvableAPIRole[] = [];
  if (component.guildId) {
    try {
      const guild = await getGuild(component.guildId, rest, context.env);
      emojis = guild.emojis.map(
        (emoji) =>
          ({
            id: emoji.id ?? undefined,
            name: emoji.name ?? "",
            animated: emoji.animated,
            available: emoji.available === false ? false : undefined,
          }) as ResolvableAPIEmoji,
      );
      roles = guild.roles.map(
        (role) =>
          ({
            id: role.id,
            name: role.name,
            color: role.color,
            managed: role.managed,
            mentionable: role.mentionable,
            position: role.position,
            unicode_emoji: role.unicode_emoji,
            icon: role.icon,
          }) as ResolvableAPIRole,
      );
    } catch {}
  }

  const channels = (async () => {
    if (component.guildId) {
      try {
        return (
          (await rest.get(
            Routes.guildChannels(String(component.guildId)),
          )) as APIChannel[]
        )
          .filter((c) =>
            [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum,
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.AnnouncementThread,
              ChannelType.GuildVoice,
              ChannelType.GuildStageVoice,
            ].includes(c.type),
          )
          .map(
            (channel) =>
              ({
                id: channel.id,
                name: channel.name,
                type: getChannelIconType(channel),
                tags:
                  "available_tags" in channel
                    ? channel.available_tags
                    : undefined,
              }) as ResolvableAPIChannel,
          );
      } catch {}
    }
    return [];
  })();

  return defer(
    {
      user,
      component,
      token: editorToken,
      editingMeta,
      message,
      emojis,
      roles,
      channels,
      threadId,
    },
    { headers },
  );
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  // const { token, path, initialPath } = await zxParseJson(request, {
  //   token: z.ostring(),
  //   path: z.number().array().min(2).max(3).optional(),
  //   initialPath: z.number().array().min(2).max(3).optional(),
  // });
  const { token, components } = await zxParseJson(request, {
    token: z.ostring(),
    components: ZodAPITopLevelComponentRaw.array().optional(),
  });
  let tokenData: KVComponentEditorState | undefined;
  if (token) {
    if (!components) {
      // This is because users logged in regularly (technically a different
      // sort of flow) are permitted to edit directly from the frontend,
      // saving us a Discord request and storage interaction.
      throw json({ message: "`components` required when using `token`" }, 400);
    }

    let payload: JWTPayload;
    try {
      ({ payload } = await verifyToken(token, context.env, context.origin));
    } catch {
      throw json({ message: "Invalid token" }, 401);
    }
    if (payload.scp !== "editor") {
      throw json({ message: "Invalid token" }, 401);
    }
    // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
    const tokenId = payload.jti!;

    const cached = await getDOToken(context.env, tokenId, id);
    if (!cached) {
      throw json(
        {
          message:
            "Interaction has timed out, log in normally to edit the message.",
        },
        404,
      );
    }
    // Save new data, but do not extend lifespan of the token
    // if (JSON.stringify(cached.path) !== JSON.stringify(path)) {
    //   tokenData = { ...cached, path };
    //   await patchDOToken(context.env, tokenId, id, { data: tokenData });
    // }
  }

  const user = await getUser(request, context);

  const db = getDb(context.env.HYPERDRIVE);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    columns: {
      id: true,
      data: true,
      draft: true,
      // createdById: true,
      // guildId: true,
      channelId: true,
      messageId: true,
    },
  });
  if (!component) {
    throw json({ message: "Unknown Component" }, 404);
  }
  if (!component.channelId || !component.messageId) {
    throw json(
      { message: "Cannot use this route to modify a message-less component" },
      400,
    );
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);

  let message: APIMessage;
  try {
    message = (await rest.get(
      Routes.channelMessage(
        String(component.channelId),
        String(component.messageId),
      ),
    )) as APIMessage;
  } catch {
    throw json({ message: "Failed to retrieve the message" }, 400);
  }
  const threadId =
    message.position !== undefined ? message.channel_id : undefined;

  let isDraft = component.draft;
  for (const row of onlyActionRows(message.components ?? [])) {
    for (const rowComponent of row.components) {
      if (
        getComponentId(rowComponent) === component.id &&
        rowComponent.type === component.data.type
      ) {
        isDraft = false;
        break;
      }
    }
  }

  const built = buildStorableComponent(component.data, String(component.id));
  // Token authorization means the user isn't allowed to see the webhook's
  // credentials, so we must insert the component and edit the message for
  // them.
  if (
    tokenData &&
    message.webhook_id &&
    // type guard; actually ensured above (must exist with token)
    components
  ) {
    // TODO: use service binding to take advantage of the bot's token store
    const webhook = (await rest.get(
      Routes.webhook(message.webhook_id),
    )) as APIWebhook;
    if (!webhook.token) {
      throw json(
        {
          message:
            "Cannot edit the message because the webhook token is inaccessible.",
        },
        401,
      );
    }

    // TODO:
    // With components V2 the simple insertion method doesn't really work
    // anymore. So instead we allow the user to submit all components, but
    // merge the payloads such that it's not possible for a hijacked editor
    // token to substantially modify the message content.
    // const components = message.components ?? [];
    // if (JSON.stringify(initialPath) === JSON.stringify(path)) {
    //   replaceComponentByPath(components, path, built);
    // } else {
    //   // TODO: determine offsets caused by deleting empty rows post-move
    //   replaceComponentByPath(components, initialPath, null);
    //   replaceComponentByPath(components, path, built);
    // }

    // const submitted = bodyComponents!;
    // let i = -1;
    // for (const topRow of submitted) {
    //   i += 1;
    //   switch (topRow.type) {
    //     case ComponentType.ActionRow: {
    //       if (
    //         topRow.components.length === 1 &&
    //         isSameComponent({
    //           child: topRow.components[0],
    //           component: component.data,
    //           componentId: component.id,
    //         })
    //       ) {
    //         const source = components[i];
    //         if (
    //           // Checking if insertion is necessary
    //           source.type !== topRow.type ||
    //           source.components.length > 1 ||
    //           !isSameComponent({
    //             child: source.components[0],
    //             component: component.data,
    //             componentId: component.id,
    //           })
    //         ) {
    //           // User created a new row for this component; the top level
    //           // component in the source message is not the same as this
    //           // action row.
    //           components.splice(i, 0, topRow);
    //         } else {
    //           source.components.splice(path[1], 1, built);
    //         }
    //       } else {
    //         const x = topRow.components.findIndex((child) =>
    //           isSameComponent({
    //             child,
    //             component: component.data,
    //             componentId: component.id,
    //           }),
    //         );
    //         if (x !== -1) {
    //           // The component is in a row that already exists. The user
    //           // cannot move rows in this editor, but the index might still be
    //           // mismatched because the component might have been moved from a
    //           // higher row that is now empty (thus deleted).
    //         }
    //       }
    //       break;
    //     }
    //   }
    // }

    try {
      const edited = (await rest.patch(
        Routes.webhookMessage(webhook.id, webhook.token, message.id),
        {
          body: {
            components,
          } satisfies RESTPatchAPIWebhookWithTokenMessageJSONBody,
          query: threadId
            ? new URLSearchParams({ thread_id: threadId })
            : undefined,
        },
      )) as APIMessage;
      for (const row of onlyActionRows(edited.components ?? [])) {
        for (const rowComponent of row.components) {
          if (
            getComponentId(rowComponent) === component.id &&
            rowComponent.type === component.data.type
          ) {
            isDraft = false;
            break;
          }
        }
      }
    } catch (e) {
      if (isDiscordError(e)) {
        throw json(e.rawError, e.status);
      }
      throw e;
    }
    await db
      .insert(messageLogEntries)
      .values({
        type: "edit",
        channelId: message.channel_id,
        discordGuildId: webhook.guild_id
          ? makeSnowflake(webhook.guild_id)
          : undefined,
        webhookId: webhook.id,
        messageId: message.id,
        threadId,
        // Considered defaulting to token creator since they "authorized" this
        // edit but I think that would be misleading since a token could have
        // theoretically been hijacked and you don't want to pin that on the
        // wrong user.
        userId: user?.id,
      })
      .onConflictDoNothing();
  }

  const updated = (
    await db
      .update(discordMessageComponents)
      .set({ draft: isDraft })
      .where(eq(discordMessageComponents.id, id))
      .returning({
        id: discordMessageComponents.id,
        data: discordMessageComponents.data,
        draft: discordMessageComponents.draft,
      })
  )[0];

  if (built.custom_id) {
    await launchComponentDurableObject(context.env, {
      messageId: message.id,
      customId: built.custom_id,
      componentId: component.id,
    });
  }
  return updated;
};

export const buildStorableComponent = (
  component: StorableComponent,
  id: string,
  flows: Flow[] = [],
): APIComponentInMessageActionRow => {
  switch (component.type) {
    case ComponentType.Button: {
      if (component.style === ButtonStyle.Link) {
        return component;
      }
      // if (isSkuButton(component)) {
      // }
      return {
        ...component,
        custom_id: `p_${id}`,
        flow: flows[0] ? flowToDraftFlow(flows[0]) : { actions: [] },
      } as APIButtonComponentWithCustomId;
    }
    case ComponentType.StringSelect: {
      const {
        minValues: min_values,
        maxValues: max_values,
        ...rest
      } = component;

      return {
        ...rest,
        custom_id: `p_${id}`,
        min_values,
        max_values,
        flows: Object.fromEntries(
          Object.entries(rest.flowIds).map(([optionValue, flowId]) => {
            const flow = flows.find((flow) => String(flow.id) === flowId);
            return [
              optionValue,
              flow ? flowToDraftFlow(flow) : { actions: [] },
            ];
          }),
        ),
      };
    }
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect: {
      const {
        minValues: min_values,
        maxValues: max_values,
        defaultValues: default_values,
        ...rest
      } = component;

      return {
        ...rest,
        custom_id: `p_${id}`,
        min_values,
        max_values,
        // @ts-expect-error
        default_values,
        flow: flows[0] ? flowToDraftFlow(flows[0]) : { actions: [] },
      };
    }
    default:
      break;
  }
  throw Error("Unsupported storable component type.");
};

export const unresolveStorableComponent = (
  component: DraftComponent,
): { component: StorableComponent; flows: Flow[] } => {
  switch (component.type) {
    case ComponentType.Button: {
      if (
        component.style === ButtonStyle.Link ||
        component.style === ButtonStyle.Premium
      ) {
        return { component, flows: [] };
      }
      const { flow, ...rest } = component;
      return {
        component: {
          ...rest,
          flowId: "0",
        },
        flows: [draftFlowToFlow(flow)],
      };
    }
    case ComponentType.StringSelect: {
      const { flows, ...rest } = component;
      const flowIds: Record<string, string> = {};
      const undraftedFlows: Flow[] = [];
      Object.entries(flows).forEach(([optionValue, flow], i) => {
        const undrafted = draftFlowToFlow(flow);
        undrafted.id = BigInt(i);
        for (const a of undrafted.actions) {
          a.flowId = BigInt(i);
        }
        flowIds[optionValue] = String(i);
        undraftedFlows.push(undrafted);
      });
      return {
        component: {
          ...rest,
          flowIds,
        },
        flows: undraftedFlows,
      };
    }
    case ComponentType.RoleSelect:
    case ComponentType.UserSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.MentionableSelect: {
      const { flow, ...rest } = component;
      return {
        component: {
          ...rest,
          flowId: "0",
        },
        flows: [draftFlowToFlow(flow)],
      };
    }
    default:
      throw new Error("Unhandled component type");
  }
};

const isSameComponent = ({
  child,
  component,
  componentId,
}: {
  /** Usually a child of an action row, not the one we're editing */
  child: APIComponentInMessageActionRow;
  /** The component we're editing and will check against */
  component: {
    type: APIComponentInMessageActionRow["type"];
    style?: ButtonStyle;
    url?: string;
    label?: string;
  };
  componentId: string | bigint;
}): boolean => {
  const childId = getComponentId(child)?.toString();
  return childId
    ? childId === componentId.toString()
    : component.type === ComponentType.Button &&
        component.style === ButtonStyle.Link &&
        child.type === component.type &&
        child.style === component.style
      ? child.url === component.url && child.label === component.label
      : false;
};

const rowHasSpace = <
  T extends APIComponentInMessageActionRow | APIComponentInModalActionRow,
>(
  row: APIActionRowComponent<T>,
  component: T,
) => ROW_MAX_WIDTH - getRowWidth(row) >= getComponentWidth(component);

const IndividualActionRowComponentChild = ({
  t,
  component,
  componentId,
  child,
  actionsBar,
}: {
  t: TFunction;
  component: APIComponentInMessageActionRow;
  componentId: bigint | string;
  child: APIComponentInMessageActionRow;
  actionsBar: {
    up: (() => void) | null;
    down: (() => void) | null;
  };
}) => {
  const id = getComponentId(child)?.toString();
  const previewText = getComponentText(child);
  const isLiveComponent = isSameComponent({
    child,
    component,
    componentId,
  });

  return (
    <div
      className={twJoin(
        "flex text-base rounded-lg shadow hover:shadow-lg transition font-semibold select-none",
        "text-gray-600 dark:text-gray-400 bg-blurple/10 hover:bg-blurple/15 border border-blurple/30",
      )}
    >
      <div className="flex p-2 h-full w-full my-auto truncate disabled:animate-pulse">
        <div className="ltr:mr-2 rtl:ml-2 my-auto w-6 h-6 shrink-0">
          {child.type === ComponentType.Button ? (
            <div
              className={twJoin(
                "rounded text-gray-50",
                isLinkButton(child) ? "p-[5px_5px_4px_4px]" : "w-full h-full",
                {
                  [ButtonStyle.Primary]: "bg-blurple",
                  [ButtonStyle.Premium]: "bg-blurple",
                  [ButtonStyle.Secondary]: "bg-[#6d6f78] dark:bg-[#4e5058]",
                  [ButtonStyle.Link]: "bg-[#6d6f78] dark:bg-[#4e5058]",
                  [ButtonStyle.Success]: "bg-[#248046] dark:bg-[#248046]",
                  [ButtonStyle.Danger]: "bg-[#da373c]",
                }[child.style],
              )}
            >
              {isLinkButton(child) && (
                <CoolIcon icon="External_Link" className="block" />
              )}
            </div>
          ) : (
            <div className="rounded bg-[#6d6f78] dark:bg-[#4e5058] p-[5px_5px_4px_4px]">
              <CoolIcon
                icon={
                  (
                    {
                      [ComponentType.StringSelect]: "Chevron_Down",
                      [ComponentType.UserSelect]: "Users",
                      [ComponentType.RoleSelect]: "Tag",
                      [ComponentType.MentionableSelect]: "Mention",
                      [ComponentType.ChannelSelect]: "Chat",
                    } as Record<(typeof child)["type"], CoolIconsGlyph>
                  )[child.type]
                }
                className="block"
              />
            </div>
          )}
        </div>
        <p className="truncate my-auto">
          {previewText || t(`component.${child.type}`)}
        </p>
      </div>
      <div className="ltr:ml-auto rtl:mr-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0 p-2 pl-0">
        <button
          type="button"
          className={!isLiveComponent || actionsBar.up === null ? "hidden" : ""}
          onClick={() => actionsBar.up?.()}
        >
          <CoolIcon icon="Chevron_Up" />
        </button>
        <button
          type="button"
          className={
            !isLiveComponent || actionsBar.down === null ? "hidden" : ""
          }
          onClick={() => actionsBar.down?.()}
        >
          <CoolIcon icon="Chevron_Down" />
        </button>
      </div>
    </div>
  );
};

type Data = Pick<APIMessage, "webhook_id" | "resolved" | "flags"> & {
  components: NonNullable<APIMessageTopLevelComponent[]>;
};

const moveUp =
  ({
    ci,
    child,
    row,
    setData,
  }: {
    ci: number;
    child: APIComponentInMessageActionRow;
    row: APIActionRowComponent<APIComponentInMessageActionRow>;
    setData: React.Dispatch<Partial<Data>>;
  }) =>
  () => {
    row.components.splice(ci, 1);
    row.components.splice(ci - 1, 0, child);
    setData({});
  };

const moveDown =
  ({
    ci,
    child,
    row,
    setData,
  }: {
    ci: number;
    child: APIComponentInMessageActionRow;
    row: APIActionRowComponent<APIComponentInMessageActionRow>;
    setData: React.Dispatch<Partial<Data>>;
  }) =>
  () => {
    row.components.splice(ci, 1);
    row.components.splice(ci + 1, 0, child);
    setData({});
  };

const AddRowPromptButton = ({
  t,
  splice,
}: { t: TFunction; splice: () => void }) => {
  return (
    <button
      type="button"
      className={twJoin(
        "group/row-prompt py-1",
        "rounded-lg gap-x-2 flex font-medium select-none w-full",
      )}
      onClick={splice}
    >
      <div className="my-auto grow h-px rounded bg-gray-100 dark:bg-primary-500" />
      <p
        className={twJoin(
          "my-auto mx-auto px-2 py-0.5 transition-colors text-xs rounded-lg",
          "group-hover/row-prompt:bg-gray-100 group-hover/row-prompt:dark:bg-primary-500",
        )}
      >
        <CoolIcon icon="Add_Row" /> {t("addRow")}
      </p>
      <div className="my-auto grow h-px rounded bg-gray-100 dark:bg-primary-500" />
    </button>
  );
};

// This probably shouldn't be its own function
const isSectionAccessory = (data: Data, path: number[]): boolean => {
  const first = data.components[path[0]];
  if (first?.type === ComponentType.Container) {
    const second = first.components[path[1]];
    if (second?.type === ComponentType.Section) {
      return true;
    }
  }
  return first?.type === ComponentType.Section;
};

const MoveComponentButton = ({
  t,
  path,
  siblings,
  component,
  data,
  setData,
}: {
  t: TFunction;
  path: number[];
  siblings: APIComponentInMessageActionRow[];
  component: APIComponentInMessageActionRow;
  data: Data;
  setData: React.Dispatch<Partial<Data>>;
}) => (
  <Button
    discordstyle={ButtonStyle.Primary}
    // disabled={isSectionAccessory(data, path)}
    onClick={() => {
      // Remove from where it currently is
      try {
        replaceComponentByPath(data.components, path, null);
      } catch {
        // It's probably a section accessory, which cannot be removed
        return;
      }
      // It would be nice to be able to also remove the former parent here if
      // it's been made empty so that we don't have residue to clean up.
      // Move it to the new location
      siblings.splice(siblings.length, 0, component);
      // Calculate path and set state one time, at the end
      setData({});
    }}
  >
    {t("moveComponentHere", {
      replace: { type: component.type },
    })}
  </Button>
);

export const getActionRowComponentPath = (
  components: APIMessageTopLevelComponent[],
  component: {
    type: APIComponentInMessageActionRow["type"];
    style?: ButtonStyle;
    url?: string;
    label?: string;
  },
  componentId: string | bigint,
): {
  /** May be  */
  found: APIComponentInMessageActionRow;
  path: number[];
} => {
  let compPath: number[] = [];
  let absoluteI = -1;
  let resultComponent: APIComponentInMessageActionRow | undefined;
  for (const row of components) {
    absoluteI += 1;

    const process = (
      child: APIComponentInContainer,
    ): { live: APIComponentInMessageActionRow; index: number } | undefined => {
      if (isActionRow(child)) {
        let live = child.components.find(
          (c) => getComponentId(c) === BigInt(componentId),
        );
        // We should be injecting `custom_id` into draft link buttons but
        // this is just in case it's missing
        if (
          !live &&
          component.type === ComponentType.Button &&
          component.style === ButtonStyle.Link
        ) {
          live = child.components.find(
            (c) =>
              c.type === ComponentType.Button &&
              c.style === ButtonStyle.Link &&
              c.url === component.url &&
              c.label === component.label,
          );
        }
        if (live) {
          return {
            live,
            index: child.components.indexOf(live),
          };
        }
      } else if (
        child.type === ComponentType.Section &&
        component.type === ComponentType.Button &&
        child.accessory.type === component.type
      ) {
        if (
          isSameComponent({ child: child.accessory, component, componentId })
        ) {
          return {
            live: child.accessory,
            index: 0,
          };
        }
      }
    };

    if (row.type === ComponentType.Container) {
      let innerI = -1;
      for (const child of row.components) {
        innerI += 1;
        const attempt = process(child);
        if (attempt) {
          resultComponent = attempt.live;
          compPath = [absoluteI, innerI, attempt.index];
        }
      }
    } else {
      const attempt = process(row);
      if (attempt) {
        resultComponent = attempt.live;
        compPath = [absoluteI, attempt.index];
      }
    }
  }

  if (!resultComponent || compPath.length === 0) {
    throw Error("Failed to find the component");
  }
  return { found: resultComponent, path: compPath };
};

// Modified from bot/src/commands/components/delete.tsx extractComponentByPath
export const replaceComponentByPath = (
  allComponents: APIMessageTopLevelComponent[],
  path: number[],
  replacement: APIComponentInMessageActionRow | null,
) => {
  // let parent: APIContainerComponent | undefined;
  let siblings: (
    | APIMessageTopLevelComponent
    | APIComponentInMessageActionRow
    | APIComponentInContainer
  )[] = allComponents;
  let indexIndex = -1; // where we are in the path; the index of indexes
  for (const index of path) {
    indexIndex += 1;
    const atIndex = siblings[index];
    if (!atIndex) break;

    if (
      atIndex.type === ComponentType.Section &&
      // Sections cannot be navigated into further so we have to get it
      // in the second-to-last path position (the last value for section
      // accessories is always 0)
      indexIndex === path.length - 2
    ) {
      if (atIndex.accessory.type !== ComponentType.Button) return null;
      if (!replacement) {
        throw Error("Must provide replacement for section accessory");
      }
      if (replacement.type !== atIndex.accessory.type) {
        throw Error(
          `Conflicting type for accessory component replacement (${atIndex.accessory.type} to ${replacement.type})`,
        );
      }
      atIndex.accessory = replacement;
      return atIndex.accessory;
    }
    if (atIndex.type === ComponentType.Container) {
      siblings = atIndex.components;
      // parent = atIndex;
      continue;
    }
    if (atIndex.type === ComponentType.ActionRow) {
      siblings = atIndex.components;
      continue;
    }
    if (isStorableComponent(atIndex)) {
      if (replacement) siblings.splice(index, 1, replacement);
      else siblings.splice(index, 1);
      return atIndex;
    }
  }
  return null;
};

/** Clean up residue to avoid sending an invalid payload */
export const removeEmptyActionRows = (
  allComponents: APIMessageTopLevelComponent[],
) => {
  let i = -1;
  for (const component of allComponents) {
    i += 1;
    switch (component.type) {
      case ComponentType.Container: {
        let ci = -1;
        for (const child of component.components) {
          ci += 1;
          if (isActionRow(child) && child.components.length === 0) {
            component.components.splice(ci, 1);
          }
        }
        break;
      }
      case ComponentType.ActionRow: {
        if (component.components.length === 0) {
          allComponents.splice(i, 1);
        }
        break;
      }
      default:
        break;
    }
  }
};

export default () => {
  const {
    user,
    component: component_,
    token,
    editingMeta,
    message,
    emojis,
    channels,
    roles,
    threadId,
  } = useLoaderData<typeof loader>();

  const { t } = useTranslation();
  const [error, setError] = useError(t);
  const cache = useCache(false);

  const [submitState, setSubmitState] = useState<"idle" | "submitting">("idle");
  const actionPath = `/edit/component/${component_.id}?_data=routes/edit.component.$id`;
  const fetcher = useSafeFetcher<typeof action>({ onError: setError });
  useEffect(
    () =>
      setSubmitState(
        fetcher.state === "loading" ? "submitting" : fetcher.state,
      ),
    [fetcher.state],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Once! Or whenever one of these changes, which would be never right now
  useEffect(() => {
    if (component_.guildId) {
      cache.fill(
        ...emojis.map(
          (r) => [`emoji:${r.id}`, r] as [ResolutionKey, ResolvableAPIEmoji],
        ),
        ...roles.map(
          (r) => [`role:${r.id}`, r] as [ResolutionKey, ResolvableAPIRole],
        ),
      );
      channels.then((resolved) =>
        cache.fill(
          ...resolved.map(
            (r) =>
              [`channel:${r.id}`, r] as [ResolutionKey, ResolvableAPIChannel],
          ),
        ),
      );
    }
  }, [emojis, roles, channels]);

  // Don't allow the token to persist in the page address
  const location = useLocation();
  useEffect(() => {
    const url = new URL(
      origin + location.pathname + location.search + location.hash,
    );
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      safePushState({ path: url.href }, url.href);
    }
  }, [location]);

  const [settings] = useLocalStorage();

  const [component, setComponent] = useState(
    buildStorableComponent(
      component_.data,
      String(component_.id),
      component_.componentsToFlows.map((ctf) => ctf.flow),
    ),
  );

  // TODO: use this to reduce "flicker" when opening/closing modal
  // const [editingFlowOpen, setEditingFlowOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<EditingFlowData | undefined>();
  // const [initialPath, setInitialPath] = useState<number[]>();
  const [path, setPath] = useState<number[]>([0, 0]);

  const [data, setData] = useReducer(
    (current: Data, newData: Partial<Data>) => {
      const compiled = { ...current, ...newData } as Data;
      try {
        const { path, found } = getActionRowComponentPath(
          compiled.components,
          component,
          component_.id,
        );
        setComponent(found);
        setPath(path);
      } catch (e) {
        console.error(e);
      }
      return compiled;
    },
    {
      ...message,
      components: message?.components ?? [],
    } satisfies Data,
  );
  const isAccessory = useMemo(
    () => isSectionAccessory(data, path),
    [data, path],
  );
  const canAddRows = useMemo(
    () =>
      (isComponentsV2(data)
        ? getRemainingComponentsCount(data.components, true) > 0
        : data.components.length < MAX_V1_ROWS) && !isAccessory,
    [data, isAccessory],
  );

  // Initialize path value by running this once
  useEffect(() => setData({}), []);

  // const [overflowMessage, setOverflowMessage] = useState(false);
  const webhookTokenFetcher = useSafeFetcher<typeof ApiGetGuildWebhookToken>({
    onError: setError,
  });
  const auditLogFetcher = useSafeFetcher<typeof ApiAuditLogAction>({
    onError: setError,
  });

  return (
    <div>
      <FlowEditModal
        open={!!editingFlow}
        setOpen={() => setEditingFlow(undefined)}
        guildId={component_.guildId?.toString()}
        {...editingFlow}
        cache={cache}
        premium={user ? userIsPremium(user) : false}
      />
      <Header user={user} />
      <Prose className="max-w-xl">
        {error}
        {!!editingMeta && (
          <div
            className={twJoin(
              "mb-4 p-2 rounded-full shadow flex dark:shadow-lg border border-gray-300/80 dark:border-gray-300/20",
            )}
          >
            <img
              {...cdnImgAttributes(64, (size) =>
                getUserAvatar(
                  {
                    discordUser: {
                      id: BigInt(editingMeta.user.id),
                      avatar: editingMeta.user.avatar,
                      discriminator: "0",
                    },
                  },
                  { size },
                ),
              )}
              alt={editingMeta.user.name}
              className="rounded-full my-auto ltr:mr-2 rtl:ml-2 h-10 w-10"
            />
            <div className="my-auto">
              <p className="text-gray-500 font-medium text-sm">
                {t("editingComponentFromUser", {
                  replace: { type: component.type },
                })}
              </p>
              <p className="font-semibold text-lg leading-none">
                {editingMeta.user.name}
              </p>
            </div>
          </div>
        )}
        {/* <Checkbox
          label="Full width message preview"
          checked={overflowMessage}
          onCheckedChange={(checked) => setOverflowMessage(checked)}
          className="mb-1"
        /> */}
        <p className="text-sm font-medium cursor-default">{t("preview")}</p>
        <div
          className={twJoin(
            "mb-4 p-4 rounded-lg shadow dark:shadow-lg border border-gray-300/80 dark:border-gray-300/20",
            // overflowMessage ? "w-fit overflow-x-auto" : undefined,
          )}
        >
          <Message
            message={{ components: data.components }}
            cache={cache}
            messageDisplay={settings.messageDisplay}
            compactAvatars={settings.compactAvatars}
          />
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium cursor-default">
            <Trans
              t={t}
              i18nKey="positionLink"
              components={[
                <Link
                  to="/guide/getting-started/positioning"
                  target="_blank"
                  className={twJoin(linkClassName, "cursor-pointer")}
                />,
              ]}
            />
          </p>
          <div className="space-y-1 text-base">
            {isAccessory
              ? null
              : data.components.map((row, i) => {
                  const simpleFindLiveComponent = (
                    actionRow: APIActionRowComponent<APIComponentInMessageActionRow>,
                  ) =>
                    actionRow.components.find(
                      (c) =>
                        c.custom_id === component.custom_id &&
                        component.custom_id,
                    );
                  const hasLiveComponent = (
                    c: APIMessageTopLevelComponent | APIComponentInContainer,
                  ): boolean => {
                    switch (c.type) {
                      case ComponentType.Container:
                        return (
                          c.components.find(hasLiveComponent) !== undefined
                        );
                      case ComponentType.ActionRow:
                        return simpleFindLiveComponent(c) !== undefined;
                      case ComponentType.Section:
                        return c.accessory.type !== ComponentType.Button
                          ? false
                          : simpleFindLiveComponent({
                              type: ComponentType.ActionRow,
                              components: [c.accessory],
                            }) !== undefined;
                      default:
                        return false;
                    }
                  };

                  return (
                    <div
                      key={`component-${row.type}-${i}`}
                      className="space-y-1"
                    >
                      {canAddRows && i === 0 ? (
                        <AddRowPromptButton
                          t={t}
                          splice={() => {
                            data.components.splice(i, 0, {
                              type: ComponentType.ActionRow,
                              components: [],
                            });
                            setData({});
                          }}
                        />
                      ) : null}
                      {isComponentHousable(row) ? (
                        <details
                          className="group/top rounded-lg py-2 bg-gray-100 dark:bg-primary-630 border border-gray-300 dark:border-gray-700 shadow"
                          open={hasLiveComponent(row)}
                        >
                          <summary className="group-open/top:mb-2 transition-[margin] marker:content-none marker-none flex text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none px-4">
                            <CoolIcon
                              icon="Chevron_Right"
                              className="group-open/top:rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
                            />
                            <span className="my-auto">
                              {t(`componentN.${row.type}`, {
                                // TODO: per-type count like in the main editor
                                replace: { n: i + 1 },
                              })}
                            </span>
                            {isActionRow(row) && row.components.length === 0 ? (
                              <button
                                type="button"
                                className="ltr:ml-auto rtl:mr-auto my-auto"
                                onClick={() => {
                                  data.components.splice(i, 1);
                                  setData({});
                                }}
                              >
                                <CoolIcon icon="Trash_Full" />
                              </button>
                            ) : null}
                          </summary>
                          {row.type === ComponentType.Container ? (
                            <div className="space-y-1 px-4">
                              {row.components
                                .filter(
                                  (
                                    c,
                                  ): c is
                                    | APISectionComponent
                                    | APIActionRowComponent<APIComponentInMessageActionRow> =>
                                    (c.type === ComponentType.Section &&
                                      c.accessory.type ===
                                        ComponentType.Button) ||
                                    c.type === ComponentType.ActionRow,
                                )
                                .map((containerChild, containerChildI) => (
                                  <div
                                    key={`component-${i}-children-${containerChildI}`}
                                  >
                                    {canAddRows && containerChildI === 0 ? (
                                      <AddRowPromptButton
                                        t={t}
                                        splice={() => {
                                          row.components.splice(0, 0, {
                                            type: ComponentType.ActionRow,
                                            components: [],
                                          });
                                          setData({});
                                        }}
                                      />
                                    ) : null}
                                    <div className="w-full">
                                      <p className="text-sm font-medium select-none">
                                        {t(`component.${containerChild.type}`)}
                                      </p>
                                    </div>
                                    {containerChild.type ===
                                    ComponentType.Section ? (
                                      <div className="flex gap-2">
                                        <div
                                          className={twJoin(
                                            "grow truncate flex text-base rounded-lg shadow hover:shadow-lg transition font-medium select-none px-4",
                                            "text-muted dark:text-muted-dark bg-gray-500/10 hover:bg-gray-500/15 border border-gray-500/30",
                                          )}
                                        >
                                          <p className="truncate my-auto">
                                            {containerChild.components
                                              .map((c) => c.content)
                                              .join(" / ")}
                                          </p>
                                        </div>
                                        <IndividualActionRowComponentChild
                                          t={t}
                                          component={component}
                                          componentId={component_.id}
                                          child={
                                            // Definitely a button; see above filter
                                            containerChild.accessory as APIComponentInMessageActionRow
                                          }
                                          actionsBar={{ up: null, down: null }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        {containerChild.components.map(
                                          (rowChild, rowI) => (
                                            <IndividualActionRowComponentChild
                                              t={t}
                                              component={component}
                                              componentId={component_.id}
                                              child={rowChild}
                                              actionsBar={{
                                                up:
                                                  rowI === 0
                                                    ? null
                                                    : moveUp({
                                                        ci: rowI,
                                                        child: rowChild,
                                                        row: containerChild,
                                                        setData,
                                                      }),
                                                down:
                                                  rowI >=
                                                  containerChild.components
                                                    .length -
                                                    1
                                                    ? null
                                                    : moveDown({
                                                        ci: rowI,
                                                        child: rowChild,
                                                        row: containerChild,
                                                        setData,
                                                      }),
                                              }}
                                            />
                                          ),
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                          {!hasLiveComponent(containerChild) &&
                                          rowHasSpace(
                                            containerChild,
                                            component,
                                          ) ? (
                                            <MoveComponentButton
                                              t={t}
                                              path={path}
                                              siblings={
                                                containerChild.components
                                              }
                                              component={component}
                                              data={data}
                                              setData={setData}
                                            />
                                          ) : null}
                                          {containerChild.components.length ===
                                          0 ? (
                                            // Not a fan of this button; it's the
                                            // only "delete" button on the page;
                                            // the rest are trash icons.
                                            <Button
                                              discordstyle={ButtonStyle.Danger}
                                              onClick={() => {
                                                row.components.splice(
                                                  containerChildI,
                                                  1,
                                                );
                                                setData({});
                                              }}
                                            >
                                              {t("deleteRow")}
                                            </Button>
                                          ) : null}
                                        </div>
                                      </div>
                                    )}
                                    {canAddRows ? (
                                      <AddRowPromptButton
                                        t={t}
                                        splice={() => {
                                          row.components.splice(
                                            containerChildI + 1,
                                            0,
                                            {
                                              type: ComponentType.ActionRow,
                                              components: [],
                                            },
                                          );
                                          setData({});
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                ))}
                            </div>
                          ) : isActionRow(row) ? (
                            <div className="space-y-1 px-2">
                              {row.components.map((child, ci) => (
                                <IndividualActionRowComponentChild
                                  t={t}
                                  key={`component-${i}-child-${ci}`}
                                  component={component}
                                  componentId={component_.id}
                                  child={child}
                                  actionsBar={{
                                    up:
                                      ci === 0
                                        ? null
                                        : moveUp({ ci, child, row, setData }),
                                    down:
                                      ci >= row.components.length - 1
                                        ? null
                                        : moveDown({ ci, child, row, setData }),
                                  }}
                                />
                              ))}
                              {!hasLiveComponent(row) &&
                              rowHasSpace(row, component) ? (
                                <MoveComponentButton
                                  t={t}
                                  siblings={row.components}
                                  component={component}
                                  path={path}
                                  data={data}
                                  setData={setData}
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </details>
                      ) : (
                        <div className="rounded-lg py-2 px-4 bg-gray-100 dark:bg-primary-630 border border-gray-300 dark:border-gray-700 shadow text-gray-600 dark:text-gray-400 cursor-default select-none">
                          <p className="font-medium text-base">
                            {t(`component.${row.type}`)}
                          </p>
                        </div>
                      )}
                      {canAddRows ? (
                        <AddRowPromptButton
                          t={t}
                          splice={() => {
                            data.components.splice(i + 1, 0, {
                              type: ComponentType.ActionRow,
                              components: [],
                            });
                            setData({});
                          }}
                        />
                      ) : null}
                    </div>
                  );
                })}
            {!canAddRows ? (
              <p
                className={twJoin(
                  "text-sm",
                  isAccessory
                    ? "text-blurple dark:text-blurple-200"
                    : "text-yellow-500 dark:text-yellow-200",
                )}
              >
                <CoolIcon icon={isAccessory ? "Info" : "Triangle_Warning"} />{" "}
                {isComponentsV2(data)
                  ? isAccessory
                    ? t("sectionAccessoryNotMovable", {
                        replace: { type: component.type },
                      })
                    : t("messageMaxRowsV2Note", { count: MAX_TOTAL_COMPONENTS })
                  : t("messageMaxRowsNote", { count: MAX_V1_ROWS })}
              </p>
            ) : null}
          </div>
        </div>
        <hr className="border-black/5 dark:border-gray-200/20 my-4" />
        <ComponentEditForm
          t={t}
          component={component}
          setComponent={(newComponent) => {
            replaceComponentByPath(data.components, path, newComponent);
            setData({});
          }}
          cache={cache}
          setEditingFlow={setEditingFlow}
        />
        <hr className="border-black/5 dark:border-gray-200/20 my-4" />
        <div className="gap-1 flex">
          <Button
            disabled={submitState !== "idle"}
            onClick={async () => {
              setSubmitState("submitting");
              const updated = await submitComponent(component, setError);
              if (updated) {
                try {
                  replaceComponentByPath(data.components, path, updated);
                  setData({});
                } catch (e) {
                  console.error(e);
                }
                // Ensure that the component's durable object is up to date
                fetcher.submit({}, { method: "PATCH", action: actionPath });
              } else {
                setSubmitState("idle");
              }
            }}
          >
            {t(component_.draft ? "saveDraft" : "save")}
          </Button>
          {/*
            TODO: modal for selecting/sending a new message for this component if
            the draft is not already associated with a message. This should be
            a relatively uncommon situtation since this page is only linked when
            adding a component with the bot.
          */}
          {editingMeta ? (
            <Button
              disabled={!token || submitState !== "idle"}
              discordstyle={ButtonStyle.Success}
              onClick={async () => {
                setSubmitState("submitting");
                const updated = await submitComponent(component, setError);
                if (!updated) return;

                try {
                  replaceComponentByPath(data.components, path, updated);
                  removeEmptyActionRows(data.components);
                  setData({});
                } catch (e) {
                  console.error(e);
                }

                if (token) {
                  fetcher.submit(
                    {
                      token,
                      components: data.components,
                      // path,
                      // initialPath,
                    },
                    { method: "PATCH", action: actionPath },
                  );
                }
              }}
            >
              {component_.draft
                ? t("addComponentType", { replace: { type: component.type } })
                : t("editMessage")}
            </Button>
          ) : (
            <Button
              disabled={
                !component_.messageId ||
                !component_.guildId ||
                !message?.webhook_id ||
                submitState !== "idle"
              }
              discordstyle={ButtonStyle.Success}
              onClick={async () => {
                if (
                  component_.messageId &&
                  component_.guildId &&
                  message?.webhook_id
                ) {
                  setSubmitState("submitting");
                  let wt = webhookTokenFetcher.data;
                  if (!wt) {
                    wt = await webhookTokenFetcher.loadAsync(
                      apiUrl(
                        BRoutes.guildWebhookToken(
                          component_.guildId,
                          message.webhook_id,
                        ),
                      ),
                    );
                  }
                  const result = await submitMessage(wt, {
                    data: { components: data.components },
                    reference: component_.messageId.toString(),
                    thread_id: threadId,
                  });
                  if (result.status === "success") {
                    setError(undefined);
                    if (!isComponentsV2(message)) {
                      auditLogFetcher.submit(
                        {
                          type: "edit",
                          threadId,
                        },
                        {
                          method: "POST",
                          action: apiUrl(
                            BRoutes.messageLog(wt.id, wt.token, result.data.id),
                          ),
                        },
                      );
                    }

                    // Tell the server that something changed and it needs to
                    // either fetch the message or ensure that the component's
                    // durable object is up to date
                    fetcher.submit({}, { method: "PATCH", action: actionPath });
                  } else {
                    setError({
                      message: result.data.message,
                      raw: JSON.stringify(result.data),
                    });
                    setSubmitState("idle");
                  }
                }
              }}
            >
              {t("editMessage")}
            </Button>
          )}
        </div>
        {!component_.draft && (
          <p className="italic text-gray-300/80 text-sm mt-1">
            {t("componentSaveEditMessageTip")}
          </p>
        )}
      </Prose>
    </div>
  );
};
