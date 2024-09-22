import { Link } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { getDate } from "discord-snowflake";
import { ReactNode, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { BRoutes, apiUrl } from "~/api/routing";
import { AsyncGuildSelect } from "~/components/AsyncGuildSelect";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { LoadedMembership } from "~/routes/_index";
import { CacheManager } from "~/util/cache/CacheManager";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { cdnImgAttributes, getWebhook, webhookAvatarUrl } from "~/util/discord";
import { useSafeFetcher } from "~/util/loader";
import { randomString } from "~/util/text";
import type { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import type { loader as ApiGetGuildWebhookToken } from "../api/v1/guilds.$guildId.webhooks.$webhookId.token";
import { Modal, ModalProps } from "./Modal";

export const TargetAddModal = (
  props: ModalProps & {
    discordApplicationId: string;
    updateTargets: React.Dispatch<Partial<Record<string, APIWebhook>>>;
    hasAuthentication?: boolean;
    memberships?: Promise<LoadedMembership[]>;
    cache?: CacheManager;
  },
) => {
  const { t } = useTranslation();
  const [webhook, setWebhook] = useState<APIWebhook>();
  const [urlError, setUrlError] = useState<ReactNode>();
  const [manualWebhook, setManualWebhook] = useState(
    !props.hasAuthentication || !props.memberships,
  );

  const [error, setError] = useError(t);
  const [guildId, setGuildId] = useState<string>();
  const guildWebhooksFetcher = useSafeFetcher<typeof ApiGetGuildWebhooks>({
    onError(e) {
      if (e.status === 404) {
        setError({ ...e, message: "Discohook Utils is not in this server." });
      } else {
        setError(e);
      }
    },
  });
  const guildWebhookTokenFetcher = useSafeFetcher<
    typeof ApiGetGuildWebhookToken
  >({ onError: setError });

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (
      guildWebhookTokenFetcher.data &&
      guildWebhookTokenFetcher.state === "idle"
    ) {
      if (webhook) {
        props.updateTargets({
          [guildWebhookTokenFetcher.data.id]: webhook,
        });
        setOpen(false);
      } else {
        getWebhook(
          guildWebhookTokenFetcher.data.id,
          guildWebhookTokenFetcher.data.token,
        ).then((webhook) => {
          if (webhook.id) {
            setWebhook(webhook);
            if (props.cache && webhook.guild_id) {
              props.cache.fetchGuildCacheable(webhook.guild_id);
            }
          } else if ("message" in webhook) {
            setError({ message: webhook.message as string });
          }
        });
      }
    }
  }, [guildWebhookTokenFetcher, webhook, props.updateTargets]);

  const avatarUrl = webhook ? webhookAvatarUrl(webhook, { size: 128 }) : null;

  const setOpen = (s: boolean) => {
    props.setOpen(s);
    if (!s) {
      guildWebhooksFetcher.reset();
      guildWebhookTokenFetcher.reset();
      setGuildId(undefined);
      setWebhook(undefined);
      setError(undefined);
      setUrlError(undefined);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to depend on the stateful webhook value
  useEffect(() => {
    // @ts-expect-error
    window.handlePopupClose = (result: APIWebhook) => {
      if (props.cache && result.guild_id) {
        props.cache.fetchGuildCacheable(result.guild_id);
      }
      props.updateTargets({ [result.id]: result });
      setOpen(false);
    };
  }, [webhook, setOpen, props.updateTargets]);

  return (
    <Modal title={t("addWebhook")} {...props} setOpen={setOpen}>
      {!manualWebhook ? (
        <div>
          {error}
          <p className="text-sm">{t("chooseServer")}</p>
          <AsyncGuildSelect
            guilds={(async () =>
              // biome-ignore lint/style/noNonNullAssertion: Must not be null to arrive at this point
              (await props.memberships!).map(({ guild }) => guild))()}
            onChange={(guild) => {
              if (!guild) return;

              if (guildId && String(guild.id) !== guildId) {
                guildWebhooksFetcher.reset();
              }
              setError(undefined);
              guildWebhooksFetcher.load(
                apiUrl(BRoutes.guildWebhooks(guild.id)),
              );
              setGuildId(String(guild.id));
            }}
          />
          <p className="text-sm">
            <Trans
              t={t}
              i18nKey="selectWebhookGuildMissing"
              components={[
                <Link
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
                <p className="text-center opacity-60 text-sm">
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
              <p className="text-center opacity-60 text-sm">
                {t("selectWebhookGuildNoWebhooks")}
              </p>
            ) : (
              <div className="space-y-2">
                {guildWebhooksFetcher.data.map((gWebhook) => {
                  const createdAt = getDate(gWebhook.id as `${bigint}`);
                  return (
                    <div
                      key={`webhook-${gWebhook.id}`}
                      className="rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                    >
                      <img
                        {...cdnImgAttributes(64, (size) =>
                          webhookAvatarUrl(gWebhook, { size }),
                        )}
                        className="rounded-full my-auto w-8 h-8 mr-3"
                        alt={gWebhook.name}
                      />
                      <div className="truncate my-auto">
                        <div className="flex max-w-full">
                          <p className="font-semibold truncate dark:text-primary-230 text-base">
                            {gWebhook.name}
                          </p>
                          {gWebhook.applicationId ===
                            props.discordApplicationId && (
                            <span
                              className="ml-1 inline-block"
                              title={t("createdByDiscohook")}
                            >
                              <CoolIcon
                                icon="Circle_Check"
                                className="text-blurple-500 dark:text-blurple-400"
                              />
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-500 text-xs">
                          #{gWebhook.channel?.name ?? "unknown"} •{" "}
                          {t(gWebhook.user ? "createdAtBy" : "createdAt", {
                            replace: {
                              createdAt: new Date(createdAt),
                              username: gWebhook.user?.name,
                            },
                          })}
                        </p>
                      </div>
                      <div className="ml-auto pl-2 my-auto">
                        <Button
                          disabled={
                            // TODO:
                            // - Make sure this prop is 100% accurate
                            // - Add obvious note for why it's disabled (or hide the entry entirely)
                            // !gWebhook.canAccessToken ||
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
                      </div>
                    </div>
                  );
                })}
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
              } else if ("message" in webhook) {
                setUrlError(webhook.message as string);
              }
            }}
          />
          {props.memberships && (
            <button
              className={twJoin(linkClassName, "text-sm")}
              onClick={() => setManualWebhook(false)}
              type="button"
            >
              {t("backToServerSelection")}
            </button>
          )}
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          <div className={`flex py-4 ${!webhook ? "animate-pulse" : ""}`}>
            <div className="w-1/3 mr-4 my-auto">
              {avatarUrl ? (
                <img
                  className="rounded-full h-24 w-24 m-auto"
                  src={avatarUrl}
                  alt={webhook?.name ?? "Webhook"}
                />
              ) : (
                <div className="rounded-full h-24 w-24 bg-gray-400 dark:bg-gray-600 m-auto" />
              )}
            </div>
            <div className="grow">
              {webhook ? (
                <>
                  <p className="font-bold text-xl">{webhook.name}</p>
                  <hr className="border border-gray-400 dark:border-gray-600 my-2" />
                  <p className="text-gray-500 hover:text-gray-700 dark:text-gray-500 hover:dark:text-gray-500 transition">
                    <Trans
                      t={t}
                      i18nKey="channelId"
                      components={[
                        <a
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
                  <p className="text-gray-500 hover:text-gray-700 dark:text-gray-500 hover:dark:text-gray-500 transition">
                    <Trans
                      t={t}
                      i18nKey="guildId"
                      components={[
                        <a
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
                  if (props.cache && webhook.guild_id) {
                    props.cache.fetchGuildCacheable(webhook.guild_id);
                  }
                  props.updateTargets({ [webhook.id]: webhook });
                  setOpen(false);
                }
              }}
            >
              {t("addWebhook")}
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
    </Modal>
  );
};
