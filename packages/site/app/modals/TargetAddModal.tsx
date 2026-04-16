import { Link } from "@remix-run/react";
import {
  type APIWebhook,
  ButtonStyle,
  PermissionFlagsBits,
  WebhookType,
} from "discord-api-types/v10";
import { getDate } from "discord-snowflake";
import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import type { ApiGetCurrentUserMemberships } from "~/api/v1/users.@me.memberships";
import { AsyncGuildSelect } from "~/components/AsyncGuildSelect";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { FluxerLogo } from "~/components/icons/Logo";
import { linkClassName } from "~/components/preview/Markdown";
import { RadioishBox } from "~/components/Radio";
import { TextInput } from "~/components/TextInput";
import { ProfilePreview } from "~/routes/s.$guildId";
import type { FluxerAPIWebhookWithoutUser } from "~/types/fluxer";
import type { TFunction } from "~/types/i18next";
import { TargetType } from "~/types/QueryData-raw";
import type { CacheManager } from "~/util/cache/CacheManager";
import { FLUXER_WEBHOOK_URL_RE, WEBHOOK_URL_RE } from "~/util/constants";
import {
  cdnImgAttributes,
  DISCORD_BOT_TOKEN_RE,
  getWebhook,
  webhookAvatarUrl,
} from "~/util/discord";
import { fluxerWebhookAvatarUrl, getFluxerWebhook } from "~/util/fluxer";
import { useApiLoader, useSafeFetcher } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { randomString } from "~/util/text";
import type {
  ApiPostApplicationsToken,
  ApplicationWithJwt,
} from "../api/v1/applications.$id";
import type { loader as ApiGetGuildChannels } from "../api/v1/guilds.$guildId.channels";
import type { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import type { loader as ApiGetGuildWebhookToken } from "../api/v1/guilds.$guildId.webhooks.$webhookId.token";
import { getTargetKey, type Target, type TargetMap } from "./MessageSendModal";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

interface GenericListedTargetInfo {
  name: string;
  avatar?: {
    src: string | undefined;
    srcSet: string;
  };
  user?: { name: string | null };
  createdAt: Date;
  checkmark?: boolean;
}

export const getGenericTargetInfo = (
  target: Target,
  discordApplicationId?: string,
): GenericListedTargetInfo => {
  switch (target.type) {
    case TargetType.Webhook:
      return {
        name: target.webhook.name ?? "Webhook",
        avatar: cdnImgAttributes(64, (size) =>
          webhookAvatarUrl(target.webhook, { size }),
        ),
        createdAt: getDate(target.webhook.id as `${bigint}`),
        user: target.webhook.user
          ? { name: target.webhook.user.username }
          : undefined,
        checkmark:
          discordApplicationId !== undefined &&
          discordApplicationId === target.webhook.application_id,
      };
    case TargetType.FluxerWebhook:
      return {
        name: target.webhook.name,
        avatar: cdnImgAttributes(64, (size) =>
          fluxerWebhookAvatarUrl(target.webhook, { size }),
        ),
        createdAt: getDate(target.webhook.id as `${bigint}`),
        user: target.webhook.user
          ? { name: target.webhook.user.username }
          : undefined,
      };
    default:
      return {
        name: `Unknown (${TargetType[target.type]})`,
        createdAt: new Date(),
      };
  }
};

export const ListTarget = ({
  t,
  target,
  channel,
  discordApplicationId,
  endComponent,
}: {
  t: TFunction;
  target: Target;
  channel?: { name: string | null };
  discordApplicationId?: string;
  endComponent?: JSX.Element;
}) => {
  const info = getGenericTargetInfo(target, discordApplicationId);
  return (
    <div className="rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex items-center">
      <div className="relative me-3">
        <img {...info.avatar} className="rounded-full size-8" alt={info.name} />
        {target.type === TargetType.FluxerWebhook ? (
          <FluxerLogo className="text-[#F5F4FC] size-4 rounded-full bg-fluxer absolute -bottom-0.5 -end-0.5" />
        ) : null}
      </div>
      <div className="truncate">
        <div className="flex max-w-full">
          <p className="font-semibold truncate dark:text-primary-230 text-base">
            {info.name}
          </p>
          {info.checkmark ? (
            <span className="ms-1 inline-block" title={t("createdByDiscohook")}>
              <CoolIcon
                icon="Circle_Check"
                className="text-blurple-500 dark:text-blurple-400"
              />
            </span>
          ) : null}
        </div>
        <p className="text-muted dark:text-muted-dark text-xs">
          {target.type === TargetType.FluxerWebhook
            ? null
            : `#${channel?.name ?? "unknown"} • `}
          {t(info.user ? "createdAtBy" : "createdAt", {
            replace: {
              createdAt: new Date(info.createdAt),
              username: info.user?.name,
            },
          })}
        </p>
      </div>
      {endComponent ? <div className="ms-auto ps-2">{endComponent}</div> : null}
    </div>
  );
};

const AddWebhookTarget = ({
  t,
  visible,
  memberships,
  cache,
  setOpen,
  setSetOpen,
  updateTargets,
  applyThreadId,
  hasAuthentication,
  discordApplicationId,
}: {
  t: TFunction;
  visible: boolean;
  memberships: ReturnType<typeof useApiLoader<ApiGetCurrentUserMemberships>>;
  cache: CacheManager | undefined;
  setOpen: (v: boolean) => void;
  setSetOpen: React.Dispatch<(open: boolean) => void>;
  updateTargets: React.Dispatch<Partial<TargetMap>>;
  applyThreadId?: (threadId: string) => void;
  hasAuthentication?: boolean;
  discordApplicationId?: string;
}) => {
  const [webhook, setWebhook] = useState<APIWebhook>();
  const [urlError, setUrlError] = useState<ReactNode>();
  const [manualWebhook, setManualWebhook] = useState(!hasAuthentication);

  const [threadId, setThreadId] = useState<string>();
  const [willApplyThread, setWillApplyThread] = useState(false);
  const [error, setError] = useError(t);
  const [guildId, setGuildId] = useState<string>();
  const [page, setPage] = useState(1);
  const guildWebhooksFetcher = useSafeFetcher<typeof ApiGetGuildWebhooks>({
    onError: setError,
  });
  const guildWebhookTokenFetcher = useSafeFetcher<
    typeof ApiGetGuildWebhookToken
  >({ onError: setError });

  // biome-ignore lint/correctness/useExhaustiveDependencies: only update when I want
  useEffect(() => {
    if (
      guildWebhookTokenFetcher.data &&
      guildWebhookTokenFetcher.state === "idle"
    ) {
      if (webhook) {
        const target: Target = { type: TargetType.Webhook, webhook };
        updateTargets({ [getTargetKey(target)]: target });
        setOpen(false);
      } else {
        getWebhook(
          guildWebhookTokenFetcher.data.id,
          guildWebhookTokenFetcher.data.token,
        ).then((webhook) => {
          if (webhook.id) {
            setWebhook(webhook);
            if (cache && webhook.guild_id) {
              cache.fetchGuildCacheable(webhook.guild_id);
            }
          } else if ("message" in webhook) {
            setError({ message: webhook.message as string });
          }
        });
      }
    }
  }, [guildWebhookTokenFetcher, webhook, updateTargets]);

  const avatarUrl = webhook ? webhookAvatarUrl(webhook, { size: 128 }) : null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to depend on the stateful webhook value
  useEffect(() => {
    // @ts-expect-error
    window.handlePopupClose = (result: APIWebhook) => {
      if (cache && result.guild_id) {
        cache.fetchGuildCacheable(result.guild_id);
      }
      const target: Target = { type: TargetType.Webhook, webhook: result };
      updateTargets({ [getTargetKey(target)]: target });
      setOpen(false);
    };
  }, [webhook, updateTargets]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the component becomes visible
  useEffect(() => {
    const doReset = () => {
      guildWebhooksFetcher.reset();
      guildWebhookTokenFetcher.reset();
      setPage(1);
      setGuildId(undefined);
      setWebhook(undefined);
      setError(undefined);
      setUrlError(undefined);
    };
    if (!visible) {
      doReset();
      return;
    }
    setSetOpen((open: boolean) => {
      if (!open) doReset();
    });
  }, [visible]);

  return visible ? (
    <>
      {!manualWebhook ? (
        <div>
          {error}
          <p className="text-sm">{t("chooseServer")}</p>
          <AsyncGuildSelect
            t={t}
            guilds={(memberships ?? []).map(({ guild, favorite }) => ({
              ...guild,
              botJoinedAt: guild.botJoinedAt
                ? new Date(guild.botJoinedAt)
                : null,
              favorite,
            }))}
            className="w-full"
            onChange={(guild) => {
              if (!guild) return;

              if (guildId && String(guild.id) !== guildId) {
                guildWebhooksFetcher.reset();
                setPage(1);
              }
              setError(undefined);
              guildWebhooksFetcher.load(
                apiUrl(BRoutes.guildWebhooks(guild.id)),
              );
              setGuildId(String(guild.id));
            }}
          />
          <p className="text-sm mt-1">
            <Trans
              t={t}
              i18nKey="selectWebhookGuildMissing"
              components={[
                <Link
                  key="0"
                  to="/auth/discord?force=true&redirect=/?m=add-target"
                  className={linkClassName}
                  target="_blank"
                />,
              ]}
            />
            <br />
            <Trans
              t={t}
              i18nKey="selectWebhookGuildManual"
              components={[
                <button
                  key="0"
                  type="button"
                  className={linkClassName}
                  onClick={() => setManualWebhook(true)}
                />,
              ]}
            />
          </p>
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          <div className="overflow-y-auto max-h-60">
            {!guildWebhooksFetcher.data ? (
              guildWebhooksFetcher.state === "idle" ? (
                <p className="text-center text-sm text-muted dark:text-muted-dark">
                  {t("selectWebhookGuildNote")}
                </p>
              ) : (
                <div className="space-y-2 animate-pulse">
                  {Array(4)
                    .fill(undefined)
                    .map(() => (
                      <div
                        key={randomString(10)}
                        className="rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                      >
                        <div className="rounded-full my-auto w-8 h-8 mr-3 bg-gray-400 dark:bg-gray-600" />
                        <div className="my-auto">
                          <div className="rounded-full truncate bg-gray-400 dark:bg-gray-600 w-36 h-4" />
                          <div className="rounded-full bg-gray-400 dark:bg-gray-600 w-24 h-3 mt-px" />
                        </div>
                        <div className="ml-auto pl-2">
                          <Button disabled />
                        </div>
                      </div>
                    ))}
                </div>
              )
            ) : guildWebhooksFetcher.data.length === 0 ? (
              <p className="text-center text-muted dark:text-muted-dark text-sm">
                {t("selectWebhookGuildNoWebhooks")}
              </p>
            ) : (
              <div className="space-y-2">
                {guildWebhooksFetcher.data.map((gWebhook) => (
                  <ListTarget
                    key={`webhook-${gWebhook.id}`}
                    t={t}
                    target={{
                      type: TargetType.Webhook,
                      webhook: {
                        id: gWebhook.id,
                        name: gWebhook.name,
                        avatar: gWebhook.avatar,
                        channel_id: gWebhook.channelId,
                        application_id: gWebhook.applicationId,
                        type: WebhookType.Incoming,
                      },
                    }}
                    channel={gWebhook.channel}
                    discordApplicationId={discordApplicationId}
                    endComponent={
                      <Button
                        disabled={
                          guildWebhookTokenFetcher.state !== "idle" ||
                          guildWebhooksFetcher.state !== "idle"
                        }
                        onClick={() => {
                          if (!guildId) return;
                          guildWebhookTokenFetcher.load(
                            apiUrl(
                              BRoutes.guildWebhookToken(guildId, gWebhook.id),
                            ),
                          );
                        }}
                      >
                        {t("use")}
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <TextInput
            label={t("webhookUrl")}
            type="password"
            className="w-full"
            errors={[urlError]}
            onFocus={(e) => {
              e.currentTarget.type = "text";
            }}
            onBlur={(e) => {
              e.currentTarget.type = "password";
            }}
            delayOnInput={200}
            onInput={async (e) => {
              setUrlError(undefined);
              setWebhook(undefined);
              if (!e.currentTarget.value) return;

              const match = e.currentTarget.value.match(WEBHOOK_URL_RE);
              if (!match) {
                setUrlError(t("invalidWebhookUrl"));
                return;
              }

              const webhook = await getWebhook(match[1], match[2]);
              if (webhook.id) {
                setWebhook(webhook);
                setThreadId(match[3] || undefined);
                setWillApplyThread(false);
              } else if ("message" in webhook) {
                setUrlError(webhook.message as string);
                setThreadId(undefined);
                setWillApplyThread(false);
              }
            }}
          />
          {memberships !== undefined && hasAuthentication ? (
            <button
              className={twJoin(linkClassName, "text-sm")}
              onClick={() => setManualWebhook(false)}
              type="button"
            >
              {t("backToServerSelection")}
            </button>
          ) : null}
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          <div
            className={twJoin(
              "flex py-4",
              webhook ? undefined : "animate-pulse",
            )}
          >
            <div className="w-1/3 me-4 my-auto">
              {avatarUrl ? (
                <img
                  className="rounded-full size-24 m-auto"
                  src={avatarUrl}
                  alt={webhook?.name ?? "Webhook"}
                />
              ) : (
                <div className="rounded-full size-24 bg-gray-400 dark:bg-gray-600 m-auto" />
              )}
            </div>
            <div className="grow">
              {webhook ? (
                <>
                  <p className="font-bold text-xl">{webhook.name}</p>
                  {threadId && applyThreadId !== undefined ? (
                    <p className="text-gray-500 dark:text-gray-400 transition">
                      <Trans
                        t={t}
                        i18nKey={
                          willApplyThread
                            ? "threadWebhookApplyConfirm"
                            : "threadWebhookApplyPrompt"
                        }
                        components={{
                          open: (
                            // biome-ignore lint/a11y/useAnchorContent: supplied by <Trans/>
                            <a
                              className="hover:underline"
                              href={`https://discord.com/channels/${webhook.guild_id}/${threadId}`}
                              target="_blank"
                              rel="noreferrer"
                            />
                          ),
                          toggle: (
                            <button
                              type="button"
                              className={linkClassName}
                              onClick={() => setWillApplyThread((s) => !s)}
                            />
                          ),
                        }}
                      />
                    </p>
                  ) : null}
                  <hr className="border border-gray-400 dark:border-gray-600 my-2" />
                  <p className="text-muted dark:text-muted-dark transition">
                    <Trans
                      t={t}
                      i18nKey="channelId"
                      components={[
                        <a
                          key="0"
                          className="hover:underline"
                          href={`https://discord.com/channels/${webhook.guild_id}/${webhook.channel_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {webhook.channel_id}
                        </a>,
                      ]}
                    />
                  </p>
                  <p className="text-muted dark:text-muted-dark transition">
                    <Trans
                      t={t}
                      i18nKey="guildId"
                      components={[
                        <a
                          key="0"
                          className="hover:underline"
                          href={`https://discord.com/channels/${webhook.guild_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {webhook.guild_id}
                        </a>,
                      ]}
                    />
                  </p>
                </>
              ) : (
                <div>
                  <div className="h-5 rounded-full bg-gray-400 dark:bg-gray-600 w-1/3" />
                  <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-1/2" />
                  <hr className="border border-gray-400 dark:border-gray-600 my-4" />
                  <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-4/6" />
                  <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-3/6" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex mt-4">
        <div className="mx-auto space-x-2 rtl:space-x-reverse">
          {manualWebhook && (
            <Button
              disabled={!webhook}
              onClick={() => {
                if (webhook) {
                  if (cache && webhook.guild_id) {
                    cache.fetchGuildCacheable(webhook.guild_id);
                  }
                  const target: Target = { type: TargetType.Webhook, webhook };
                  updateTargets({ [getTargetKey(target)]: target });
                  if (willApplyThread && applyThreadId && threadId) {
                    applyThreadId(threadId);
                  }
                  setOpen(false);
                }
              }}
            >
              {t("addTarget.1")}
            </Button>
          )}
          <Button
            discordstyle={ButtonStyle.Link}
            onClick={() =>
              window.open(
                `/auth/discord-webhook${guildId ? `?guildId=${guildId}` : ""}`,
                "_blank",
                "popup width=530 height=750",
              )
            }
          >
            {t("createWebhook")}
          </Button>
        </div>
      </div>
    </>
  ) : null;
};

const AddBotTarget = ({
  t,
  visible,
  memberships,
  cache,
  setOpen,
  setSetOpen,
  updateTargets,
  applyThreadId,
  hasAuthentication,
  discordApplicationId,
}: {
  t: TFunction;
  visible: boolean;
  memberships: ReturnType<typeof useApiLoader<ApiGetCurrentUserMemberships>>;
  cache: CacheManager | undefined;
  setOpen: (v: boolean) => void;
  setSetOpen: React.Dispatch<(open: boolean) => void>;
  updateTargets: React.Dispatch<Partial<TargetMap>>;
  applyThreadId?: (threadId: string) => void;
  hasAuthentication?: boolean;
  discordApplicationId?: string;
}) => {
  const [target, setTarget] = useState<ApplicationWithJwt>();

  const [tokenError, setTokenError] = useState<ReactNode>();
  const [error, setError] = useError(t);
  const [guildId, setGuildId] = useState<string>();
  const [channelId, setChannelId] = useState<string>();
  const guildChannelsFetcher = useSafeFetcher<typeof ApiGetGuildChannels>({
    onError: setError,
  });
  const botTokenFetcher = useSafeFetcher<ApiPostApplicationsToken>({
    onError: setError,
  });

  // const avatarUrl = target
  //   ? botAppAvatar(
  //       {
  //         applicationId: target.id,
  //         applicationUserId: target.bot.id,
  //         icon: target.icon,
  //         avatar: target.bot.avatar,
  //         discriminator: target.bot.discriminator,
  //       },
  //       { size: 128 },
  //     )
  //   : null;
  // const flags = useMemo(
  //   () => new UserFlagsBitField(target?.bot?.flags ?? 0),
  //   [target?.bot?.flags],
  // );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the component becomes visible
  useEffect(() => {
    const doReset = () => {
      guildChannelsFetcher.reset();
      setGuildId(undefined);
      setTarget(undefined);
      setError(undefined);
    };
    if (!visible) {
      doReset();
      return;
    }
    setSetOpen((open: boolean) => {
      if (!open) doReset();
    });
  }, [visible]);

  return visible ? (
    <div>
      <div className="flex gap-2">
        <TextInput
          label={t("botToken")}
          type="password"
          labelClassName="grow"
          className="w-full"
          errors={[tokenError]}
          onFocus={(e) => {
            e.currentTarget.type = "text";
          }}
          onBlur={(e) => {
            e.currentTarget.type = "password";
          }}
          delayOnInput={200}
          onInput={async (e) => {
            setTokenError(undefined);
            setTarget(undefined);
            if (!e.currentTarget.value) return;

            const match = e.currentTarget.value.match(DISCORD_BOT_TOKEN_RE);
            if (!match) {
              setTokenError(t("invalidBotToken"));
              return;
            }

            // const result = await getApplicationRpc(match[1], match[2]);
            const result = await botTokenFetcher.submitAsync(
              { token: match[0] },
              { action: apiUrl(BRoutes.applicationToken()), method: "POST" },
            );
            if (result.app.id) {
              setTarget(result.app);
            } else if ("message" in result) {
              setTokenError(result.message as string);
            }
          }}
        />
        <Button
          disabled={!target || !channelId}
          onClick={() => {}}
          className="h-9 mt-auto"
        >
          {t("save")}
        </Button>
      </div>
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <div
        className={twJoin(
          "flex pt-2 pb-4 gap-4 flex-col md:flex-row relative",
          target ? undefined : "animate-pulse",
        )}
      >
        <div className="self-center md:self-auto">
          {target ? (
            <ProfilePreview
              t={t}
              user={{ ...target.bot, bot: true }}
              member={{
                bio: botTokenFetcher.data?.extra.description ?? "",
                guild_id: "",
              }}
            />
          ) : (
            <div
              className={twJoin(
                "rounded-lg w-64 h-48 shadow-lg bg-white dark:bg-gray-800",
                "box-border border border-border-normal dark:border-border-normal-dark",
              )}
            />
          )}
        </div>
        {target ? (
          <div
            className={twJoin(
              "md:absolute top-2 right-0 md:w-1/2 lg:w-auto lg:relative",
              "md:p-2 lg:p-0 bg-gray-50 dark:bg-[#37373D] rounded-lg",
              "md:shadow-md lg:shadow-none",
              "md:border lg:border-none border-border-normal dark:border-border-normal-dark",
              "transition-[padding]",
            )}
          >
            <div className="shrink md:grow">
              <TextInput
                label={t("channel")}
                description={t("botTargetChannelPrompt", {
                  replace: {
                    name: target.bot.global_name ?? target.bot.username,
                  },
                })}
                required
                className="w-full"
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  // setChannelId();
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

const AddFluxerWebhookTarget = ({
  t,
  visible,
  setOpen,
  setSetOpen,
  updateTargets,
}: {
  t: TFunction;
  visible: boolean;
  setOpen: (v: boolean) => void;
  setSetOpen: React.Dispatch<(open: boolean) => void>;
  updateTargets: React.Dispatch<Partial<TargetMap>>;
}) => {
  const [webhook, setWebhook] = useState<FluxerAPIWebhookWithoutUser>();
  const [urlError, setUrlError] = useState<ReactNode>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the component becomes visible
  useEffect(() => {
    const doReset = () => {
      setWebhook(undefined);
      setUrlError(undefined);
    };
    if (!visible) {
      doReset();
      return;
    }
    setSetOpen((open: boolean) => {
      if (!open) doReset();
    });
  }, [visible]);

  return visible ? (
    <>
      <div>
        <TextInput
          label={t("webhookUrl")}
          type="password"
          className="w-full"
          errors={[urlError]}
          onFocus={(e) => {
            e.currentTarget.type = "text";
          }}
          onBlur={(e) => {
            e.currentTarget.type = "password";
          }}
          delayOnInput={200}
          onInput={async (e) => {
            setUrlError(undefined);
            setWebhook(undefined);
            if (!e.currentTarget.value) return;

            const match = e.currentTarget.value.match(FLUXER_WEBHOOK_URL_RE);
            if (!match) {
              setUrlError(t("invalidWebhookUrl"));
              return;
            }

            const webhook = await getFluxerWebhook(match[1], match[2]);
            if (webhook.id) {
              setWebhook(webhook);
            } else if ("message" in webhook) {
              setUrlError(webhook.message as string);
            }
          }}
        />
        <hr className="border border-gray-400 dark:border-gray-600 my-4" />
        <div
          className={twJoin("flex py-4", webhook ? undefined : "animate-pulse")}
        >
          <div className="w-1/3 me-4 my-auto">
            <div className="relative m-auto w-fit">
              {webhook ? (
                <img
                  {...cdnImgAttributes(128, (size) =>
                    fluxerWebhookAvatarUrl(webhook, { size }),
                  )}
                  className="rounded-full size-24"
                  alt={webhook.name ?? "Webhook"}
                />
              ) : (
                <div className="rounded-full size-24 bg-gray-400 dark:bg-gray-600" />
              )}
              <FluxerLogo
                className={twJoin(
                  "text-[#F5F4FC] size-8 rounded-full p-0.5 absolute -bottom-0 -end-0",
                  webhook ? "bg-fluxer" : "bg-gray-500",
                )}
              />
            </div>
          </div>
          <div className="grow">
            {webhook ? (
              <>
                <p className="font-bold text-xl">{webhook.name}</p>
                <hr className="border border-gray-400 dark:border-gray-600 my-2" />
                <p className="text-muted dark:text-muted-dark transition">
                  <Trans
                    t={t}
                    i18nKey="channelId"
                    components={[
                      <a
                        key="0"
                        className="hover:underline"
                        href={`https://web.fluxer.app/channels/${webhook.guild_id}/${webhook.channel_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {webhook.channel_id}
                      </a>,
                    ]}
                  />
                </p>
                <p className="text-muted dark:text-muted-dark transition">
                  <Trans
                    t={t}
                    i18nKey="guildId"
                    components={[
                      <a
                        key="0"
                        className="hover:underline"
                        href={`https://web.fluxer.app/channels/${webhook.guild_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {webhook.guild_id}
                      </a>,
                    ]}
                  />
                </p>
              </>
            ) : (
              <div>
                <div className="h-5 rounded-full bg-gray-400 dark:bg-gray-600 w-1/3" />
                <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-1/2" />
                <hr className="border border-gray-400 dark:border-gray-600 my-4" />
                <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-4/6" />
                <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-3/6" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex mt-4">
        <div className="mx-auto space-x-2 rtl:space-x-reverse">
          <Button
            disabled={!webhook}
            onClick={() => {
              if (webhook) {
                const target: Target = {
                  type: TargetType.FluxerWebhook,
                  id: webhook.id,
                  token: webhook.token,
                  webhook,
                };
                updateTargets({ [getTargetKey(target)]: target });
                setOpen(false);
              }
            }}
          >
            {t("addTarget.3")}
          </Button>
        </div>
      </div>
    </>
  ) : null;
};

export const TargetAddModal = (
  props: ModalProps & {
    discordApplicationId: string;
    updateTargets: React.Dispatch<Partial<TargetMap>>;
    hasAuthentication?: boolean;
    cache?: CacheManager;
    applyThreadId?: (threadId: string) => void;
  },
) => {
  const { t } = useTranslation();
  const [targetType, setTargetType] = useState(TargetType.Webhook);

  const [{ experiments = [] }] = useLocalStorage();
  const expMoreTargets =
    experiments.find((e) => e.id === "MORE_TARGETS") !== undefined;

  const memberships = useApiLoader<ApiGetCurrentUserMemberships>(
    `${BRoutes.currentUserMemberships()}?permissions=${
      PermissionFlagsBits.ManageWebhooks
    }`,
  );
  const [, setCache] = useLocalStorage<{ memberships: typeof memberships }>(
    "discohook_cache",
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: setCache is not relevant
  useEffect(() => {
    if (memberships) setCache({ memberships });
    // clear this cache if the user logged out
    else if (!props.hasAuthentication) setCache({ memberships: [] });
  }, [memberships, props.hasAuthentication]);

  // Allow target adders to define their own post-setOpen callback
  const [setOpen, setSetOpen] = useReducer(
    (_: typeof props.setOpen, newFunc: typeof props.setOpen) => {
      return (v: boolean) => {
        props.setOpen(v);
        newFunc(v);
      };
    },
    props.setOpen,
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  useEffect(() => {
    const callback = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", callback);
    callback(); // initialize value on page load
    return () => window.removeEventListener("resize", callback);
  }, []);

  return (
    <Modal {...props} setOpen={setOpen}>
      <PlainModalHeader>{t(`addTarget.${targetType}`)}</PlainModalHeader>
      <div className="flex flex-col md:flex-row-reverse gap-4">
        {expMoreTargets ? (
          <div
            className="w-full md:w-1/4 flex flex-row md:flex-col gap-2 md:overflow-y-auto md:transition-[height]"
            style={{
              height:
                viewportWidth >= 768
                  ? panelRef.current
                    ? `${panelRef.current.scrollHeight}px`
                    : "auto"
                  : "auto",
            }}
          >
            <RadioishBox
              isSelected={targetType === TargetType.Webhook}
              onSelect={() => setTargetType(TargetType.Webhook)}
              name={t("webhook")}
              description={t(
                "The most common type of target, and the easiest to use",
              )}
            />
            <RadioishBox
              isSelected={targetType === TargetType.Bot}
              onSelect={() => setTargetType(TargetType.Bot)}
              name={t("bot")}
              description={t(
                "Just like webhooks, but with more profile options",
              )}
            />
            <RadioishBox
              isSelected={targetType === TargetType.FluxerWebhook}
              onSelect={() => setTargetType(TargetType.FluxerWebhook)}
              name={t("fluxer")}
              description={t("Discord-compatible webhooks for Fluxer.app")}
            />
            {/* <RadioishBox
              isSelected={targetType === TargetType.StoatWebhook}
              onSelect={() => setTargetType(TargetType.StoatWebhook)}
              name={t("stoat")}
              description={t("Discord-compatible webhooks for Stoat.chat")}
            /> */}
          </div>
        ) : null}
        <div className="w-full h-fit" ref={panelRef}>
          <AddWebhookTarget
            t={t}
            visible={targetType === TargetType.Webhook}
            setOpen={setOpen}
            setSetOpen={setSetOpen}
            memberships={memberships}
            updateTargets={props.updateTargets}
            cache={props.cache}
            hasAuthentication={props.hasAuthentication}
            discordApplicationId={props.discordApplicationId}
            applyThreadId={props.applyThreadId}
          />
          <AddBotTarget
            t={t}
            visible={targetType === TargetType.Bot}
            setOpen={setOpen}
            setSetOpen={setSetOpen}
            memberships={memberships}
            updateTargets={props.updateTargets}
            cache={props.cache}
            hasAuthentication={props.hasAuthentication}
            // discordApplicationId={props.discordApplicationId}
            // applyThreadId={props.applyThreadId}
          />
          <AddFluxerWebhookTarget
            t={t}
            visible={targetType === TargetType.FluxerWebhook}
            setOpen={setOpen}
            setSetOpen={setSetOpen}
            updateTargets={props.updateTargets}
          />
        </div>
      </div>
    </Modal>
  );
};
