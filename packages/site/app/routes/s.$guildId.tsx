import { REST } from "@discordjs/rest";
import {
  MetaFunction,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/cloudflare";
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  APIGuild,
  APIWebhook,
  ButtonStyle,
  ComponentType,
  RESTJSONErrorCodes,
  WebhookType,
} from "discord-api-types/v10";
import {
  BitFlagResolvable,
  PermissionFlags,
  PermissionsBitField,
} from "discord-bitflag";
import { getDate } from "discord-snowflake";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { getComponentWidth } from "~/components/editor/ComponentEditor";
import { CoolIcon, CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { PostChannelIcon } from "~/components/icons/channel";
import { GenericPreviewComponent } from "~/components/preview/Components";
import { Markdown } from "~/components/preview/Markdown";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { FlowEditModal } from "~/modals/FlowEditModal";
import { TriggerCreateModal } from "~/modals/TriggerCreateModal";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
} from "~/session.server";
import { DraftFlow } from "~/store.server";
import { useCache } from "~/util/cache/CacheManager";
import {
  cdn,
  cdnImgAttributes,
  isDiscordError,
  webhookAvatarUrl,
} from "~/util/discord";
import { flowToDraftFlow } from "~/util/flow";
import { getId } from "~/util/id";
import { LoaderArgs, useSafeFetcher } from "~/util/loader";
import { getUserAvatar, userIsPremium } from "~/util/users";
import { zxParseParams } from "~/util/zod";
import { action as ApiDeleteComponent } from "../api/v1/components.$id";
import { loader as ApiGetGuildComponents } from "../api/v1/guilds.$guildId.components";
import { loader as ApiGetGuildAuditLog } from "../api/v1/guilds.$guildId.log";
import { loader as ApiGetGuildSessions } from "../api/v1/guilds.$guildId.sessions";
import { action as ApiPutGuildTriggerEvent } from "../api/v1/guilds.$guildId.trigger-events.$event";
import { loader as ApiGetGuildTriggers } from "../api/v1/guilds.$guildId.triggers";
import { action as ApiPatchGuildTrigger } from "../api/v1/guilds.$guildId.triggers.$triggerId";
import { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import { action as ApiPatchGuildWebhook } from "../api/v1/guilds.$guildId.webhooks.$webhookId";
import { Cell } from "./donate";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: z.string().refine((v) => !Number.isNaN(Number(v))),
  });
  const [token, respond] = await authorizeRequest(request, context);
  let owner: boolean | undefined;
  let permissions: PermissionsBitField;
  let guild: APIGuild | undefined;
  try {
    ({ owner, permissions, guild } = await getTokenGuildPermissions(
      token,
      guildId,
      context.env,
    ));
    if (!guild) {
      guild = await getGuild(
        guildId,
        new REST().setToken(context.env.DISCORD_BOT_TOKEN),
        context.env,
      );
      owner = guild.owner_id === String(token.user.discordId);
    }
  } catch (e) {
    if (isDiscordError(e)) {
      if (e.code === RESTJSONErrorCodes.UnknownGuild) {
        throw redirect(`/bot?guildId=${guildId}`);
      }
      throw respond(json(e.rawError, e.status));
    } else if (e instanceof Response && e.status === 404) {
      // Making assumptions here
      throw redirect(`/bot?guildId=${guildId}`);
    }
    throw e;
  }

  return respond(
    json({
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
      },
      user: token.user,
      member: {
        owner,
        permissions: permissions.toString(),
      },
      discordApplicationId: context.env.DISCORD_CLIENT_ID,
    }),
  );
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { guild } = data as SerializeFrom<typeof loader>;
    return [
      { title: `${guild.name} - Discohook` },
      { name: "apple-mobile-web-app-title", content: guild.name },
      ...(guild.icon
        ? [
            {
              tagName: "link",
              rel: "icon",
              type: guild.icon.startsWith("a_") ? "image/gif" : "image/webp",
              href: cdn.icon(guild.id, guild.icon, {
                size: 16,
                extension: guild.icon.startsWith("a_") ? "gif" : "webp",
              }),
            },
            {
              // we can't exactly match apple's sizes with the discord cdn
              // so we're just going to provide one unsized icon.
              tagName: "link",
              rel: "apple-touch-icon",
              href: cdn.icon(guild.id, guild.icon, {
                size: 256,
                extension: "png",
              }),
            },
          ]
        : []),
    ];
  }
  return [];
};

const tabValues = [
  "home",
  "auditLog",
  "webhooks",
  "sessions",
  "triggers",
  "components",
] as const;

const flowEventsDetails: Record<number, { icon: CoolIconsGlyph }> = {
  0: {
    icon: "User_Add",
  },
  1: {
    icon: "User_Remove",
  },
};

export default () => {
  const { guild, user, member, discordApplicationId } =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [error, setError] = useError(t);
  const permissions = new PermissionsBitField(BigInt(member.permissions));
  const has = (...flags: BitFlagResolvable[]) =>
    member.owner ? true : permissions.has(...flags);
  const navigate = useNavigate();

  const cache = useCache(!user);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    cache.fetchGuildCacheable(guild.id);
  }, [guild]);

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("t") as (typeof tabValues)[number] | null;
  const [tab, setTab] = useState<(typeof tabValues)[number]>(
    defaultTab && tabValues.includes(defaultTab) ? defaultTab : tabValues[0],
  );

  const [openWebhookId, setOpenWebhookId] = useState<string>();
  const [creatingTrigger, setCreatingTrigger] = useState(false);
  const [confirmModal, setConfirm] = useConfirmModal();

  const auditLogFetcher = useFetcher<typeof ApiGetGuildAuditLog>();
  const webhooksFetcher = useSafeFetcher<typeof ApiGetGuildWebhooks>({
    onError: setError,
  });
  const [webhooksForced, setWebhooksForced] = useState(false);
  const guildWebhookFetcher = useSafeFetcher<typeof ApiPatchGuildWebhook>({
    onError: setError,
  });
  const sessionsFetcher = useFetcher<typeof ApiGetGuildSessions>();
  const componentsFetcher = useSafeFetcher<typeof ApiGetGuildComponents>({
    onError: setError,
  });
  const componentDeleteFetcher = useSafeFetcher<typeof ApiDeleteComponent>({
    onError: setError,
  });
  const triggersFetcher = useSafeFetcher<typeof ApiGetGuildTriggers>({
    onError: setError,
  });
  const triggerSaveFetcher = useSafeFetcher<typeof ApiPatchGuildTrigger>({
    onError: setError,
  });
  const triggerEventTestFetcher = useSafeFetcher<
    typeof ApiPutGuildTriggerEvent
  >({
    onError: setError,
  });
  const [openTriggerId, setOpenTriggerId] = useState<bigint>();
  const [editOpenTriggerFlow, setEditOpenTriggerFlow] = useState(false);
  const openTrigger = triggersFetcher.data
    ? triggersFetcher.data.find((t) => t.id === openTriggerId)
    : undefined;

  const [draftFlow, setDraftFlow] = useState<DraftFlow>();
  useEffect(() => {
    if (openTrigger) {
      setDraftFlow(flowToDraftFlow(openTrigger.flow));
    } else {
      setDraftFlow(undefined);
      setEditOpenTriggerFlow(false);
    }
  }, [openTrigger]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: A wizard specifies precisely the dependencies he means to.
  useEffect(() => {
    switch (tab) {
      case "auditLog": {
        if (!auditLogFetcher.data && auditLogFetcher.state === "idle") {
          auditLogFetcher.load(apiUrl(BRoutes.guildLog(guild.id)));
        }
        break;
      }
      case "webhooks": {
        if (!webhooksFetcher.data && webhooksFetcher.state === "idle") {
          webhooksFetcher.load(apiUrl(BRoutes.guildWebhooks(guild.id)));
        }
        break;
      }
      case "sessions": {
        if (!sessionsFetcher.data && sessionsFetcher.state === "idle") {
          sessionsFetcher.load(apiUrl(BRoutes.guildSessions(guild.id)));
        }
        break;
      }
      case "triggers": {
        if (!triggersFetcher.data && triggersFetcher.state === "idle") {
          triggersFetcher.load(apiUrl(BRoutes.guildTriggers(guild.id)));
        }
        break;
      }
      case "components": {
        if (!componentsFetcher.data && componentsFetcher.state === "idle") {
          componentsFetcher.load(apiUrl(BRoutes.guildComponents(guild.id)));
        }
        break;
      }
      default:
        break;
    }
  }, [
    tab,
    auditLogFetcher.data,
    auditLogFetcher.state,
    webhooksFetcher.data,
    webhooksFetcher.state,
    sessionsFetcher.data,
    sessionsFetcher.state,
    triggersFetcher.data,
    triggersFetcher.state,
    componentsFetcher.data,
    componentsFetcher.state,
  ]);

  // Whenever openTriggerId is set but there is no openTrigger (it was just created), refresh list
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (openTriggerId && !openTrigger && triggersFetcher.state === "idle") {
      triggersFetcher.load(apiUrl(BRoutes.guildTriggers(guild.id)));
    }
  }, [openTriggerId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (
      openWebhookId &&
      guildWebhookFetcher.state === "idle" &&
      guildWebhookFetcher.data
    ) {
      webhooksFetcher.load(apiUrl(BRoutes.guildWebhooks(guild.id)));
    }
  }, [guildWebhookFetcher.state, guildWebhookFetcher.data]);

  return (
    <div>
      <WebhookEditModal
        targets={Object.fromEntries(
          webhooksFetcher.data
            ? webhooksFetcher.data.map((webhook) => [
                webhook.id,
                {
                  type: WebhookType.Incoming,
                  application_id: webhook.applicationId,
                  id: webhook.id,
                  name: webhook.name,
                  avatar: webhook.avatar,
                  channel_id: webhook.channelId,
                } satisfies APIWebhook,
              ])
            : [],
        )}
        updateTargets={() => {}}
        submit={(payload) => {
          if (!openWebhookId) return;
          guildWebhookFetcher.submit(payload, {
            method: "PATCH",
            action: apiUrl(BRoutes.guildWebhook(guild.id, openWebhookId)),
          });
        }}
        channels={cache.channel.getAll()}
        webhookId={openWebhookId}
        open={!!openWebhookId}
        setOpen={() => setOpenWebhookId(undefined)}
        user={user}
        cache={cache}
      />
      <TriggerCreateModal
        open={creatingTrigger}
        setOpen={setCreatingTrigger}
        guildId={guild.id}
        cache={cache}
        setOpenTriggerId={setOpenTriggerId}
      />
      <FlowEditModal
        open={editOpenTriggerFlow}
        setOpen={setEditOpenTriggerFlow}
        guildId={guild.id}
        flow={draftFlow}
        setFlow={setDraftFlow}
        cache={cache}
        premium={userIsPremium(user)}
      />
      {confirmModal}
      <Header user={user} />
      <Prose>
        {error}
        <TabsWindow
          tab={tab}
          setTab={setTab as (v: string) => void}
          data={[
            {
              label: t("home"),
              value: "home",
            },
            ...(has(
              PermissionFlags.ManageMessages,
              PermissionFlags.ManageWebhooks,
            )
              ? [
                  {
                    label: t("components"),
                    value: "components",
                  },
                ]
              : []),
            ...(has(PermissionFlags.ManageWebhooks)
              ? [
                  {
                    label: t("webhooks"),
                    value: "webhooks",
                  },
                ]
              : []),
            ...(has(PermissionFlags.ViewAuditLog, PermissionFlags.ManageGuild)
              ? [
                  {
                    label: t("auditLog"),
                    value: "auditLog",
                  },
                  // {
                  //   label: t("sessions"),
                  //   value: "sessions",
                  // },
                ]
              : []),
            ...(has(PermissionFlags.ManageGuild)
              ? [
                  {
                    label: t("triggers"),
                    value: "triggers",
                  },
                ]
              : []),
          ]}
        >
          {tab === "home" ? (
            <div>
              <TabHeader>{t("home")}</TabHeader>
              <div className="space-y-2">
                <div className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900">
                  <div className="flex">
                    <img
                      {...cdnImgAttributes(64, (size) =>
                        guild.icon
                          ? cdn.icon(guild.id, guild.icon, { size })
                          : cdn.defaultAvatar(0),
                      )}
                      className="rounded-lg h-12 w-12 ltr:mr-4 rtl:ml-4"
                      alt={guild.name}
                    />
                    <div className="-mt-2">
                      <p className="text-xl font-semibold">{guild.name}</p>
                      <p>
                        <Trans
                          t={t}
                          i18nKey="homeWelcome"
                          components={{
                            narrow: <span className="inline sm:hidden" />,
                            wide: <span className="hidden sm:inline" />,
                          }}
                        />
                      </p>
                    </div>
                  </div>
                  <details className="rounded-lg mt-2 bg-gray-200 dark:bg-gray-800 group">
                    <summary className="flex marker:content-none marker-none cursor-pointer py-2 px-3">
                      <img
                        {...cdnImgAttributes(64, (size) =>
                          getUserAvatar(user, { size }),
                        )}
                        className="rounded-full h-10 w-10 ltr:mr-3 rtl:ml-3 my-auto"
                        alt={user.name}
                      />
                      <p className="font-medium my-auto ltr:mr-2 rtl:ml-2">
                        {t(
                          `homePermission.${
                            member.owner
                              ? "owner"
                              : has(PermissionFlags.Administrator)
                                ? "admin"
                                : "roles"
                          }`,
                        )}
                      </p>
                      <CoolIcon
                        icon="Chevron_Right"
                        rtl="Chevron_Left"
                        className="ltr:ml-auto rtl:mr-auto my-auto text-lg ltr:group-open:rotate-90 rtl:group-open:-rotate-90 transition"
                      />
                    </summary>
                    <div className="p-4 pt-2 space-y-1.5">
                      {Object.entries(PermissionFlags).map(([flag, value]) => (
                        <Checkbox
                          key={`permission-${flag}`}
                          checked={has(value)}
                          readOnly
                          label={t(`permission.${flag}`)}
                        />
                      ))}
                    </div>
                  </details>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-gray-700 border border-black/10 dark:border-gray-50/10 table w-full">
                  <div className="table-header-group">
                    <div className="table-row">
                      <Cell className="font-semibold rounded-tl-lg">
                        {t("tab")}
                      </Cell>
                      <Cell className="font-semibold">{t("permissions")}</Cell>
                      <Cell className="rounded-tr-lg" />
                    </div>
                  </div>
                  <div className="table-row-group">
                    <div className="table-row">
                      <Cell>{t("home")}</Cell>
                      <Cell>{t("justBeAMember")}</Cell>
                      <Cell>
                        <CoolIcon icon="Check" />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell className="rounded-bl-lg">{t("components")}</Cell>
                      <Cell className="rounded-br-lg">
                        {new Intl.ListFormat().format(
                          ["ManageMessages", "ManageWebhooks"].map((p) =>
                            t(`permission.${p}`),
                          ),
                        )}
                      </Cell>
                      <Cell>
                        <CoolIcon
                          icon={
                            has(
                              PermissionFlags.ManageMessages,
                              PermissionFlags.ManageWebhooks,
                            )
                              ? "Check"
                              : "Close_MD"
                          }
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell>{t("webhooks")}</Cell>
                      <Cell>{t("permission.ManageWebhooks")}</Cell>
                      <Cell>
                        <CoolIcon
                          icon={
                            has(PermissionFlags.ManageWebhooks)
                              ? "Check"
                              : "Close_MD"
                          }
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell>{t("auditLog")}</Cell>
                      <Cell>
                        {new Intl.ListFormat().format(
                          ["ViewAuditLog", "ManageGuild"].map((p) =>
                            t(`permission.${p}`),
                          ),
                        )}
                      </Cell>
                      <Cell>
                        <CoolIcon
                          icon={
                            has(
                              PermissionFlags.ViewAuditLog,
                              PermissionFlags.ManageGuild,
                            )
                              ? "Check"
                              : "Close_MD"
                          }
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell className="rounded-bl-lg">{t("triggers")}</Cell>
                      <Cell>{t("permission.ManageGuild")}</Cell>
                      <Cell className="rounded-br-lg">
                        <CoolIcon
                          icon={
                            has(PermissionFlags.ManageGuild)
                              ? "Check"
                              : "Close_MD"
                          }
                        />
                      </Cell>
                    </div>
                    {/* <div className="table-row">
                      <Cell>Sessions</Cell>
                      <Cell>View Audit Logs, Manage Server</Cell>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "webhooks" ? (
            <div>
              <div className="flex mb-2">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t(tab)}
                </p>
                <Button
                  discordstyle={ButtonStyle.Secondary}
                  className="mb-auto ltr:ml-auto rtl:mr-auto"
                  disabled={webhooksForced || webhooksFetcher.state !== "idle"}
                  onClick={() =>
                    webhooksFetcher
                      .loadAsync(
                        `${apiUrl(BRoutes.guildWebhooks(guild.id))}?force=true`,
                      )
                      .then(() => setWebhooksForced(true))
                  }
                >
                  {t(webhooksForced ? "refreshed" : "forceRefresh")}
                </Button>
              </div>
              <div className="space-y-2">
                {webhooksFetcher.data
                  ? webhooksFetcher.data.map((webhook) => {
                      const createdAt = getDate(webhook.id as `${bigint}`);
                      const open = openWebhookId === webhook.id;
                      return (
                        <div
                          key={`webhook-${webhook.id}`}
                          className="rounded-lg bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22]"
                        >
                          <button
                            type="button"
                            className="p-4 flex w-full ltr:text-left rtl:text-right"
                            onClick={() =>
                              setOpenWebhookId(open ? undefined : webhook.id)
                            }
                          >
                            <img
                              {...cdnImgAttributes(64, (size) =>
                                webhookAvatarUrl(webhook, { size }),
                              )}
                              className="rounded-full my-auto w-10 h-10 ltr:mr-4 rtl:ml-4"
                              alt={webhook.name}
                            />
                            <div className="truncate my-auto">
                              <div className="flex max-w-full">
                                <p className="font-semibold truncate dark:text-primary-230 text-lg">
                                  <span className="align-baseline">
                                    {webhook.name}
                                  </span>
                                  {webhook.applicationId ===
                                    discordApplicationId && (
                                    <span
                                      className="ltr:ml-1 rtl:mr-1 inline-block"
                                      title={t("createdByDiscohook")}
                                    >
                                      <CoolIcon
                                        icon="Circle_Check"
                                        className="text-blurple-500 dark:text-blurple-400"
                                      />
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="text-gray-600 dark:text-gray-500 text-xs">
                                <CoolIcon icon="Clock" />{" "}
                                {t(webhook.user ? "createdAtBy" : "createdAt", {
                                  replace: {
                                    createdAt,
                                    username: webhook.user?.name ?? "unknown",
                                  },
                                })}
                              </p>
                            </div>
                            <div className="ltr:ml-auto rtl:mr-auto ltr:pl-2 rtl:pr-2 my-auto flex gap-2 text-xl">
                              <CoolIcon
                                icon={open ? "Chevron_Down" : "Chevron_Right"}
                                rtl={open ? "Chevron_Down" : "Chevron_Left"}
                              />
                            </div>
                          </button>
                        </div>
                      );
                    })
                  : Array(10)
                      .fill(undefined)
                      .map((_, i) => (
                        <div
                          key={`webhook-skeleton-${i}`}
                          className="rounded-lg p-4 bg-gray-100 dark:bg-[#1E1F22]/50 flex animate-pulse"
                          // Not sure if I like the fading look more than the uniform pulse
                          // style={{
                          //   opacity: 1 - i / a.length,
                          // }}
                        >
                          <div className="bg-gray-400 dark:bg-gray-500 rounded-full my-auto w-10 h-10 ltr:mr-4 rtl:ml-4" />
                          <div className="my-auto">
                            <div className="bg-gray-400 dark:bg-gray-500 rounded-full h-4 w-20" />
                            <div className="bg-gray-400 dark:bg-gray-500 rounded-full h-3 w-28 mt-0.5" />
                          </div>
                        </div>
                      ))}
              </div>
            </div>
          ) : tab === "auditLog" ? (
            <div>
              <TabHeader
                subtitle={
                  <p>
                    <Trans
                      t={t}
                      i18nKey="auditLogSubtitle"
                      components={[<span className="font-semibold" />]}
                      values={{ guild }}
                    />
                  </p>
                }
              >
                {t("auditLog")}
              </TabHeader>
              <div className="space-y-2">
                {auditLogFetcher.data ? (
                  auditLogFetcher.data.entries.map((entry) => {
                    const createdAt = new Date(
                      getId({ id: entry.id }).timestamp,
                    );
                    const webhook = auditLogFetcher.data?.webhooks.find(
                      (w) => w.id === entry.webhookId,
                    );
                    const verbed =
                      entry.type === "send"
                        ? "sent"
                        : entry.type === "edit"
                          ? "edited"
                          : entry.type === "delete"
                            ? "deleted"
                            : "?";
                    return (
                      <div
                        key={`message-entry-${entry.id}`}
                        className="rounded-lg py-3 px-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                      >
                        {/* {entry.type && (
                          <CoolIcon
                            className="text-lg my-auto mr-2"
                            icon={
                              entry.type === "send"
                                ? "Add_Row"
                                : entry.type === "edit"
                                  ? "Edit_Pencil_01"
                                  : "Delete_Row"
                            }
                          />
                        )} */}
                        <img
                          {...cdnImgAttributes(64, (size) =>
                            webhook
                              ? webhookAvatarUrl(webhook, { size })
                              : cdn.defaultAvatar(5),
                          )}
                          className="rounded-full my-auto w-10 h-10 mr-2 hidden sm:block"
                          alt="Instigator"
                        />
                        <div className="truncate my-auto">
                          <div className="flex max-w-full">
                            <p className="font-medium truncate dark:text-[#f9f9f9] text-base">
                              {entry.user?.name ? (
                                <span className="dark:text-primary-230">
                                  {entry.user.name}
                                </span>
                              ) : (
                                "Anonymous"
                              )}{" "}
                              {verbed} a message
                              {webhook ? ` with ${webhook.name}` : ""}
                            </p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-500 text-xs">
                            {new Date(createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          <a
                            href={`https://discord.com/channels/${guild.id}/${
                              entry.threadId ?? entry.channelId
                            }/${entry.messageId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button discordstyle={ButtonStyle.Secondary}>
                              <CoolIcon icon="External_Link" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          ) : tab === "sessions" ? (
            <div>
              <TabHeader
                subtitle={
                  <p>
                    Below is a list of permission-laden sessions that have
                    recently been authorized for{" "}
                    <span className="font-semibold">{guild.name}</span>.
                    <br />
                    <br />
                    If you don't recognize a user, you may want to verify your
                    permission setup.
                  </p>
                }
              >
                Sessions
              </TabHeader>
              <div className="space-y-2">
                {sessionsFetcher.data ? (
                  sessionsFetcher.data.map((session) => {
                    const createdAt = getDate(session.id);
                    return (
                      <div
                        key={`session-${session.id}`}
                        className="rounded-lg py-3 px-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                      >
                        {/* <img
                          className="rounded-full my-auto w-10 h-10 mr-2 hidden sm:block"
                          src={
                            webhook
                              ? webhookAvatarUrl(webhook, { size: 64 })
                              : cdn.defaultAvatar(5)
                          }
                          alt=""
                        /> */}
                        <div className="truncate my-auto">
                          <div className="flex max-w-full">
                            <p className="font-medium truncate dark:text-[#f9f9f9] text-base">
                              {session.user?.name ? (
                                <span className="dark:text-primary-230">
                                  {session.user.name}
                                </span>
                              ) : (
                                "Unknown"
                              )}{" "}
                              {session.auth?.owner && (
                                <Twemoji emoji="👑" title="Server Owner" />
                              )}
                            </p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-500 text-xs">
                            {new Date(createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          {/* <a
                            href={`https://discord.com/channels/${guild.id}/${
                              entry.threadId ?? entry.channelId
                            }/${entry.messageId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button discordstyle={ButtonStyle.Secondary}>
                              <CoolIcon icon="External_Link" />
                            </Button>
                          </a> */}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          ) : tab === "triggers" ? (
            openTrigger ? (
              <div>
                <button
                  type="button"
                  onClick={() => setOpenTriggerId(undefined)}
                >
                  <CoolIcon icon="Arrow_Left_MD" rtl="Arrow_Right_MD" />{" "}
                  {t("backToTriggers")}
                </button>
                <TabHeader>{t(`triggerEvent.${openTrigger.event}`)}</TabHeader>
                <div className="rounded px-4 py-3 bg-gray-200 dark:bg-gray-900 shadow">
                  <div className="flex">
                    <div>
                      <p className="text-sm font-medium">
                        {t("createTrigger.when")}
                      </p>
                      <p className="font-semibold text-lg">
                        {t(`triggerEventDescription.${openTrigger.event}`)}
                      </p>
                    </div>
                    <CoolIcon
                      icon={flowEventsDetails[openTrigger.event].icon}
                      className="text-4xl my-auto ml-auto"
                    />
                  </div>
                  <hr className="border border-gray-400 dark:border-gray-600 my-2" />
                  <p className="text-sm font-medium">
                    {t("createTrigger.then")}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditOpenTriggerFlow(true)}>
                      {t("editFlow")}
                    </Button>
                    <Button
                      discordstyle={ButtonStyle.Secondary}
                      disabled={
                        triggerSaveFetcher.state !== "idle" ||
                        triggerEventTestFetcher.state !== "idle"
                      }
                      onClick={() =>
                        triggerEventTestFetcher.submit(null, {
                          action: apiUrl(
                            BRoutes.guildTriggerEvent(
                              guild.id,
                              openTrigger.event,
                            ),
                          ),
                          method: "PUT",
                        })
                      }
                    >
                      {t("sendTestEvent")}
                    </Button>
                  </div>
                </div>
                <Button
                  className="mt-2"
                  discordstyle={ButtonStyle.Success}
                  disabled={triggerSaveFetcher.state !== "idle"}
                  onClick={async () => {
                    if (draftFlow) {
                      await triggerSaveFetcher.submitAsync(
                        { flow: draftFlow },
                        {
                          action: apiUrl(
                            BRoutes.guildTrigger(guild.id, openTrigger.id),
                          ),
                          method: "PATCH",
                        },
                      );
                    }
                  }}
                >
                  {t("save")}
                </Button>
                <Button
                  className="ltr:ml-2 rtl:mr-2"
                  discordstyle={ButtonStyle.Danger}
                  disabled={triggerSaveFetcher.state !== "idle"}
                  onClick={() =>
                    setConfirm({
                      title: t("deleteTrigger"),
                      children: (
                        <>
                          <p>
                            {t("deleteTriggerConfirm", {
                              replace: [openTrigger.event],
                            })}
                          </p>
                          <Button
                            onClick={async () => {
                              await triggerSaveFetcher.submitAsync(undefined, {
                                action: apiUrl(
                                  BRoutes.guildTrigger(
                                    guild.id,
                                    openTrigger.id,
                                  ),
                                ),
                                method: "DELETE",
                              });
                              setOpenTriggerId(undefined);
                              setConfirm(undefined);
                              triggersFetcher.load(
                                apiUrl(BRoutes.guildTriggers(guild.id)),
                              );
                            }}
                            className="mt-2"
                            discordstyle={ButtonStyle.Danger}
                          >
                            {t("delete")}
                          </Button>
                        </>
                      ),
                    })
                  }
                >
                  {t("delete")}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex mb-2">
                  <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                    {t(tab)}
                  </p>
                  <Button
                    onClick={() => setCreatingTrigger(true)}
                    className="mb-auto ltr:ml-auto rtl:mr-auto"
                  >
                    {t("newTrigger")}
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {triggersFetcher.data ? (
                    triggersFetcher.data.map((trigger) => {
                      const meta = flowEventsDetails[trigger.event];
                      return (
                        <button
                          key={`trigger-${trigger.id}`}
                          type="button"
                          className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-background-secondary-dark dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg flex flex-col"
                          onClick={() => setOpenTriggerId(trigger.id)}
                        >
                          <CoolIcon
                            icon={meta.icon}
                            className="text-6xl mx-auto opacity-80"
                          />
                          <p className="text-center font-medium truncate text-sm">
                            {t(`triggerEvent.${trigger.event}`)}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
            )
          ) : tab === "components" ? (
            <div>
              <TabHeader>{t("components")}</TabHeader>
              <div>
                {componentsFetcher.data
                  ? (() => {
                      // biome-ignore lint/style/noNonNullAssertion: Above
                      const allComponents = componentsFetcher.data!;
                      const byChannel: Record<
                        string,
                        Record<string, typeof allComponents>
                      > = {};
                      for (const component of allComponents) {
                        const channelId = component.channelId?.toString() ?? "";
                        const messageId = component.messageId?.toString() ?? "";
                        byChannel[channelId] = byChannel[channelId] ?? {};
                        byChannel[channelId][messageId] =
                          byChannel[channelId][messageId] ?? [];
                        byChannel[channelId][messageId].push(component);
                      }

                      return (
                        <div className="space-y-4">
                          {Object.entries(byChannel).map(
                            ([channelId, byMessage]) => {
                              return (
                                <div key={`components-${channelId}`}>
                                  <div
                                    className="text-base font-medium"
                                    style={{
                                      // @ts-expect-error
                                      "--font-size": "1rem",
                                    }}
                                  >
                                    {channelId ? (
                                      <a
                                        href={`https://discord.com/channels/${guild.id}/${channelId}`}
                                        className="contents"
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <Markdown
                                          content={`<#${channelId}>`}
                                          features="full"
                                          cache={cache}
                                        />
                                      </a>
                                    ) : (
                                      "None"
                                    )}
                                  </div>
                                  <div className="space-y-2 mt-1">
                                    {Object.entries(byMessage).map(
                                      ([messageId, components]) => (
                                        <div
                                          key={`components-message-${messageId}`}
                                          className="flex p-2 text-base text-gray-600 dark:text-gray-400 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition"
                                        >
                                          <div className="flex flex-wrap gap-x-1.5 gap-y-0 mt-1 ltr:mr-4 rtl:ml-4">
                                            {components.map((component) => (
                                              <div
                                                key={`component-${component.id}`}
                                                className={twJoin(
                                                  getComponentWidth(
                                                    component.data,
                                                  ) >= 5
                                                    ? "block w-full my-1 first:mt-0"
                                                    : "contents",
                                                )}
                                              >
                                                <GenericPreviewComponent
                                                  // @ts-expect-error the type is close enough for this component
                                                  // TODO: use `buildStorableComponent` for general completeness
                                                  data={{
                                                    ...component.data,
                                                    // Easier than messing with <Button/> for now
                                                    ...(component.data.type ===
                                                    ComponentType.Button
                                                      ? {
                                                          url: "",
                                                          disabled: false,
                                                        }
                                                      : {}),
                                                  }}
                                                  cache={cache}
                                                  t={t}
                                                  onClick={(e) => {
                                                    if (e.shiftKey) {
                                                      navigate(
                                                        `/edit/component/${component.id}`,
                                                      );
                                                      return;
                                                    }

                                                    setConfirm({
                                                      title:
                                                        t("messageComponent"),
                                                      children: (
                                                        <>
                                                          <div className="flex w-full">
                                                            <div className="mx-auto">
                                                              <GenericPreviewComponent
                                                                // @ts-expect-error
                                                                data={
                                                                  component.data
                                                                }
                                                                cache={cache}
                                                                t={t}
                                                              />
                                                            </div>
                                                          </div>
                                                          <hr className="border border-gray-500/20 mt-4 mb-1" />
                                                          <p className="text-muted dark:text-muted-dark text-sm font-medium">
                                                            {t(
                                                              "componentEditShiftSkipTip",
                                                            )}
                                                          </p>
                                                          <div className="space-x-1.5 rtl:space-x-reverse mt-4">
                                                            <Link
                                                              to={`/edit/component/${component.id}`}
                                                              className="contents"
                                                            >
                                                              <Button
                                                                discordstyle={
                                                                  ButtonStyle.Link
                                                                }
                                                              >
                                                                {t("edit")}
                                                              </Button>
                                                            </Link>
                                                            <Button
                                                              discordstyle={
                                                                ButtonStyle.Danger
                                                              }
                                                              onClick={async (
                                                                e,
                                                              ) => {
                                                                const callback =
                                                                  async () => {
                                                                    await componentDeleteFetcher.submitAsync(
                                                                      undefined,
                                                                      {
                                                                        method:
                                                                          "DELETE",
                                                                        action:
                                                                          apiUrl(
                                                                            BRoutes.component(
                                                                              component.id.toString(),
                                                                            ),
                                                                          ),
                                                                      },
                                                                    );
                                                                    await componentsFetcher.loadAsync(
                                                                      apiUrl(
                                                                        BRoutes.guildComponents(
                                                                          guild.id,
                                                                        ),
                                                                      ),
                                                                    );
                                                                  };

                                                                if (
                                                                  e.shiftKey
                                                                ) {
                                                                  await callback();
                                                                  return;
                                                                }

                                                                setConfirm({
                                                                  title:
                                                                    t(
                                                                      "deleteComponent",
                                                                    ),
                                                                  children: (
                                                                    <>
                                                                      <p>
                                                                        {t(
                                                                          "deleteComponentConfirm",
                                                                          {
                                                                            replace:
                                                                              {
                                                                                type: component
                                                                                  .data
                                                                                  .type,
                                                                              },
                                                                          },
                                                                        )}
                                                                      </p>
                                                                      <p className="text-muted dark:text-muted-dark text-sm font-medium">
                                                                        {t(
                                                                          "shiftSkipTip",
                                                                        )}
                                                                      </p>
                                                                      <Button
                                                                        className="mt-4"
                                                                        discordstyle={
                                                                          ButtonStyle.Danger
                                                                        }
                                                                        onClick={async () => {
                                                                          await callback();
                                                                          setConfirm(
                                                                            undefined,
                                                                          );
                                                                        }}
                                                                      >
                                                                        {t(
                                                                          "delete",
                                                                        )}
                                                                      </Button>
                                                                    </>
                                                                  ),
                                                                });
                                                              }}
                                                            >
                                                              {t("delete")}
                                                            </Button>
                                                          </div>
                                                        </>
                                                      ),
                                                    });
                                                  }}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                          {channelId && messageId && (
                                            <div className="border-l border-l-blurple/30 ltr:ml-auto rtl:mr-auto ltr:pl-4 ltr:pr-1 rtl:pr-4 rtl:pl-1 flex">
                                              <a
                                                href={`https://discord.com/channels/${guild.id}/${channelId}/${messageId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="m-auto"
                                              >
                                                <PostChannelIcon className="h-8 w-8 hover:opacity-80 transition-opacity" />
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      );
                    })()
                  : Array(10)
                      .fill(undefined)
                      .map((_, i) => (
                        <div
                          key={`component-skeleton-${i}`}
                          className="h-16 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition mb-2"
                        />
                      ))}
              </div>
            </div>
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
};
