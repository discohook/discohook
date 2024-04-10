import { Link } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { getDate } from "discord-snowflake";
import { ReactNode, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import AsyncSelect from "react-select/async";
import { twJoin } from "tailwind-merge";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { selectClassNames } from "~/components/StringSelect";
import { TextInput } from "~/components/TextInput";
import { linkClassName } from "~/components/preview/Markdown";
import { LoadedMembership } from "~/routes/_index";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { cdn, getSnowflakeDate, getWebhook } from "~/util/discord";
import { useSafeFetcher } from "~/util/loader";
import { randomString } from "~/util/text";
import type { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import type { loader as ApiGetGuildWebhookToken } from "../api/v1/guilds.$guildId.webhooks.$webhookId.token";
import { Modal, ModalProps } from "./Modal";

export const TargetAddModal = (
  props: ModalProps & {
    updateTargets: React.Dispatch<Partial<Record<string, APIWebhook>>>;
    memberships?: Promise<LoadedMembership[]>;
  },
) => {
  const { t } = useTranslation();
  const [webhook, setWebhook] = useState<APIWebhook>();
  const [urlError, setUrlError] = useState<ReactNode>();
  const [manualWebhook, setManualWebhook] = useState(false);

  const [error, setError] = useError(t);
  const [guildId, setGuildId] = useState<string>();
  const guildWebhooksFetcher = useSafeFetcher<typeof ApiGetGuildWebhooks>({
    onError(e) {
      setError({ message: e.message });
    },
  });
  const guildWebhookTokenFetcher = useSafeFetcher<
    typeof ApiGetGuildWebhookToken
  >({
    onError(e) {
      setError({ message: e.message });
    },
  });

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
          } else if ("message" in webhook) {
            setError({ message: webhook.message as string });
          }
        });
      }
    }
  }, [guildWebhookTokenFetcher, webhook, props.updateTargets]);

  const avatarUrl = webhook
    ? webhook.avatar
      ? cdn.avatar(webhook.id, webhook.avatar, { size: 128 })
      : cdn.defaultAvatar(5)
    : null;

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
      props.updateTargets({ [result.id]: result });
      setOpen(false);
    };
  }, [webhook, setOpen, props.updateTargets]);

  return (
    <Modal title={t("addWebhook")} {...props} setOpen={setOpen}>
      {props.memberships && !manualWebhook ? (
        <div>
          {error}
          <p className="text-sm">Choose a server</p>
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={(inputValue) =>
              (async () =>
                // biome-ignore lint/style/noNonNullAssertion: Must not be null to arrive at this point
                (await props.memberships)!
                  .filter(({ guild }) =>
                    guild.name.toLowerCase().includes(inputValue.toLowerCase()),
                  )
                  .map(({ guild }) => ({
                    label: (
                      <>
                        {guild.icon && (
                          <img
                            src={cdn.icon(String(guild.id), guild.icon)}
                            alt=""
                            className="rounded-lg h-6 w-6 mr-1.5 inline-block"
                          />
                        )}
                        <span className="align-middle">{guild.name}</span>
                      </>
                    ),
                    value: String(guild.id),
                  })))()
            }
            classNames={selectClassNames}
            onChange={(raw) => {
              const opt = raw as { label: string; value: string };
              if (guildId && opt.value !== guildId) {
                guildWebhooksFetcher.reset();
              }
              setError(undefined);
              guildWebhooksFetcher.load(
                apiUrl(BRoutes.guildWebhooks(opt.value)),
              );
              setGuildId(opt.value);
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
                        className="rounded-full my-auto w-8 h-8 mr-3"
                        src={
                          gWebhook.avatar
                            ? cdn.avatar(gWebhook.id, gWebhook.avatar, {
                                size: 64,
                              })
                            : cdn.defaultAvatar(5)
                        }
                        alt={gWebhook.name}
                      />
                      <div className="truncate my-auto">
                        <div className="flex max-w-full">
                          <p className="font-semibold truncate dark:text-primary-230 text-base">
                            {gWebhook.name}
                          </p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-500 text-xs">
                          {t(gWebhook.user ? "createdAtBy" : "createdAt", {
                            replace: {
                              createdAt: new Date(
                                createdAt,
                              ).toLocaleDateString(),
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
              Back to server selection
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
                  <p>
                    {t("createdAtBy", {
                      replace: {
                        createdAt: getSnowflakeDate(
                          webhook.id,
                        ).toLocaleDateString(),
                        username: webhook?.user
                          ? webhook.user.username
                          : t("someone"),
                      },
                    })}
                  </p>
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
        <div className="mx-auto space-x-2">
          {!props.memberships ||
            (manualWebhook && (
              <Button
                disabled={!webhook}
                onClick={() => {
                  if (webhook) {
                    props.updateTargets({ [webhook.id]: webhook });
                    setOpen(false);
                  }
                }}
              >
                {t("addWebhook")}
              </Button>
            ))}
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
