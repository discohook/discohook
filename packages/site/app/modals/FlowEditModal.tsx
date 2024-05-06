import { ChannelType, MessageFlags } from "discord-api-types/v10";
import { Trans, useTranslation } from "react-i18next";
import AsyncSelect from "react-select/async";
import { twJoin } from "tailwind-merge";

import { MessageFlagsBitField } from "discord-bitflag";
import { ChannelSelect } from "~/components/ChannelSelect";
import { useError } from "~/components/Error";
import {
  Flow,
  FlowAction,
  FlowActionCreateThread,
  FlowActionSetVariableType,
  FlowActionType,
} from "~/store.server";
import { CacheManager } from "~/util/cache/CacheManager";
import { SafeFetcher, useSafeFetcher } from "~/util/loader";
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
import { mentionStyle } from "../components/preview/Markdown";
import { Modal, ModalProps } from "./Modal";

type FlowWithPartials = Flow & {
  actions: (Partial<FlowAction> & Pick<FlowAction, "type">)[];
};

export type EditingFlowData = {
  flow: Flow;
  setFlow: (flow: Flow) => void;
};

export const FlowEditModal = (
  props: ModalProps &
    Partial<EditingFlowData> & {
      cache?: CacheManager;
    },
) => {
  const { t } = useTranslation();
  const { flow, setFlow, cache } = props;
  const [error, setError] = useError();

  const backupsFetcher = useSafeFetcher<typeof ApiGetUserBackups>({
    onError: (e) => setError({ message: e.message }),
  });
  // FetcherSelect that is basically just async select but it turns a fetcher into promise-based

  return (
    <Modal title={t("editFlow")} {...props}>
      {error}
      {flow && setFlow && (
        <div className="-mt-2 -mx-2">
          {flow.actions.length > 0 && (
            <div className="space-y-2">
              {flow.actions.length === 10 && (
                <InfoBox severity="yellow" icon="Circle_Warning">
                  <Trans count={flow.actions.length}>
                    Warning about action count limit for non-premium users
                  </Trans>
                </InfoBox>
              )}
              {flow.actions.map((action, ai) => (
                <FlowActionEditor
                  key={`edit-flow-action-${ai}`}
                  flow={flow}
                  action={action}
                  actionIndex={ai}
                  update={() => {
                    setFlow(structuredClone(flow));
                  }}
                  backupsFetcher={backupsFetcher}
                  cache={cache}
                />
              ))}
            </div>
          )}
          <div className="w-full flex mt-4">
            <Button
              className="mx-auto"
              onClick={() => {
                flow.actions.push({ type: 0 });
                setFlow(structuredClone(flow));
              }}
              disabled={flow.actions.length >= 10}
            >
              {t("addAction")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export const actionTypes = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
] satisfies FlowActionType[];

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
];

const messageFlagOptions = [
  {
    label: "Ephemeral (hidden)",
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
          className="rounded-lg h-6 w-6 mr-1.5 block bg-contain bg-center my-auto"
          style={{
            backgroundImage: `url(${backup.previewImageUrl})`,
          }}
        />
      )}
      <p className="my-auto">{backup.name}</p>
    </div>
  ),
  value: backup.name,
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
  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      isClearable={false}
      name="backupId"
      required
      value={value ? getBackupSelectOption(value) : null}
      loadOptions={(inputValue) =>
        (async () => {
          const data =
            fetcher.data ??
            (await fetcher.loadAsync("/api/v1/users/@me/backups"));
          return data
            .filter((backup) =>
              backup.name.toLowerCase().includes(inputValue.toLowerCase()),
            )
            .map(getBackupSelectOption);
        })()
      }
      classNames={selectClassNames}
      onChange={(raw) => {
        const opt = raw as ReturnType<typeof getBackupSelectOption>;
        onChange(opt.backup);
      }}
    />
  );
};

const FlowActionEditor: React.FC<{
  flow: FlowWithPartials;
  action: FlowAction;
  actionIndex: number;
  update: () => void;
  backupsFetcher: SafeFetcher<typeof ApiGetUserBackups>;
  cache?: CacheManager;
}> = ({ flow, action, actionIndex: i, update, backupsFetcher, cache }) => {
  const { t } = useTranslation();

  const localIndexMax = 9;
  const previewText = t(`actionDescription.${action.type}`, {
    replace: { action },
    defaultValue: t(`actionType.${action.type}`),
  });
  const errors: string[] = []; // getActionErrors(embed);

  const roles = cache
    ? cache.role.getAll().sort((a, b) => b.position - a.position)
    : [];
  const channels = cache ? cache.channel.getAll() : [];

  return (
    <div className="rounded-lg bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg p-4 transition">
      <div className="flex text-sm font-semibold select-none">
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="my-auto text-rose-600 dark:text-rose-400 ltr:mr-1.5 rtl:ml-1.5"
          />
        )}
        <span className="truncate">
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
                .filter((v) => v !== 2)
                .map((value) => ({ label: t(`actionType.${value}`), value }))}
              defaultValue={{
                label: t("actionType.0"),
                value: 0,
              }}
              menuPortalTarget={document.body}
              onChange={(opt) => {
                const { value } = opt as { value: number };
                flow.actions.splice(i, 1, {
                  type: value,
                  ...(value === 1 ? { seconds: 1 } : {}),
                });
                update();
              }}
            />
          ) : action.type === 1 ? (
            <TextInput
              label={t("seconds")}
              type="number"
              min={1}
              max={60}
              className="w-full"
              value={action.seconds}
              onChange={(e) => {
                // action.seconds = Math.max(
                //   Math.min(Number(e.currentTarget.value), 1),
                //   60,
                // );
                action.seconds = Number(e.currentTarget.value);
                update();
              }}
            />
          ) : action.type === 3 || action.type === 4 || action.type === 5 ? (
            <>
              {(!cache || roles.length === 0) && (
                <InfoBox severity="yellow" icon="Info">
                  {t("noRolesNote")}
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
                      label: `${i + 1}. ${msg.text ?? "no content"}`,
                      value: i,
                    }))
                  : []),
                {
                  label: t("random"),
                  value: null,
                },
              ];
              return (
                <>
                  <div>
                    <p className="text-sm select-none">{t("backup")}</p>
                    <BackupSelect
                      fetcher={backupsFetcher}
                      value={selected}
                      onChange={(backup) => {
                        action.backupId = backup.id;
                        update();
                      }}
                    />
                  </div>
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
                  <StringSelect
                    name="flags"
                    label={t("flagsOptional")}
                    isMulti
                    isClearable
                    options={[
                      {
                        label: "Ephemeral (hidden)",
                        value: MessageFlags.Ephemeral,
                      },
                    ]}
                    value={messageFlagOptions.filter((o) =>
                      new MessageFlagsBitField(action.flags ?? 0).has(o.value),
                    )}
                    onChange={(raw) => {
                      const opts = raw as typeof messageFlagOptions;
                      action.flags =
                        Number(
                          opts.reduce(
                            (prev, cur) => prev.add(cur.value),
                            new MessageFlagsBitField(),
                          ).value,
                        ) || undefined;
                      update();
                    }}
                  />
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
                      label: `${i + 1}. ${msg.text ?? "no content"}`,
                      value: i,
                    }))
                  : []),
                {
                  label: t("random"),
                  value: null,
                },
              ];
              return (
                <>
                  <StringSelect name="webhookId" label="Webhook" options={[]} />
                  <div>
                    <p className="text-sm select-none">{t("backup")}</p>
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
                  </div>
                  <StringSelect
                    name="backupMessageIndex"
                    label={t("message")}
                    required
                    options={messageOptions}
                    value={
                      messageOptions.find(
                        (o) => o.value === action.backupMessageIndex,
                      ) ?? null
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
                </>
              );
            })()
          ) : action.type === 8 ? (
            (() => {
              const channel = channels.find((c) => c.id === action.channelId);
              return (
                <>
                  {(!cache || channels.length === 0) && (
                    <InfoBox severity="yellow" icon="Info">
                      {t("noRolesNote")}
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
                          action.channelId = c.id;
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
                      value={threadTypeOptions.find(
                        (o) => o.value === action.threadType,
                      )}
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
                    value={threadAutoArchiveOptions.find(
                      (o) => o.value === action.autoArchiveDuration,
                    )}
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
            <>
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
              <TextInput
                name="name"
                label={t("name")}
                className="w-full"
                maxLength={100}
                value={action.name}
                onChange={(e) => {
                  action.name = e.currentTarget.value;
                  update();
                }}
              />
              <TextInput
                name="value"
                label={t(action.varType === 1 ? "valueFromReturn" : "value")}
                className="w-full"
                maxLength={action.varType === 1 ? 30 : 500}
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
            </>
          ) : action.type === 10 ? (
            <>
              <p className="text-sm">
                <Trans
                  t={t}
                  i18nKey="deleteMessageIdNote"
                  components={[
                    <span className={twJoin(mentionStyle, "font-code")} />,
                  ]}
                />
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
