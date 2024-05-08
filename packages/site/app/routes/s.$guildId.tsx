import { REST } from "@discordjs/rest";
import {
  MetaFunction,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  APIGuild,
  APIWebhook,
  ButtonStyle,
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
import { z } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
} from "~/session.server";
import { useCache } from "~/util/cache/CacheManager";
import { cdn, cdnImgAttributes, isDiscordError } from "~/util/discord";
import { LoaderArgs, useSafeFetcher } from "~/util/loader";
import { zxParseParams } from "~/util/zod";
import { loader as ApiGetAuditLogGuild } from "../api/v1/guilds.$guildId.log";
import { loader as ApiGetGuildSessions } from "../api/v1/guilds.$guildId.sessions";
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
    }
  } catch (e) {
    if (isDiscordError(e)) {
      if (e.code === 10004) {
        throw redirect(`/bot?guildId=${guildId}`);
      }
      throw respond(json(e, e.status));
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
        permissions: permissions.value.toString(),
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
      guild.icon
        ? {
            tagName: "link",
            rel: "icon",
            type: guild.icon.startsWith("a_") ? "image/gif" : "image/webp",
            href: cdn.icon(guild.id, guild.icon, {
              size: 16,
              extension: guild.icon.startsWith("a_") ? "gif" : "webp",
            }),
          }
        : {},
    ];
  }
  return [];
};

const tabValues = ["home", "auditLog", "webhooks", "sessions"] as const;

export default () => {
  const { guild, user, member, discordApplicationId } =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [error, setError] = useError(t);
  const permissions = new PermissionsBitField(BigInt(member.permissions));
  const has = (...flags: BitFlagResolvable[]) =>
    member.owner ? true : permissions.has(...flags);

  const cache = useCache(!user);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    cache.channel.fetchMany(guild.id);
  }, [guild]);

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("t") as (typeof tabValues)[number] | null;
  const [tab, setTab] = useState<(typeof tabValues)[number]>(
    defaultTab && tabValues.includes(defaultTab) ? defaultTab : tabValues[0],
  );
  const [openWebhookId, setOpenWebhookId] = useState<string>();

  const auditLogFetcher = useFetcher<typeof ApiGetAuditLogGuild>();
  const webhooksFetcher = useFetcher<typeof ApiGetGuildWebhooks>();
  const guildWebhookFetcher = useSafeFetcher<typeof ApiPatchGuildWebhook>({
    onError: () => {},
  });
  const sessionsFetcher = useFetcher<typeof ApiGetGuildSessions>();
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
  ]);

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
          // webhooksFetcher.load(apiUrl(BRoutes.guildWebhooks(guild.id)));
        }}
        channels={cache.channel.getAll()}
        webhookId={openWebhookId}
        open={!!openWebhookId}
        setOpen={() => setOpenWebhookId(undefined)}
        user={user}
        cache={cache}
      />
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
          ]}
        >
          {tab === "home" ? (
            <div>
              <TabHeader>{t("home")}</TabHeader>
              <div className="space-y-2">
                <div className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex">
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
                <div className="rounded-lg bg-slate-100 dark:bg-gray-700 border border-black/10 dark:border-gray-50/10 table w-full">
                  <div className="table-header-group">
                    <div className="table-row">
                      <Cell className="font-semibold rounded-tl-lg">
                        {t("tab")}
                      </Cell>
                      <Cell className="font-semibold rounded-tr-lg">
                        {t("permissions")}
                      </Cell>
                    </div>
                  </div>
                  <div className="table-row-group">
                    <div className="table-row">
                      <Cell>{t("home")}</Cell>
                      <Cell>{t("justBeAMember")}</Cell>
                    </div>
                    <div className="table-row">
                      <Cell>{t("webhooks")}</Cell>
                      <Cell>{t("permission.ManageWebhooks")}</Cell>
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
                    </div>
                    {/* <div className="table-row">
                      <Cell>Sessions</Cell>
                      <Cell>View Audit Logs, Manage Server</Cell>
                    </div> */}
                    {/* <div className="table-row">
                      <Cell className="rounded-bl-lg">Components</Cell>
                      <Cell className="rounded-br-lg">
                        Manage Messages, Manage Webhooks
                      </Cell>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "webhooks" ? (
            <div>
              <TabHeader>{t("webhooks")}</TabHeader>
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
                                webhook.avatar
                                  ? cdn.avatar(webhook.id, webhook.avatar, {
                                      size,
                                    })
                                  : cdn.defaultAvatar(5),
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
                    const createdAt = getDate(entry.messageId as `${bigint}`);
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
                        key={`message-entry-${entry.messageId}`}
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
                            webhook?.avatar
                              ? cdn.avatar(webhook.id, webhook.avatar, { size })
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
                              ? webhook.avatar
                                ? cdn.avatar(webhook.id, webhook.avatar, {
                                    size: 64,
                                  })
                                : cdn.defaultAvatar(5)
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
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
};
