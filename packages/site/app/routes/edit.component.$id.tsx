import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
  APIActionRowComponent,
  APIEmoji,
  APIMessage,
  ButtonStyle,
  ComponentType,
  Routes,
} from "discord-api-types/v10";
import { JWTPayload } from "jose";
import { MouseEventHandler, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import {
  getRowWidth,
  submitComponent,
} from "~/components/editor/ComponentEditor";
import { CoolIcon, CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { Message } from "~/components/preview/Message";
import { ComponentEditForm } from "~/modals/ComponentEditModal";
import { EditingFlowData, FlowEditModal } from "~/modals/FlowEditModal";
import {
  doubleDecode,
  getSessionStorage,
  getUser,
  verifyToken,
} from "~/session.server";
import {
  StorableComponent,
  discordMessageComponents,
  eq,
  getDb,
  makeSnowflake,
  tokens,
} from "~/store.server";
import { APIMessageActionRowComponent } from "~/types/QueryData";
import {
  ResolutionKey,
  ResolvableAPIEmoji,
  useCache,
} from "~/util/cache/CacheManager";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { snowflakeAsString, zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const { token: loginToken } = zxParseQuery(request, {
    token: z.ostring(),
  });
  const db = getDb(context.env.HYPERDRIVE.connectionString);

  const { sessionStorage, getSession, commitSession } =
    getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  let respond = <T extends Response>(response: T) => response;

  // TODO: fix overflow so that this `as` is not necessary
  // and that `user` is nullable
  let user = await getUser(request, context, !loginToken as true | undefined);
  if (!user) {
    // At this point we know `loginToken` is non nullable because if it was
    // undefined and `user` was null, `getUser` would have thrown due to the
    // provided `throwIfNull` value.
    // biome-ignore lint/style/noNonNullAssertion:
    const t = loginToken!;
    // ---
    // `loginToken` is a one-time-use token that prevents an annoying login
    // step for users that we have already implicitly authorized (they are
    // logged in on Discord and are the only user who could have pressed a
    // button). This allows this page to be opened in the in-app browser, for
    // instance, and complete component creation with minimal interruption.

    let payload: JWTPayload;
    try {
      ({ payload } = await verifyToken(t, context.env, context.origin));
    } catch {
      throw json({ message: "Invalid token" }, 401);
    }
    if (payload.scp !== "login") {
      throw json({ message: "Invalid token" }, 401);
    }
    // biome-ignore lint/style/noNonNullAssertion: Checked in verifyToken
    const tokenId = payload.jti!;
    // const userId = BigInt(payload.uid as string);

    const token = await db.query.tokens.findFirst({
      where: eq(tokens.id, makeSnowflake(tokenId)),
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
            guildedId: true,
          },
          with: {
            discordUser: true,
            guildedUser: true,
          },
        },
      },
    });
    if (!token || !token.user) {
      throw json(
        { message: "User or token data missing, obtain a new token" },
        401,
      );
    }
    user = doubleDecode<typeof token.user>(token.user);
    session.set("user", { id: user.id });
    const committed = await commitSession(session);
    respond = (response) => {
      response.headers.append("Set-Cookie", committed);
      return response;
    };
  }

  if (loginToken) {
    // Always void the token, even if it wasn't used
  }

  const component = await db.query.discordMessageComponents.findFirst({
    where: eq(discordMessageComponents.id, id),
    columns: {
      id: true,
      data: true,
      draft: true,
      // createdById: true,
      guildId: true,
      channelId: true,
      messageId: true,
    },
  });
  if (!component) {
    throw respond(json({ message: "Unknown Component" }, 404));
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  // TODO: figure out `defer` usage with our `respond`
  const message = await (async () => {
    if (!component.channelId || !component.messageId) {
      return;
    }

    let msg: APIMessage | undefined;
    try {
      msg = (await rest.get(
        Routes.channelMessage(
          String(component.channelId),
          String(component.messageId),
        ),
      )) as APIMessage;
    } catch {}

    if (msg) {
      const { components: rows, webhook_id } = msg;
      return { components: rows, webhook_id } as Pick<
        APIMessage,
        "components" | "webhook_id"
      >;
    }
  })();

  let emojis: ResolvableAPIEmoji[] = [];
  if (component.guildId) {
    try {
      emojis = (
        (await rest.get(
          Routes.guildEmojis(String(component.guildId)),
        )) as APIEmoji[]
      ).map((emoji) => ({
        id: emoji.id ?? undefined,
        name: emoji.name ?? "",
        animated: emoji.animated,
        available: emoji.available === false ? false : undefined,
      }));
    } catch {}
  }

  return respond(json({ user, component, message, emojis }));
};

const buildStorableComponent = (
  component: StorableComponent,
  id: string,
): APIMessageActionRowComponent => {
  switch (component.type) {
    case ComponentType.Button: {
      if (component.style === ButtonStyle.Link) {
        return component;
      }
      return {
        ...component,
        custom_id: `p_${id}`,
      };
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
      };
    }
    default:
      break;
  }
  throw Error("Unsupported storable component type.");
};

export default function EditComponentPage() {
  const {
    user,
    component: component_,
    message,
    emojis,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const cache = useCache(!user);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Once! Or whenever `emojis` changes, which would be never right now
  useEffect(() => {
    if (component_.guildId) {
      cache.fill(
        ...emojis.map(
          (e) => [`emoji:${e.id}`, e] as [ResolutionKey, ResolvableAPIEmoji],
        ),
      );
    }
  }, [emojis]);

  const [params, setParams] = useSearchParams();
  useEffect(() => {
    // Don't allow the login token to persist in the page address
    if (params.get("token")) {
      params.delete("token");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const [settings] = useLocalStorage();

  const [component, setComponent] = useState(
    buildStorableComponent(component_.data, String(component_.id)),
  );
  const [position, setPosition] = useReducer(
    (pos: [number, number], newPos: [number, number]) => {
      const [y, x] = newPos;
      
      return pos;
    },
    [0, 0],
  );
  // TODO: use this to reduce "flicker" when opening/closing modal
  // const [editingFlowOpen, setEditingFlowOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<EditingFlowData | undefined>();

  let found = false;
  const rows: APIActionRowComponent<APIMessageActionRowComponent>[] = [
    ...(message?.components ?? []),
  ];
  for (const row of rows) {
    let i = -1;
    for (const child of row.components) {
      i += 1;
      if (component.custom_id && child.custom_id === component.custom_id) {
        // Replace with stateful value and maintain position
        row.components.splice(i, 1, component);
        found = true;
        break;
      }
    }
  }
  if (!found) {
    const row = rows.find((row) => getRowWidth(row) < 5);
    if (!row) {
      rows.push({
        type: ComponentType.ActionRow,
        components: [component],
      });
    } else {
      row.components.push(component);
    }
  }

  return (
    <div>
      <FlowEditModal
        open={!!editingFlow}
        setOpen={() => setEditingFlow(undefined)}
        {...editingFlow}
        cache={cache}
      />
      <Header user={user} />
      <Prose className="max-w-xl">
        <div className="mb-4 p-4 rounded-lg shadow dark:shadow-lg border border-gray-300/80 dark:border-gray-300/20">
          <Message
            message={{ components: rows }}
            cache={cache}
            messageDisplay={settings.messageDisplay}
            compactAvatars={settings.compactAvatars}
          />
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium cursor-default">Position</p>
          <div className="grid grid-cols-4 gap-1">
            <ArrowButton icon="Chevron_Up" onClick={() => {}} />
            <ArrowButton icon="Chevron_Down" onClick={() => {}} />
            <ArrowButton icon="Chevron_Left" onClick={() => {}} />
            <ArrowButton icon="Chevron_Right" onClick={() => {}} />
          </div>
        </div>
        <ComponentEditForm
          t={t}
          component={component}
          setComponent={(newComponent) => setComponent({ ...newComponent })}
          cache={cache}
          setEditingFlow={setEditingFlow}
        />
        <hr className="border-gray-300/20 my-4" />
        <div className="gap-1 flex">
          <Button
            onClick={async () => {
              const updated = await submitComponent(component);
              if (updated) {
                setComponent(updated);
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
          <Button
            disabled={!component_.messageId}
            discordstyle={ButtonStyle.Success}
            onClick={async () => {}}
          >
            {t("editMessage")}
          </Button>
        </div>
        {!component_.draft && (
          <p className="italic text-gray-300/80 text-sm mt-1">
            {t("componentSaveEditMessageTip")}
          </p>
        )}
      </Prose>
    </div>
  );
}

const ArrowButton: React.FC<{
  icon: CoolIconsGlyph;
  onClick: MouseEventHandler<HTMLButtonElement>;
}> = ({ icon, onClick }) => (
  <Button
    className="w-full"
    discordstyle={ButtonStyle.Secondary}
    onClick={onClick}
  >
    <CoolIcon icon={icon} />
  </Button>
);
