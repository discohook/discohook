import {
  APIWebhook,
  ButtonStyle,
  ChannelType,
  MessageFlags,
} from "discord-api-types/v10";
import { Trans, useTranslation } from "react-i18next";
import AsyncSelect from "react-select/async";
import { twJoin } from "tailwind-merge";

import { Link } from "@remix-run/react";
import { MessageFlagsBitField } from "discord-bitflag";
import { TFunction } from "i18next";
import React from "react";
import { BRoutes, apiUrl } from "~/api/routing";
import { ButtonSelect } from "~/components/ButtonSelect";
import { ChannelSelect } from "~/components/ChannelSelect";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { NumberInput } from "~/components/NumberInput";
import { TextArea } from "~/components/TextArea";
import {
  AnonymousVariable,
  DraftFlow,
  FlowAction,
  FlowActionCheckFunction,
  FlowActionCheckFunctionType,
  FlowActionCreateThread,
  FlowActionSetVariable,
  FlowActionSetVariableType,
} from "~/store.server";
import { FlowActionType } from "~/types/flows";
import { CacheManager } from "~/util/cache/CacheManager";
import { cdnImgAttributes, webhookAvatarUrl } from "~/util/discord";
import { SafeFetcher, useSafeFetcher } from "~/util/loader";
import { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import {
  loader as ApiGetUserBackups,
  PartialBackupsWithMessages,
} from "../api/v1/users.@me.backups";
import { Button } from "../components/Button";
import { InfoBox } from "../components/InfoBox";
import { RoleSelect } from "../components/RoleSelect";
import { StringSelect, selectClassNames } from "../components/StringSelect";
import { TextInput } from "../components/TextInput";
import { CoolIcon } from "../components/icons/CoolIcon";
import { linkClassName, mentionStyle } from "../components/preview/Markdown";
import { Modal, ModalProps } from "./Modal";

type FlowWithPartials = DraftFlow & {
  actions: (Partial<FlowAction> & Pick<FlowAction, "type">)[];
};

export type EditingFlowData = {
  flow: DraftFlow;
  setFlow: (flow: DraftFlow) => void;
};

export const FlowEditModal = (
  props: ModalProps &
    Partial<EditingFlowData> & {
      guildId?: string;
      cache?: CacheManager;
      premium?: boolean;
    },
) => {
  const { t } = useTranslation();
  const { guildId, flow, setFlow, cache } = props;
  const [error, setError] = useError();

  const backupsFetcher = useSafeFetcher<typeof ApiGetUserBackups>({
    onError: setError,
  });
  const webhooksFetcher = useSafeFetcher<typeof ApiGetGuildWebhooks>({
    onError: setError,
  });

  const actionMax = props.premium ? 40 : 10;
  const flattenAction = (a: FlowAction): FlowAction[] =>
    a.type === 2
      ? [...(a.then ?? []), ...(a.else ?? [])].flatMap(flattenAction)
      : [a];
  const allActions = flow ? flow.actions.flatMap(flattenAction) : [];
  const counted = allActions.filter(
    (a) => a.type !== FlowActionType.Check && a.type !== FlowActionType.Stop,
  );

  return (
    <Modal title={t("editFlow")} {...props}>
      {error}
      {flow && setFlow && (
        <div className="-mt-2 -mx-2">
          {flow.actions.length > 0 && (
            <div className="space-y-2">
              {counted.length >= actionMax && (
                <InfoBox severity="yellow" icon="Circle_Warning">
                  <Trans
                    t={t}
                    i18nKey={
                      props.premium
                        ? "maxActionsWarningPremium"
                        : "maxActionsWarningFree"
                    }
                    values={{ limit: actionMax, premiumLimit: 40 }}
                    components={[
                      <Link
                        to="/donate"
                        className={linkClassName}
                        target="_blank"
                      />,
                    ]}
                  />
                </InfoBox>
              )}
              {flow.actions.map((action, ai) => (
                <FlowActionEditor
                  key={`edit-flow-action-${ai}`}
                  guildId={guildId}
                  flow={flow}
                  action={action}
                  actionIndex={ai}
                  update={() => setFlow(structuredClone(flow))}
                  backupsFetcher={backupsFetcher}
                  webhooksFetcher={webhooksFetcher}
                  cache={cache}
                  t={t}
                />
              ))}
            </div>
          )}
          <div className="w-full flex mt-4">
            <div className="mx-auto space-x-2 rtl:space-x-reverse">
              <Button
                onClick={() => {
                  flow.actions.push({ type: 0 });
                  setFlow(structuredClone(flow));
                }}
              >
                {t("addAction")}
              </Button>
              <Button
                discordstyle={ButtonStyle.Secondary}
                onClick={() => props.setOpen(false)}
              >
                {t("ok")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export const actionTypes = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
] satisfies FlowActionType[];

export const checkFunctionTypes = [
  0, 1, 3, 4, 5,
] satisfies FlowActionCheckFunctionType[];

const threadTypeOptions = [
  {
    label: "Public Thread",
    value: ChannelType.PublicThread,
  },
  {
    label: "Private Thread (text channels only)",
    value: ChannelType.PrivateThread,
  },
  // {
  //   label: "Announcement Thread",
  //   value: ChannelType.AnnouncementThread,
  // },
];

const threadAutoArchiveOptions: {
  label: string;
  value: FlowActionCreateThread["autoArchiveDuration"];
}[] = [
  {
    label: "1 hour",
    value: 60,
  },
  {
    label: "1 day",
    value: 1440,
  },
  {
    label: "3 days",
    value: 4320,
  },
  {
    label: "1 week",
    value: 10080,
  },
];

const varTypeOptions: {
  label: string;
  value: FlowActionSetVariableType;
}[] = [
  {
    label: "Static",
    value: 0,
  },
  {
    label: "Adaptive",
    value: 1,
  },
  {
    label: "Mirror",
    value: 2,
  },
];

const messageFlagOptions = [
  {
    label: "Hidden (ephemeral)",
    value: MessageFlags.Ephemeral,
  },
  {
    label: "Silent",
    value: MessageFlags.SuppressNotifications,
  },
  {
    label: "Suppress All Embeds",
    value: MessageFlags.SuppressEmbeds,
  },
];

const getBackupSelectOption = (backup: PartialBackupsWithMessages[number]) => ({
  label: (
    <div className="flex">
      {backup.previewImageUrl && (
        <div
          className="rounded-lg h-6 w-6 ltr:mr-1.5 rtl:ml-1.5 block bg-contain bg-center my-auto"
          style={{
            backgroundImage: `url(${backup.previewImageUrl})`,
          }}
        />
      )}
      <p className="my-auto">{backup.name}</p>
    </div>
  ),
  value: backup.id,
  backup,
});

const BackupSelect = ({
  fetcher,
  value,
  onChange,
}: {
  fetcher: SafeFetcher<typeof ApiGetUserBackups>;
  value?: PartialBackupsWithMessages[number];
  onChange: (backup: PartialBackupsWithMessages[number]) => void;
}) => {
  if (!fetcher.data && fetcher.state === "idle") {
    fetcher.load(apiUrl(BRoutes.currentUserBackups()));
  }
  return (
    <AsyncSelect
      isClearable={false}
      name="backupId"
      isDisabled={fetcher.state !== "idle"}
      aria-live="off"
      required
      value={value ? getBackupSelectOption(value) : ""}
      defaultOptions={
        fetcher.data ? fetcher.data.map(getBackupSelectOption) : []
      }
      loadOptions={(inputValue) =>
        (async () => {
          return fetcher.data
            ? fetcher.data
                .filter((backup) =>
                  backup.name.toLowerCase().includes(inputValue.toLowerCase()),
                )
                .map(getBackupSelectOption)
            : [];
        })()
      }
      className="w-full"
      classNames={selectClassNames}
      onChange={(raw) => {
        const opt = raw as ReturnType<typeof getBackupSelectOption>;
        onChange(opt.backup);
      }}
    />
  );
};

const getWebhookSelectOption = (
  webhook: Pick<APIWebhook, "id" | "name" | "avatar">,
) => ({
  label: (
    <div className="flex">
      <img
        {...cdnImgAttributes(32, (size) => webhookAvatarUrl(webhook, { size }))}
        className="rounded-lg h-6 w-6 ltr:mr-1.5 rtl:ml-1.5 my-auto"
        alt=""
      />
      <p className="my-auto">{webhook.name}</p>
    </div>
  ),
  value: webhook.id,
  webhook,
});

const FlowActionEditor: React.FC<{
  guildId?: string;
  flow: FlowWithPartials;
  action: FlowAction;
  actionIndex: number;
  update: () => void;
  webhooksFetcher: SafeFetcher<typeof ApiGetGuildWebhooks>;
  backupsFetcher: SafeFetcher<typeof ApiGetUserBackups>;
  t: TFunction;
  cache?: CacheManager;
  checkLevel?: number;
  premium?: boolean;
}> = ({
  guildId,
  flow,
  action,
  actionIndex: i,
  update,
  webhooksFetcher,
  backupsFetcher,
  t,
  cache,
  checkLevel,
  premium,
}) => {
  const previewText = t(`actionDescription.${action.type}`, {
    replace: { action },
    defaultValue: t(`actionType.${action.type}`),
  });
  const errors: string[] = []; // getActionErrors(embed);

  const roles = cache
    ? cache.role.getAll().sort((a, b) => b.position - a.position)
    : [];
  const channels = cache ? cache.channel.getAll() : [];

  const actionMax = premium ? 40 : 10;
  const localIndexMax = actionMax - 1;
  const flattenAction = (a: FlowAction): FlowAction[] =>
    a.type === 2
      ? [...(a.then ?? []), ...(a.else ?? [])].flatMap(flattenAction)
      : [a];
  const allActions = flow.actions.flatMap(flattenAction);
  const counted = allActions.filter(
    (a) => a.type !== FlowActionType.Check && a.type !== FlowActionType.Stop,
  );

  const absoluteI = allActions.indexOf(action);
  // const stopAction = allActions.find((a, subI): a is FlowActionStop => {
  //   return subI < absoluteI && a.type === 11;
  // });

  return (
    <div
      className={twJoin(
        "rounded-lg border shadow hover:shadow-lg p-4 transition",
        // action.type === 2
        //   ? "bg-red-500/10 hover:bg-red-500/15 border-red-500/30"
        "bg-blurple/10 hover:bg-blurple/15 border-blurple/30",
      )}
    >
      <div className="flex text-sm font-semibold select-none">
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="my-auto text-rose-600 dark:text-rose-400 ltr:mr-1.5 rtl:ml-1.5"
          />
        )}
        <span
          className={twJoin(
            "truncate",
            // stopAction ? "line-through" : undefined,
          )}
        >
          {t(previewText ? "actionNText" : "actionN", {
            replace: {
              n: i + 1,
              text: previewText,
            },
          })}
        </span>
        <div className="ltr:ml-auto rtl:mr-auto text-base space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
          <button
            type="button"
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              flow.actions.splice(i, 1);
              flow.actions.splice(i - 1, 0, action);
              update();
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={i === flow.actions.length - 1 ? "hidden" : ""}
            onClick={() => {
              flow.actions.splice(i, 1);
              flow.actions.splice(i + 1, 0, action);
              update();
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={flow.actions.length - 1 >= localIndexMax ? "hidden" : ""}
            onClick={() => {
              flow.actions.splice(i + 1, 0, structuredClone(action));
              update();
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              flow.actions.splice(i, 1);
              update();
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </div>
      <div>
        {errors.length > 0 && (
          <div className="-mt-1 mb-1">
            <InfoBox severity="red" icon="Circle_Warning">
              {errors.map((k) => t(k)).join("\n")}
            </InfoBox>
          </div>
        )}
        <div className="space-y-1">
          {action.type === 0 ? (
            <StringSelect
              name="type"
              label={t("actionTypeText")}
              options={actionTypes
                .filter(
                  (type) =>
                    (checkLevel !== undefined && checkLevel !== 0
                      ? type !== 2
                      : true) &&
                    (counted.length > actionMax && absoluteI >= actionMax
                      ? [2, 11].includes(type)
                      : true),
                )
                .map((value) => ({
                  label: t(`actionType.${value}`),
                  value,
                }))}
              value={{
                label: t(`actionType.${action.type}`),
                value: action.type,
              }}
              menuPortalTarget={document.body}
              onChange={(opt) => {
                const { value } = opt as { value: number };
                flow.actions.splice(i, 1, {
                  type: value,
                  ...(value === 1
                    ? { seconds: 1 }
                    : value === 2
                      ? { then: [], else: [] }
                      : {}),
                });
                update();
              }}
            />
          ) : action.type === 1 ? (
            <NumberInput
              min={1}
              max={60}
              value={action.seconds}
              onChange={(value) => {
                action.seconds = Number(value);
                update();
              }}
            />
          ) : action.type === 2 ? (
            <div>
              <CheckFunctionEditor
                t={t}
                function={action.function}
                setFunction={(f) => {
                  action.function = f;
                }}
                update={update}
                level={0}
              />
              <hr className="my-4 border-blurple/30" />
              <p className="text-sm">{t("checkFunctionThen")}</p>
              <div className="space-y-1">
                {(action.then ?? []).map((a, ai) => (
                  <FlowActionEditor
                    key={`edit-flow-action-${i}-then-${ai}`}
                    guildId={guildId}
                    flow={{ actions: action.then }}
                    action={a}
                    actionIndex={ai}
                    update={update}
                    webhooksFetcher={webhooksFetcher}
                    backupsFetcher={backupsFetcher}
                    cache={cache}
                    t={t}
                    checkLevel={(checkLevel ?? 0) + 1}
                  />
                ))}
              </div>
              <Button
                className="mt-1"
                onClick={() => {
                  action.then = action.then ?? [];
                  action.then.push({ type: 0 });
                  update();
                }}
              >
                {t("addAction")}
              </Button>
              <p className="text-sm mt-2">{t("checkFunctionElse")}</p>
              <div className="space-y-1">
                {(action.else ?? []).map((a, ai) => (
                  <FlowActionEditor
                    key={`edit-flow-action-${i}-else-${ai}`}
                    guildId={guildId}
                    flow={{ actions: action.else }}
                    action={a}
                    actionIndex={ai}
                    update={update}
                    webhooksFetcher={webhooksFetcher}
                    backupsFetcher={backupsFetcher}
                    cache={cache}
                    t={t}
                    checkLevel={(checkLevel ?? 0) + 1}
                  />
                ))}
              </div>
              <Button
                className="mt-1"
                onClick={() => {
                  action.else = action.else ?? [];
                  action.else.push({ type: 0 });
                  update();
                }}
              >
                {t("addAction")}
              </Button>
            </div>
          ) : action.type === 3 || action.type === 4 || action.type === 5 ? (
            <>
              {roles.length === 0 && (
                <InfoBox severity="yellow" icon="Info">
                  {t("noMentionsActionNote")}
                </InfoBox>
              )}
              <p className="text-sm font-medium select-none">{t("role")}</p>
              <RoleSelect
                name="roleId"
                roles={roles}
                value={roles.find((r) => r.id === action.roleId)}
                onChange={(opt) => {
                  if (opt) {
                    action.roleId = opt.id;
                    update();
                  }
                }}
                unassignable="omit"
                guildId={guildId}
              />
              {/* <TextArea label="Reason" maxLength={512} className="w-full" /> */}
            </>
          ) : action.type === 6 ? (
            (() => {
              const selected = backupsFetcher.data?.find(
                (b) => b.id === action.backupId,
              );
              const messageOptions = [
                ...(selected
                  ? selected.data.messages.map((msg, i) => ({
                      label: (
                        <span className="block truncate">
                          {i + 1}. {msg.text ?? "no content"}
                        </span>
                      ),
                      value: i,
                    }))
                  : []),
                {
                  label: t("random"),
                  value: null,
                },
              ];
              const flags = new MessageFlagsBitField(action.flags ?? 0);
              return (
                <>
                  <p className="text-sm">
                    <Trans
                      t={t}
                      i18nKey="messageActionGuideNote"
                      components={[
                        <Link
                          to="/guide/recipes/message-buttons"
                          target="_blank"
                          className={linkClassName}
                        />,
                      ]}
                    />
                  </p>
                  <div>
                    <p className="text-sm select-none">{t("backup")}</p>
                    <div className="flex">
                      <BackupSelect
                        fetcher={backupsFetcher}
                        value={selected}
                        onChange={(backup) => {
                          action.backupId = backup.id;
                          action.backupMessageIndex = 0;
                          update();
                        }}
                      />
                      <Button
                        className="ltr:ml-2 rtl:mr-2 my-auto"
                        onClick={() =>
                          backupsFetcher.load(
                            apiUrl(BRoutes.currentUserBackups()),
                          )
                        }
                        disabled={backupsFetcher.state !== "idle"}
                        discordstyle={ButtonStyle.Secondary}
                      >
                        <CoolIcon icon="Redo" />
                      </Button>
                    </div>
                  </div>
                  {
                    // incl. the random option
                    messageOptions.length > 2 && (
                      <StringSelect
                        name="backupMessageIndex"
                        label={t("message")}
                        required
                        options={messageOptions}
                        value={
                          messageOptions.find(
                            (o) => o.value === action.backupMessageIndex,
                          ) ?? ""
                        }
                        isDisabled={
                          !selected || selected.data.messages.length <= 1
                        }
                        onChange={(raw) => {
                          const opt = raw as {
                            label: string;
                            value: number | null;
                          } | null;
                          if (opt) {
                            action.backupMessageIndex = opt.value;
                            update();
                          }
                        }}
                      />
                    )
                  }
                  <div>
                    <p className="text-sm font-medium">{t("flags")}</p>
                    <Checkbox
                      label={t(`messageFlag.${MessageFlags.Ephemeral}`)}
                      checked={flags.has(MessageFlags.Ephemeral)}
                      onChange={({ currentTarget }) => {
                        currentTarget.checked
                          ? flags.add(MessageFlags.Ephemeral)
                          : flags.remove(MessageFlags.Ephemeral);

                        action.flags = Number(flags.value) || undefined;
                        update();
                      }}
                    />
                  </div>
                </>
              );
            })()
          ) : action.type === 7 ? (
            (() => {
              const selected = backupsFetcher.data?.find(
                (b) => b.id === action.backupId,
              );
              const messageOptions = [
                ...(selected
                  ? selected.data.messages.map((msg, i) => ({
                      label: (
                        <span className="block truncate">
                          {i + 1}. {msg.text ?? "no content"}
                        </span>
                      ),
                      value: i,
                    }))
                  : []),
                {
                  label: t("random"),
                  value: null,
                },
              ];

              const selectedWebhook = webhooksFetcher.data?.find(
                (w) => w.id === action.webhookId,
              );

              return (
                <>
                  <p className="text-sm">
                    <Trans
                      t={t}
                      i18nKey="messageActionGuideNote"
                      components={[
                        <Link
                          to="/guide/recipes/message-buttons"
                          target="_blank"
                          className={linkClassName}
                        />,
                      ]}
                    />
                  </p>
                  <div>
                    <p className="text-sm select-none">{t("webhook")}</p>
                    <div className="flex">
                      {(() => {
                        if (
                          !webhooksFetcher.data &&
                          webhooksFetcher.state === "idle" &&
                          guildId
                        ) {
                          webhooksFetcher.load(
                            apiUrl(BRoutes.guildWebhooks(guildId)),
                          );
                        }
                        return (
                          <AsyncSelect
                            isClearable={false}
                            isDisabled={
                              !guildId || webhooksFetcher.state !== "idle"
                            }
                            name="webhookId"
                            aria-live="off"
                            required
                            value={
                              selectedWebhook
                                ? getWebhookSelectOption(selectedWebhook)
                                : ""
                            }
                            defaultOptions={
                              webhooksFetcher.data
                                ? webhooksFetcher.data.map(
                                    getWebhookSelectOption,
                                  )
                                : []
                            }
                            loadOptions={(inputValue) =>
                              (async () => {
                                if (!guildId) return [];

                                return webhooksFetcher.data
                                  ? webhooksFetcher.data
                                      .filter((webhook) =>
                                        webhook.name
                                          .toLowerCase()
                                          .includes(inputValue.toLowerCase()),
                                      )
                                      .map(getWebhookSelectOption)
                                  : [];
                              })()
                            }
                            className="w-full"
                            classNames={selectClassNames}
                            onChange={(raw) => {
                              const opt = raw as ReturnType<
                                typeof getWebhookSelectOption
                              >;
                              action.webhookId = opt.webhook.id;
                              update();
                            }}
                          />
                        );
                      })()}
                      <Button
                        className="ltr:ml-2 rtl:mr-2 my-auto"
                        onClick={() => {
                          if (!guildId) return;
                          webhooksFetcher.load(
                            apiUrl(BRoutes.guildWebhooks(guildId)),
                          );
                        }}
                        disabled={!guildId || webhooksFetcher.state !== "idle"}
                        discordstyle={ButtonStyle.Secondary}
                      >
                        <CoolIcon icon="Redo" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm select-none">{t("backup")}</p>
                    <div className="flex">
                      <BackupSelect
                        fetcher={backupsFetcher}
                        value={backupsFetcher.data?.find(
                          (b) => b.id === action.backupId,
                        )}
                        onChange={(backup) => {
                          action.backupId = backup.id;
                          update();
                        }}
                      />
                      <Button
                        className="ltr:ml-2 rtl:mr-2 my-auto"
                        onClick={() =>
                          backupsFetcher.load(
                            apiUrl(BRoutes.currentUserBackups()),
                          )
                        }
                        disabled={backupsFetcher.state !== "idle"}
                        discordstyle={ButtonStyle.Secondary}
                      >
                        <CoolIcon icon="Redo" />
                      </Button>
                    </div>
                  </div>
                  {
                    // incl. the random option
                    messageOptions.length > 2 && (
                      <StringSelect
                        name="backupMessageIndex"
                        label={t("message")}
                        required
                        options={messageOptions}
                        value={
                          messageOptions.find(
                            (o) => o.value === action.backupMessageIndex,
                          ) ?? ""
                        }
                        isDisabled={
                          !selected || selected.data.messages.length <= 1
                        }
                        onChange={(raw) => {
                          const opt = raw as {
                            label: string;
                            value: number | null;
                          } | null;
                          if (opt) {
                            action.backupMessageIndex = opt.value;
                            update();
                          }
                        }}
                      />
                    )
                  }
                </>
              );
            })()
          ) : action.type === 8 ? (
            (() => {
              const channel = channels.find(
                (c) => c.id === action.channel?.value,
              );
              return (
                <>
                  {channels.length === 0 && (
                    <InfoBox severity="yellow" icon="Info">
                      {t("noMentionsActionNote")}
                    </InfoBox>
                  )}
                  <div>
                    <p className="text-sm select-none">{t("channel")}</p>
                    <ChannelSelect
                      name="channelId"
                      channels={channels.filter((c) =>
                        ["text", "forum"].includes(c.type),
                      )}
                      value={channel}
                      onChange={(c) => {
                        if (c) {
                          action.channel = { value: c.id };
                          if (c.type === "forum") {
                            action.threadType = ChannelType.PublicThread;
                          }
                          update();
                        }
                      }}
                    />
                  </div>
                  <TextInput
                    name="name"
                    label={t("name")}
                    className="w-full"
                    value={action.name}
                    maxLength={100}
                    onChange={(e) => {
                      action.name = e.currentTarget.value;
                      update();
                    }}
                  />
                  {(!channel || channel.type !== "forum") && (
                    <StringSelect
                      name="threadType"
                      label={t("type")}
                      required
                      options={threadTypeOptions}
                      value={
                        threadTypeOptions.find(
                          (o) => o.value === action.threadType,
                        ) ?? ""
                      }
                      onChange={(raw) => {
                        const opt = raw as {
                          value: (typeof action)["threadType"];
                        } | null;
                        action.threadType = opt?.value;
                        update();
                      }}
                    />
                  )}
                  <StringSelect
                    name="autoArchiveDuration"
                    label={t("autoArchiveDuration")}
                    options={threadAutoArchiveOptions}
                    value={
                      threadAutoArchiveOptions.find(
                        (o) => o.value === action.autoArchiveDuration,
                      ) ?? ""
                    }
                    onChange={(raw) => {
                      const opt = raw as {
                        value: (typeof action)["autoArchiveDuration"];
                      } | null;
                      action.autoArchiveDuration = opt?.value;
                      update();
                    }}
                  />
                  {channel?.type === "forum" && (
                    <StringSelect
                      name="appliedTags"
                      label="Tags"
                      options={[]}
                    />
                  )}
                </>
              );
            })()
          ) : action.type === 9 ? (
            <FlowActionSetVariableEditor
              t={t}
              action={action}
              update={update}
            />
          ) : action.type === 10 ? (
            (() => {
              const varAction = allActions.find(
                (a, subI): a is FlowActionSetVariable => {
                  return (
                    subI < absoluteI && a.type === 9 && a.name === "messageId"
                  );
                },
              );
              return (
                <p className="text-sm">
                  <Trans
                    t={t}
                    i18nKey={`deleteMessageIdNote.${!!varAction}`}
                    components={[
                      varAction ? (
                        <CoolIcon
                          icon="Circle_Check"
                          className="text-green-400"
                        />
                      ) : (
                        <CoolIcon
                          icon="Close_Circle"
                          className="text-red-400"
                        />
                      ),
                      <span className={twJoin(mentionStyle, "font-code")} />,
                    ]}
                    values={{
                      value: varAction?.value,
                    }}
                  />
                </p>
              );
            })()
          ) : action.type === 11 ? (
            <>
              <p className="text-sm">
                <Trans
                  t={t}
                  i18nKey="stopMessageNote"
                  components={[
                    <Link
                      to="/guide/getting-started/formatting"
                      className={linkClassName}
                      target="_blank"
                    />,
                  ]}
                />
              </p>
              <TextArea
                name="content"
                label={t("contentOptional")}
                className="w-full"
                maxLength={2000}
                value={action.message?.content ?? ""}
                onChange={(e) => {
                  action.message = action.message ?? {};
                  action.message.content = e.currentTarget.value;

                  if (
                    !action.message.content?.trim() &&
                    !action.message.flags
                  ) {
                    action.message = undefined;
                  }

                  update();
                }}
              />
              <div>
                <p className="text-sm font-medium">{t("flagsOptional")}</p>
                <div className="space-y-0.5">
                  {[
                    MessageFlags.Ephemeral,
                    MessageFlags.SuppressNotifications,
                    MessageFlags.SuppressEmbeds,
                  ].map((flag) => {
                    const flags = new MessageFlagsBitField(
                      action.message?.flags ?? 0,
                    );
                    return (
                      <Checkbox
                        key={`edit-flow-action-${i}-${action.type}-flag-${flag}`}
                        label={t(`messageFlag.${flag}`)}
                        checked={flags.has(flag)}
                        onChange={({ currentTarget }) => {
                          currentTarget.checked
                            ? flags.add(flag)
                            : flags.remove(flag);

                          action.message = action.message ?? {};
                          action.message.flags =
                            Number(flags.value) || undefined;
                          if (
                            !action.message.content?.trim() &&
                            !action.message.flags
                          ) {
                            action.message = undefined;
                          }

                          update();
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            t("actionTypeUnsupported")
          )}
        </div>
      </div>
    </div>
  );
};

const FlowActionSetVariableEditor: React.FC<{
  t: TFunction;
  action: FlowActionSetVariable | AnonymousVariable;
  update: () => void;
  anonymous?: boolean;
  flex?: boolean;
}> = ({ t, action, update, anonymous, flex }) => {
  return (
    <div className={twJoin("flex gap-1", flex ? "flex-row" : "flex-col")}>
      <div className={twJoin(flex ? "w-1/3" : "contents")}>
        <StringSelect
          name="varType"
          label={t("type")}
          options={varTypeOptions}
          value={
            varTypeOptions.find((o) => o.value === action.varType) ??
            varTypeOptions[0]
          }
          onChange={(opt) => {
            action.varType = opt
              ? (opt as { value: FlowActionSetVariableType }).value
              : undefined;
            update();
          }}
        />
      </div>
      {!anonymous && (
        <div className={twJoin(flex ? "w-1/3" : "contents")}>
          <TextInput
            name="name"
            label={t("name")}
            className={"w-full font-code"}
            maxLength={100}
            value={"name" in action ? action.name : ""}
            onChange={(e) => {
              // @ts-expect-error
              action.name = e.currentTarget.value;
              update();
            }}
          />
        </div>
      )}
      <div
        className={twJoin(flex ? (anonymous ? "w-2/3" : "w-1/3") : "contents")}
      >
        <TextInput
          name="value"
          label={t(
            action.varType === 1
              ? "valueFromReturn"
              : action.varType === 2
                ? "valueMirrorVariable"
                : "value",
          )}
          className={twJoin(
            "w-full",
            action.varType !== 0 ? "font-code" : undefined,
          )}
          maxLength={
            action.varType === 1 ? 30 : action.varType === 2 ? 100 : 500
          }
          value={String(action.value ?? "")}
          onChange={({ currentTarget }) => {
            const v = currentTarget.value;
            if (["true", "false"].includes(v) && action.varType !== 1) {
              action.value = v === "true";
            } else {
              action.value = currentTarget.value;
            }
            update();
          }}
        />
      </div>
    </div>
  );
};

const checkFunctionSeed = (
  type: FlowActionCheckFunctionType,
): FlowActionCheckFunction =>
  type === 0 || type === 1 || type === 3
    ? { type, conditions: [] }
    : type === 4
      ? {
          type,
          array: { value: "" },
          element: { value: "" },
        }
      : type === 5
        ? {
            type,
            a: { value: "" },
            b: { value: "" },
          }
        : ({ type } as unknown as FlowActionCheckFunction);

const CheckFunctionEditor: React.FC<{
  t: TFunction;
  function: FlowActionCheckFunction;
  setFunction: (func: FlowActionCheckFunction) => void;
  remove?: () => void;
  update: () => void;
  level: number;
}> = ({ t, function: func, setFunction, remove, update, level }) => {
  return (
    <>
      {level > 0 && (
        <div className="flex -mb-5">
          <div className="ltr:ml-auto rtl:mr-auto text-base space-x-2.5 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => {
                if (remove) remove();
                update();
              }}
            >
              <CoolIcon icon="Trash_Full" />
            </button>
          </div>
        </div>
      )}
      <StringSelect
        name="functionType"
        label={t("checkFunctionTypeText")}
        options={checkFunctionTypes
          // Max recursion. Could definitely be increased in the future
          .filter(level >= 5 ? (t) => ![0, 1, 3].includes(t) : () => true)
          .map((value) => ({
            label: t(`checkFunctionType.${value}`),
            value,
          }))}
        value={
          func
            ? {
                label: t(`checkFunctionType.${func.type}`),
                value: func.type,
              }
            : { value: "" }
        }
        required
        menuPortalTarget={document.body}
        onChange={(opt) => {
          const { value } = opt as {
            value: FlowActionCheckFunctionType;
          };
          setFunction(checkFunctionSeed(value));
          update();
        }}
      />
      {!!func &&
        (func.type === 0 || func.type === 1 || func.type === 3 ? (
          <div>
            {func.conditions.map((condition, i) => (
              <div
                key={`flow-action-check-${condition.type}-${i}`}
                className="rounded-lg p-2 mt-2 bg-blurple/10 hover:bg-blurple/15 border border-blurple/30"
              >
                <CheckFunctionEditor
                  t={t}
                  function={condition}
                  setFunction={(f) => func.conditions.splice(i, 1, f)}
                  remove={() => func.conditions.splice(i, 1)}
                  update={update}
                  level={level + 1}
                />
              </div>
            ))}
            <ButtonSelect
              className="mt-2"
              options={checkFunctionTypes
                // Max recursion, see above
                .filter(level >= 4 ? (t) => ![0, 1, 3].includes(t) : () => true)
                .map((value) => ({
                  label: t(`checkFunctionType.${value}`),
                  value,
                }))}
              onChange={(opt) => {
                func.conditions.push(
                  checkFunctionSeed(
                    (opt as { value: FlowActionCheckFunctionType }).value,
                  ),
                );
                update();
              }}
            >
              {t("addCondition")}
            </ButtonSelect>
          </div>
        ) : func.type === 4 ? (
          <div className="mt-2">
            <p className="text-sm">{t("checkInElement")}</p>
            <FlowActionSetVariableEditor
              t={t}
              action={func.element}
              update={update}
              anonymous
              flex
            />
            <p className="mt-2 text-sm">{t("checkInArray")}</p>
            <FlowActionSetVariableEditor
              t={t}
              action={func.array}
              update={update}
              anonymous
              flex
            />
          </div>
        ) : func.type === 5 ? (
          <div className="mt-2">
            <p className="text-sm">{t("checkEqualA")}</p>
            <FlowActionSetVariableEditor
              t={t}
              action={func.a}
              update={update}
              anonymous
              flex
            />
            <p className="mt-2 text-sm">{t("checkEqualB")}</p>
            <FlowActionSetVariableEditor
              t={t}
              action={func.b}
              update={update}
              anonymous
              flex
            />
          </div>
        ) : (
          <></>
        ))}
    </>
  );
};
