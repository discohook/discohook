import { REST } from "@discordjs/rest";
import { defer, json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIActionRowComponent,
  APIChannel,
  APIMessage,
  APIModalActionRowComponent,
  APIWebhook,
  ButtonStyle,
  ChannelType,
  ComponentType,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  Routes,
} from "discord-api-types/v10";
import { JWTPayload } from "jose";
import { useEffect, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { getChannelIconType } from "~/api/v1/channels.$channelId";
import { loader as ApiGetGuildWebhookToken } from "~/api/v1/guilds.$guildId.webhooks.$webhookId.token";
import {
  action as ApiAuditLogAction,
  getComponentId,
} from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import {
  getComponentText,
  getComponentWidth,
  getRowWidth,
  submitComponent,
} from "~/components/editor/ComponentEditor";
import { CoolIcon, CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { Message } from "~/components/preview/Message.client";
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
import {
  APIButtonComponentWithCustomId,
  APIMessageActionRowComponent,
} from "~/types/QueryData";
import {
  ResolutionKey,
  ResolvableAPIChannel,
  ResolvableAPIEmoji,
  ResolvableAPIRole,
  useCache,
} from "~/util/cache/CacheManager";
import { cdnImgAttributes, isDiscordError } from "~/util/discord";
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
const MESSAGE_MAX_ROWS = 5;
const ROW_MAX_INDEX = ROW_MAX_WIDTH - 1;
const MESSAGE_MAX_ROWS_INDEX = MESSAGE_MAX_ROWS - 1;

interface KVComponentEditorState {
  interactionId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  row?: number;
  column?: number;
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
    // This is kind of weird but it's the best method I could think of to fall
    // back to user auth if the editor token is invalid in any way. This block
    // should always execute exactly one time.
    while (!needUserAuth) {
      let payload: JWTPayload;
      try {
        ({ payload } = await verifyToken(
          tokenValue,
          context.env,
          context.origin,
        ));
      } catch {
        needUserAuth = true;
        break;
      }
      if (payload.scp !== "editor") {
        needUserAuth = true;
        break;
      }
      // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
      const tokenId = payload.jti!;

      const key = `token-${tokenId}-component-${id}`;
      const cached = await context.env.KV.get<KVComponentEditorState>(
        key,
        "json",
      );
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
        needUserAuth = true;
        break;
      }

      const token = await db.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.id, makeSnowflake(tokenId)),
        columns: {
          id: true,
          prefix: true,
        },
      });
      if (!token || token.prefix !== payload.scp) {
        needUserAuth = true;
        break;
      }
      break;
    }
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
  const message = await (async () => {
    if (component.channelId && component.messageId) {
      let msg: APIMessage | undefined;
      try {
        msg = (await rest.get(
          Routes.channelMessage(
            String(component.channelId),
            String(component.messageId),
          ),
        )) as APIMessage;
      } catch {}
      if (msg?.position !== undefined) {
        threadId = msg.channel_id;
      }

      if (msg) {
        const { resolved, components: rows, webhook_id } = msg;
        return { resolved, components: rows, webhook_id } as Pick<
          APIMessage,
          "resolved" | "components" | "webhook_id"
        >;
      }
    }
  })();

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
  const { token, row, column } = await zxParseJson(request, {
    token: z.ostring(),
    row: z.number().int().min(0).max(MESSAGE_MAX_ROWS_INDEX).optional(),
    column: z.number().int().min(0).max(ROW_MAX_INDEX).optional(),
  });
  console.log(`[Edit Component] /edit/component/${id}`);
  let tokenData: KVComponentEditorState | undefined;
  if (token) {
    if (row === undefined || column === undefined) {
      // This is because users logged in regularly (technically a different
      // sort of flow) are permitted to edit directly from the frontend,
      // saving us a request.
      throw json(
        { message: "`row` and `column` required when using `token`" },
        400,
      );
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

    const key = `token-${tokenId}-component-${id}`;
    const cached = await context.env.KV.get<KVComponentEditorState>(
      key,
      "json",
    );
    if (!cached) {
      throw json(
        {
          message:
            "Interaction has timed out, log in normally to edit the message.",
        },
        404,
      );
    }
    tokenData = {
      ...cached,
      row,
      column,
    };
    await context.env.KV.put(key, JSON.stringify(tokenData), {
      // 2 hours
      expirationTtl: 7_200,
    });
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
  for (const row of message.components ?? []) {
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
  if (tokenData && message.webhook_id) {
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

    const components = getRowsWithInsertedComponent(
      message.components ?? [],
      built,
      // biome-ignore lint/style/noNonNullAssertion: Non-nullable if token is present
      [row!, column!],
    );
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
      for (const row of edited.components ?? []) {
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
): APIMessageActionRowComponent => {
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

const getRowsWithInsertedComponent = (
  rows: APIActionRowComponent<APIMessageActionRowComponent>[],
  component: APIMessageActionRowComponent,
  position: [number, number],
) => {
  // We don't want to send this data to Discord
  const cleaned = { ...component };
  if ("flowId" in cleaned) {
    cleaned.flowId = undefined;
  }
  if ("flowIds" in cleaned) {
    cleaned.flowIds = undefined;
  }

  if (rows.length === 0 || rows.length < position[0]) {
    const cloned = structuredClone(rows);
    cloned.push({
      type: ComponentType.ActionRow,
      components: [cleaned],
    });
    return cloned; //.filter((row) => row.components.length !== 0);
  }
  const cloned = structuredClone(rows).map((row, i) => {
    if (i === position[0]) {
      const extant = !!row.components.find(
        (c) => c.custom_id && c.custom_id === cleaned.custom_id,
      );
      row.components.splice(position[1], extant ? 1 : 0, cleaned);
    }
    return row;
  });
  //.filter((row) => row.components.length !== 0);
  if (cloned.length - 1 < position[0] && cloned.length <= MESSAGE_MAX_ROWS) {
    cloned.push({
      type: ComponentType.ActionRow,
      components: [cleaned],
    });
  }
  return cloned;
};

const rowHasSpace = <
  T extends APIMessageActionRowComponent | APIModalActionRowComponent,
>(
  row: APIActionRowComponent<T>,
  component: T,
) => ROW_MAX_WIDTH - getRowWidth(row) >= getComponentWidth(component);

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
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  type Data = Pick<APIMessage, "webhook_id" | "resolved"> & {
    components: NonNullable<
      APIActionRowComponent<APIMessageActionRowComponent>[]
    >;
  };
  const [data, setData] = useReducer(
    (current: Data, newData: Partial<Data>) => {
      const compiled = { ...current, ...newData } as Data;
      let found = false;
      let y = -1;
      let x = -1;
      for (const row of compiled.components) {
        y += 1;
        let live = row.components.find(
          (c) => getComponentId(c) === BigInt(component_.id),
        );
        // We should be injecting `custom_id` into draft link buttons but this is just in case
        if (
          !live &&
          component.type === ComponentType.Button &&
          component.style === ButtonStyle.Link
        ) {
          live = row.components.find(
            (c) =>
              c.type === component.type &&
              c.style === component.style &&
              c.url === component.url &&
              c.label === component.label,
          );
        }
        if (live) {
          found = true;
          x = row.components.indexOf(live);
          setComponent(live);
          break;
        }
      }

      if (!found || y === -1 || x === -1) {
        console.log(`Missing position (got to Y${y} X${x})`);
        return compiled;
      }

      console.log("New position:", y, x);
      setPosition([y, x]);
      return compiled;
    },
    { ...message, components: message?.components ?? [] },
  );
  // Insert live component
  // biome-ignore lint/correctness/useExhaustiveDependencies: once
  useEffect(() => {
    let y = -1;
    let x = -1;
    if (message) {
      const rows = message.components ?? [];
      const maybeY = rows.findIndex((r) => {
        let maybeX = r.components.findIndex(
          (c) => getComponentId(c) === BigInt(component_.id),
        );
        if (
          maybeX === -1 &&
          component.type === ComponentType.Button &&
          component.style === ButtonStyle.Link
        ) {
          maybeX = r.components.findIndex(
            (c) =>
              c.type === component.type &&
              c.style === component.style &&
              c.url === component.url &&
              c.label === component.label,
          );
        }
        if (maybeX !== -1) {
          x = maybeX;
          return true;
        }
        return false;
      });
      if (maybeY !== -1 && x !== -1) {
        y = maybeY;
        console.log("spliced", [y, x]);
        rows[y].components.splice(x, 1, component);
        setData({ components: rows });
        return;
      }
    }
    y = 0;
    x = 0;

    const rows = data.components;
    let nextAvailableRow = rows.find((c, i) => {
      const valid = rowHasSpace(c, component);
      if (valid) y = i;
      return valid;
    });
    if (!nextAvailableRow && rows.length < MESSAGE_MAX_ROWS) {
      nextAvailableRow = { type: ComponentType.ActionRow, components: [] };
      rows.push(nextAvailableRow);
      y = rows.length - 1;
    } else if (!nextAvailableRow) {
      const requiredWidth = getComponentWidth(component);
      setError({
        message: `No available slots for this component (need at least ${requiredWidth}).`,
      });
      return;
    }
    console.log("insert", [y, x]);
    nextAvailableRow.components.push(component);
    x = nextAvailableRow.components.length - 1;

    setData({ components: rows });
  }, []);

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
          onChange={(e) => setOverflowMessage(e.currentTarget.checked)}
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
            {data.components.map((row, i) => {
              const hasLiveComponent = !!row.components.find(
                (c) =>
                  c.custom_id === component.custom_id && component.custom_id,
              );
              return (
                <div key={`row-${i}`}>
                  <details
                    className="group/action-row rounded-lg p-2 pl-4 bg-gray-100 dark:bg-primary-630 border border-gray-300 dark:border-gray-700 shadow"
                    open={hasLiveComponent}
                  >
                    <summary className="group-open/action-row:mb-2 transition-[margin] marker:content-none marker-none flex text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
                      <CoolIcon
                        icon="Chevron_Right"
                        className="group-open/action-row:rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
                      />
                      <span className="my-auto">
                        {t("rowN", { replace: { n: i + 1 } })}
                      </span>
                    </summary>
                    <div className="space-y-1">
                      {row.components.map((child, ci) => {
                        const id = getComponentId(child)?.toString();
                        const previewText = getComponentText(child);
                        const isLiveComponent = id
                          ? id === component_.id.toString()
                          : component.type === ComponentType.Button &&
                              component.style === ButtonStyle.Link &&
                              child.type === component.type &&
                              child.style === component.style
                            ? child.url === component.url &&
                              child.label === component.label
                            : false;

                        return (
                          <div
                            key={`row-${i}-child-${id}-${ci}`}
                            className="flex text-base text-gray-600 dark:text-gray-400 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition font-semibold select-none ltr:-ml-2 rtl:-mr-2"
                          >
                            <div className="flex p-2 h-full w-full my-auto truncate disabled:animate-pulse">
                              <div className="ltr:mr-2 rtl:ml-2 my-auto w-6 h-6 shrink-0">
                                {child.type === ComponentType.Button ? (
                                  <div
                                    className={twJoin(
                                      "rounded text-gray-50",
                                      isLinkButton(child)
                                        ? "p-[5px_5px_4px_4px]"
                                        : "w-full h-full",
                                      {
                                        [ButtonStyle.Primary]: "bg-blurple",
                                        [ButtonStyle.Premium]: "bg-blurple",
                                        [ButtonStyle.Secondary]:
                                          "bg-[#6d6f78] dark:bg-[#4e5058]",
                                        [ButtonStyle.Link]:
                                          "bg-[#6d6f78] dark:bg-[#4e5058]",
                                        [ButtonStyle.Success]:
                                          "bg-[#248046] dark:bg-[#248046]",
                                        [ButtonStyle.Danger]: "bg-[#da373c]",
                                      }[child.style],
                                    )}
                                  >
                                    {isLinkButton(child) && (
                                      <CoolIcon
                                        icon="External_Link"
                                        className="block"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <div className="rounded bg-[#6d6f78] dark:bg-[#4e5058] p-[5px_5px_4px_4px]">
                                    <CoolIcon
                                      icon={
                                        (
                                          {
                                            [ComponentType.StringSelect]:
                                              "Chevron_Down",
                                            [ComponentType.UserSelect]: "Users",
                                            [ComponentType.RoleSelect]: "Tag",
                                            [ComponentType.MentionableSelect]:
                                              "Mention",
                                            [ComponentType.ChannelSelect]:
                                              "Chat",
                                          } as Record<
                                            (typeof child)["type"],
                                            CoolIconsGlyph
                                          >
                                        )[child.type]
                                      }
                                      className="block"
                                    />
                                  </div>
                                )}
                              </div>
                              <p className="truncate my-auto">
                                {previewText ||
                                  `${t(`component.${child.type}`)} ${
                                    child.type === 2 ? ci + 1 : ""
                                  }`}
                              </p>
                            </div>
                            <div className="ltr:ml-auto rtl:mr-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0 p-2 pl-0">
                              <button
                                type="button"
                                className={
                                  !isLiveComponent ||
                                  (i === 0 &&
                                    ci === 0 &&
                                    row.components.length === 1)
                                    ? "hidden"
                                    : ""
                                }
                                onClick={() => {
                                  if (ci === 0) {
                                    const newRow: Data["components"][number] = {
                                      type: ComponentType.ActionRow,
                                      components: [child],
                                    };
                                    if (row.components.length === 1) {
                                      const nextAvailableRow = data.components
                                        .filter(
                                          (r, ri) =>
                                            ri < i && rowHasSpace(r, child),
                                        )
                                        .reverse()[0];
                                      if (!nextAvailableRow) {
                                        if (i <= 0) return;
                                        if (
                                          data.components.length <
                                          MESSAGE_MAX_ROWS
                                        ) {
                                          data.components.splice(i, 1);
                                          data.components.splice(
                                            Math.max(i - 2, 0),
                                            0,
                                            newRow,
                                          );
                                        }
                                        setData({});
                                        return;
                                      }

                                      nextAvailableRow.components.splice(
                                        nextAvailableRow.components.length,
                                        0,
                                        child,
                                      );
                                      // remove now-empty row
                                      data.components.splice(i, 1);
                                    } else {
                                      row.components.splice(ci, 1);
                                      data.components.splice(i - 1, 0, newRow);
                                    }
                                  } else {
                                    row.components.splice(ci, 1);
                                    row.components.splice(ci - 1, 0, child);
                                  }
                                  setData({});
                                }}
                              >
                                <CoolIcon icon="Chevron_Up" />
                              </button>
                              <button
                                type="button"
                                className={
                                  (i === MESSAGE_MAX_ROWS_INDEX &&
                                    ci === row.components.length - 1) ||
                                  !isLiveComponent
                                    ? "hidden"
                                    : ""
                                }
                                onClick={() => {
                                  if (ci === row.components.length - 1) {
                                    const newRow: Data["components"][number] = {
                                      type: ComponentType.ActionRow,
                                      components: [child],
                                    };
                                    if (row.components.length === 1) {
                                      const nextAvailableRow =
                                        data.components.filter(
                                          (r, ri) =>
                                            ri > i && rowHasSpace(r, child),
                                        )[0];
                                      if (!nextAvailableRow) {
                                        if (i >= MESSAGE_MAX_ROWS_INDEX) return;
                                        // Move other rows up if we're not already on the bottom
                                        if (i + 2 > MESSAGE_MAX_ROWS_INDEX) {
                                          data.components.splice(i, 1);
                                          data.components = [
                                            ...data.components,
                                            newRow,
                                          ];
                                        } else if (
                                          data.components.length <
                                          MESSAGE_MAX_ROWS
                                        ) {
                                          data.components.splice(
                                            i + 2,
                                            0,
                                            newRow,
                                          );
                                          data.components.splice(i, 1);
                                        }
                                        setData({});
                                        return;
                                      }

                                      nextAvailableRow.components.splice(
                                        nextAvailableRow.components.length,
                                        0,
                                        child,
                                      );
                                      // remove now-empty row
                                      data.components.splice(i, 1);
                                    } else {
                                      row.components.splice(ci, 1);
                                      data.components.splice(i + 1, 0, newRow);
                                    }
                                  } else {
                                    row.components.splice(ci, 1);
                                    row.components.splice(ci + 1, 0, child);
                                  }
                                  setData({});
                                }}
                              >
                                <CoolIcon icon="Chevron_Down" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
            {data.components.length >= MESSAGE_MAX_ROWS && (
              <p className="text-sm text-yellow-500 dark:text-yellow-200">
                <CoolIcon icon="Triangle_Warning" />{" "}
                {t("messageMaxRowsNote", { count: MESSAGE_MAX_ROWS })}
              </p>
            )}
          </div>
        </div>
        <hr className="border-black/5 dark:border-gray-200/20 my-4" />
        <ComponentEditForm
          t={t}
          component={component}
          setComponent={(newComponent) => {
            setData({
              components: data.components.map((row, ri) => {
                if (ri === position[0]) {
                  row.components.splice(position[1], 1, newComponent);
                }
                return row;
              }),
            });
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
                  data.components[position[0]].components.splice(
                    position[1],
                    1,
                    updated,
                  );
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
                if (updated) {
                  try {
                    data.components[position[0]].components.splice(
                      position[1],
                      1,
                      updated,
                    );
                    setData({});
                  } catch (e) {
                    console.error(e);
                  }
                }

                if (token) {
                  fetcher.submit(
                    {
                      token,
                      row: position[0],
                      column: position[1],
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
