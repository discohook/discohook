import { NumberField } from "@base-ui-components/react/number-field";
import { Switch } from "@base-ui-components/react/switch";
import { Link } from "@remix-run/react";
import {
  type APIWebhook,
  ButtonStyle,
  ChannelType,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import type React from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import { ButtonSelect } from "~/components/ButtonSelect";
import { ChannelSelect } from "~/components/ChannelSelect";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { switchStyles } from "~/components/switch";
import { TextArea } from "~/components/TextArea";
import type {
  AnonymousVariable,
  DraftFlow,
  FlowAction,
  FlowActionCheckFunction,
  FlowActionCreateThread,
  FlowActionSetVariable,
  TriggerEvent,
} from "~/store.server";
import {
  FlowActionCheckFunctionType,
  FlowActionSetVariableType,
  FlowActionType,
  ZodDraftFlow,
} from "~/types/flows";
import type { TFunction } from "~/types/i18next";
import type {
  CacheManager,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { cdnImgAttributes, webhookAvatarUrl } from "~/util/discord";
import {
  getZodErrorMessage,
  type SafeFetcher,
  useSafeFetcher,
} from "~/util/loader";
import { randomString } from "~/util/text";
import type { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import type {
  loader as ApiGetUserBackups,
  PartialBackupsWithMessages,
} from "../api/v1/users.@me.backups";
import { Button } from "../components/Button";
import { InfoBox } from "../components/InfoBox";
import { CoolIcon } from "../components/icons/CoolIcon";
import { linkClassName, mentionStyle } from "../components/preview/Markdown";
import { RoleSelect } from "../components/RoleSelect";
import {
  SimpleCombobox,
  SimpleStringSelect,
  StringSelect,
} from "../components/StringSelect";
import { TextInput } from "../components/TextInput";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

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
      parentContext?: FlowParentContext;
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
  const hasMaxActions = counted.length >= actionMax;

  const parsed = ZodDraftFlow.safeParse(flow);

  return (
    <Modal {...props}>
      <PlainModalHeader onClose={() => props.setOpen(false)}>
        {t("editFlow")}
      </PlainModalHeader>
      {!parsed.success && flow && flow.actions.length !== 0 && (
        <div className="-mx-2">
          <InfoBox severity="yellow" icon="Info" collapsible open>
            {getZodErrorMessage(parsed.error)}
            <br />
            {t("flowParseNotice")}
          </InfoBox>
        </div>
      )}
      {error}
      {flow && setFlow && (
        <div className="-mt-2">
          <div className="-mx-2">
            {flow.actions.length > 0 && (
              <div className="space-y-2">
                {hasMaxActions && (
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
                          key="0"
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
                    t={t}
                    key={`edit-flow-action-${ai}`}
                    guildId={guildId}
                    flow={flow}
                    action={action}
                    actionIndex={ai}
                    update={() => setFlow(structuredClone(flow))}
                    backupsFetcher={backupsFetcher}
                    webhooksFetcher={webhooksFetcher}
                    cache={cache}
                    premium={props.premium}
                    parentContext={props.parentContext}
                  />
                ))}
              </div>
            )}
            {flow.actions.length !== 0 ? (
              <hr className="border border-gray-500/20 mt-4 mb-2 rounded" />
            ) : null}
          </div>
          <div className="w-full flex items-start">
            <div className="flex gap-x-2">
              <ButtonSelect
                options={actionTypes.map((value) => ({
                  value,
                  label: t(`actionType.${value}`),
                  disabled:
                    value === FlowActionType.Stop ||
                    value === FlowActionType.Check
                      ? false
                      : hasMaxActions,
                }))}
                onValueChange={(value) => {
                  flow.actions.push(getActionSeed(value));
                  setFlow(structuredClone(flow));
                }}
              >
                {t("addAction")}
              </ButtonSelect>
              <button
                type="button"
                onClick={() => props.setOpen(false)}
                // disabled={!parsed.success}
                className="text-blurple-400 font-medium hover:text-blurple dark:hover:text-blurple-300"
              >
                {t("close")}
              </button>
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

// const messageFlagOptions = [
//   { label: "Hidden (ephemeral)", value: MessageFlags.Ephemeral },
//   { label: "Silent", value: MessageFlags.SuppressNotifications },
//   { label: "Suppress All Embeds", value: MessageFlags.SuppressEmbeds },
// ];

const getBackupSelectOption = (backup: PartialBackupsWithMessages[number]) => ({
  label: (
    <div className="flex">
      {backup.previewImageUrl && (
        <div
          className="rounded-lg h-6 w-6 me-1.5 block bg-contain bg-center my-auto"
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
  t,
  fetcher,
  value,
  onChange,
}: {
  t: TFunction;
  fetcher: SafeFetcher<typeof ApiGetUserBackups>;
  value?: PartialBackupsWithMessages[number];
  onChange: (backup: PartialBackupsWithMessages[number]) => void;
}) => {
  if (!fetcher.data && fetcher.state === "idle") {
    fetcher.load(apiUrl(BRoutes.currentUserBackups()));
  }

  return (
    <SimpleCombobox<string | null>
      t={t}
      label={t("backup")}
      disabled={fetcher.state !== "idle"}
      name="backupId"
      required
      value={value?.id ?? null}
      options={fetcher.data ? fetcher.data.map(getBackupSelectOption) : []}
      filter={(option, query) => {
        if (!option) return false;
        const { backup } = option as ReturnType<typeof getBackupSelectOption>;

        const q = query.toLowerCase();
        const nameContains = (backup.name ?? "").toLowerCase().includes(q);

        return backup.id === query || nameContains;
      }}
      className="grow"
      onChange={(value) => {
        if (value) {
          const backup = fetcher.data?.find((b) => b.id === value);
          if (backup) onChange(backup);
        }
      }}
    />
  );
};

const getWebhookSelectOption = (
  webhook: Pick<APIWebhook, "id" | "name" | "avatar"> & {
    channel?: { name: string | null };
    channelId?: string;
  },
) => {
  return {
    label: (
      <div className="flex items-center gap-2 truncate">
        <img
          {...cdnImgAttributes(64, (size) =>
            webhookAvatarUrl(webhook, { size }),
          )}
          className="rounded-full size-7 group-data-[base-ui-trigger]/value-parent:size-6"
          alt=""
        />
        <div className="-mt-0.5 group-data-[base-ui-trigger]/value-parent:mt-0 truncate">
          <p className="leading-none font-medium truncate">{webhook.name}</p>
          {webhook.channel?.name ? (
            <p
              className={twJoin(
                "text-sm leading-none text-muted dark:text-muted-dark dark:group-data-[highlighted]/item:text-gray-300",
                "group-data-[base-ui-trigger]/value-parent:hidden",
                "truncate",
              )}
            >
              #{webhook.channel.name}
            </p>
          ) : null}
        </div>
      </div>
    ),
    stringLabel: webhook.name ?? "",
    value: webhook.id,
    webhook,
  };
};

// const defaultSetVars = ["guildId", "channelId", "messageId", "userId"];

const getActionSeed = (type: FlowActionType): FlowAction => {
  switch (type) {
    case FlowActionType.Wait:
      return { type, seconds: 1 };
    case FlowActionType.Check:
      // @ts-expect-error
      // biome-ignore lint/suspicious/noThenProperty: see note in bot about this
      return { type, then: [], else: [] };
    default:
      // @ts-expect-error
      return { type };
  }
};

type FlowParentContext =
  | `component.${
      | ComponentType.Button
      | ComponentType.StringSelect
      | ComponentType.UserSelect
      | ComponentType.RoleSelect
      | ComponentType.MentionableSelect
      | ComponentType.ChannelSelect}`
  | `trigger.${TriggerEvent}`;

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
  parentContext?: FlowParentContext;
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
  parentContext,
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

  // action limit tracking
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
  const hasMaxActions = counted.length >= actionMax;

  // 'guess' which default setVars will be available
  const isComponent = parentContext
    ? parentContext.startsWith("component.")
    : false;
  // const isButton = parentContext === `component.${ComponentType.Button}`;
  // const isMemberTrigger = parentContext && [`trigger.${TriggerEvent.MemberAdd}`, `trigger.${TriggerEvent.MemberRemove}`].includes(parentContext);

  return (
    <div
      className={twJoin(
        "rounded-lg border shadow hover:shadow-lg p-4 transition",
        // action.type === 2
        //   ? "bg-red-500/10 hover:bg-red-500/15 border-red-500/30"
        "bg-blurple/10 hover:bg-blurple/15 border-blurple/30",
      )}
    >
      <div className="flex text-sm font-semibold select-none items-center">
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="text-rose-600 dark:text-rose-400 me-1.5"
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
        <div className="ms-auto text-base space-x-2.5 rtl:space-x-reverse shrink-0">
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
          {action.type === FlowActionType.Dud ? (
            <div />
          ) : action.type === FlowActionType.Wait ? (
            <NumberField.Root
              min={0}
              max={60}
              value={action.seconds}
              required
              onValueChange={(e) => {
                if (e !== null) {
                  action.seconds = e;
                  update();
                }
              }}
              className="w-full group"
            >
              <NumberField.Group className="w-full rounded grid grid-cols-3 h-9 bg-gray-300 group-focus:border-blurple-500 dark:bg-[#292b2f] group-invalid:border-rose-400 dark:group-invalid:border-rose-400 group-disabled:text-gray-500 group-disabled:cursor-not-allowed transition">
                <NumberField.Decrement className="border border-gray-200 dark:border-gray-300/20 dark:bg-gray-900 dark:hover:bg-primary-600 transition rounded-l">
                  <CoolIcon icon="Remove_Minus" />
                </NumberField.Decrement>
                <NumberField.Input className="border-y border-gray-200 dark:border-gray-300/20 bg-transparent text-center" />
                <NumberField.Increment className="border border-gray-200 dark:border-gray-300/20 dark:bg-gray-900 dark:hover:bg-primary-600 transition rounded-r">
                  <CoolIcon icon="Add_Plus" />
                </NumberField.Increment>
              </NumberField.Group>
            </NumberField.Root>
          ) : action.type === FlowActionType.Check ? (
            <div>
              <CheckFunctionEditor
                t={t}
                function={action.function}
                setFunction={(f) => {
                  action.function = f;
                }}
                update={update}
                level={0}
                guildId={guildId}
                roles={roles}
                parentContext={parentContext}
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
              <ButtonSelect
                className="mt-1"
                options={actionTypes.map((value) => ({
                  value,
                  label: t(`actionType.${value}`),
                  disabled:
                    value === FlowActionType.Stop
                      ? false
                      : value === FlowActionType.Check
                        ? checkLevel !== undefined && checkLevel !== 0
                        : hasMaxActions,
                }))}
                onValueChange={(value) => {
                  // biome-ignore lint/suspicious/noThenProperty: see note in bot about this
                  action.then = action.then ?? [];
                  action.then.push(getActionSeed(value));
                  update();
                }}
              >
                {t("addAction")}
              </ButtonSelect>
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
              <ButtonSelect
                className="mt-1"
                options={actionTypes.map((value) => ({
                  value,
                  label: t(`actionType.${value}`),
                  disabled:
                    value === FlowActionType.Stop
                      ? false
                      : value === FlowActionType.Check
                        ? checkLevel !== undefined && checkLevel !== 0
                        : hasMaxActions,
                }))}
                onValueChange={(value) => {
                  action.else = action.else ?? [];
                  action.else.push(getActionSeed(value));
                  update();
                }}
              >
                {t("addAction")}
              </ButtonSelect>
            </div>
          ) : action.type === FlowActionType.AddRole ||
            action.type === FlowActionType.RemoveRole ||
            action.type === FlowActionType.ToggleRole ? (
            <>
              <p className="text-sm font-medium select-none">{t("role")}</p>
              <RoleSelect
                t={t}
                name="roleId"
                roles={roles}
                value={roles.find((r) => r.id === action.roleId)}
                onChange={(role) => {
                  if (role) {
                    action.roleId = role.id;
                    update();
                  }
                }}
                unassignable="omit"
                guildId={guildId}
              />
              {roles.length === 0 ? (
                <p className="text-blurple dark:text-blurple-300 text-sm leading-tight">
                  {t("noMentionsActionNote")}
                </p>
              ) : null}
              {/* <TextArea label="Reason" maxLength={512} className="w-full" /> */}
            </>
          ) : action.type === FlowActionType.SendMessage ? (
            (() => {
              const selected = backupsFetcher.data?.find(
                (b) => b.id === action.backupId,
              );
              const messageOptions: {
                label: string;
                value: number | "null";
              }[] = [
                ...(selected
                  ? selected.data.messages.map((msg, i) => ({
                      label: `${i + 1}. ${msg.text ?? "no content"}`,
                      value: i,
                    }))
                  : []),
                {
                  label: t("random"),
                  value: "null",
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
                          key="0"
                          to="/guide/recipes/message-buttons"
                          target="_blank"
                          className={linkClassName}
                        />,
                      ]}
                    />
                  </p>
                  <div>
                    <p className="text-sm select-none">
                      {t("backup")}
                      {selected && (
                        <>
                          {" "}
                          (
                          <Link
                            to={`/?backup=${selected.id}`}
                            target="_blank"
                            className={linkClassName}
                          >
                            {t("edit")}
                          </Link>
                          )
                        </>
                      )}
                    </p>
                    <div className="flex">
                      <BackupSelect
                        t={t}
                        fetcher={backupsFetcher}
                        value={selected}
                        onChange={(backup) => {
                          action.backupId = backup.id;
                          action.backupMessageIndex = 0;
                          update();
                        }}
                      />
                      <Button
                        className="ltr:ml-2 rtl:mr-2 my-auto h-9"
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
                    messageOptions.length > 2 ? (
                      <SimpleStringSelect
                        t={t}
                        name="backupMessageIndex"
                        label={t("message")}
                        value={
                          (action.backupMessageIndex === null
                            ? "null"
                            : (action.backupMessageIndex ?? 0)) as
                            | number
                            | "null"
                        }
                        options={messageOptions}
                        onChange={(value) => {
                          action.backupMessageIndex =
                            value === "null" ? null : value;
                          update();
                        }}
                        required
                        disabled={
                          !selected || selected.data.messages.length <= 1
                        }
                      />
                    ) : null
                  }
                  <div>
                    <p className="text-sm font-medium">{t("flags")}</p>
                    <Checkbox
                      label={t(`messageFlag.${MessageFlags.Ephemeral}`)}
                      checked={flags.has(MessageFlags.Ephemeral)}
                      onCheckedChange={(checked) => {
                        checked
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
          ) : action.type === FlowActionType.SendWebhookMessage ? (
            (() => {
              const selected = backupsFetcher.data?.find(
                (b) => b.id === action.backupId,
              );
              const messageOptions: {
                label: string;
                value: number | "null";
              }[] = [
                ...(selected
                  ? selected.data.messages.map((msg, i) => ({
                      label: `${i + 1}. ${msg.text ?? "no content"}`,
                      value: i,
                    }))
                  : []),
                {
                  label: t("random"),
                  value: "null",
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
                          key="0"
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
                          <SimpleCombobox
                            t={t}
                            clearable={false}
                            label={t("webhook")}
                            disabled={
                              !guildId || webhooksFetcher.state !== "idle"
                            }
                            name="webhookId"
                            required
                            value={selectedWebhook?.id || null}
                            options={
                              webhooksFetcher.data
                                ? webhooksFetcher.data.map(
                                    getWebhookSelectOption,
                                  )
                                : []
                            }
                            filter={(option, query) => {
                              if (!option) return false;
                              const { webhook } =
                                option as unknown as ReturnType<
                                  typeof getWebhookSelectOption
                                >;

                              const q = query.toLowerCase();
                              const nameContains = (webhook.name ?? "")
                                .toLowerCase()
                                .includes(q);

                              // stricter from-start channel name match + fuzzy
                              // webhook name match (a webhook name could start
                              // with #)
                              if (query.startsWith("#")) {
                                return (
                                  nameContains ||
                                  (webhook.channel?.name ?? "")
                                    .toLowerCase()
                                    .startsWith(q.replace(/^#/, ""))
                                );
                                // I think a user search might be feasible so I
                                // didn't want to take up the @ prefix for a
                                // webhook name
                              } else if (query.startsWith("^")) {
                                return (webhook.name ?? "")
                                  .toLowerCase()
                                  .startsWith(q.replace(/^\^/, ""));
                              }

                              return (
                                webhook.id === query ||
                                webhook.channelId === query ||
                                nameContains ||
                                (webhook.channel?.name ?? "")
                                  .toLowerCase()
                                  .includes(q)
                              );
                            }}
                            className="grow"
                            onChange={(webhookId) => {
                              if (webhookId) {
                                action.webhookId = webhookId;
                                update();
                              }
                            }}
                          />
                        );
                      })()}
                      <Button
                        className="ms-2 my-auto h-9"
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
                    <p className="text-sm select-none">
                      {t("backup")}
                      {selected && (
                        <>
                          {" "}
                          (
                          <Link
                            to={`/?backup=${selected.id}`}
                            target="_blank"
                            className={linkClassName}
                          >
                            {t("edit")}
                          </Link>
                          )
                        </>
                      )}
                    </p>
                    <div className="flex">
                      <BackupSelect
                        t={t}
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
                        className="ltr:ml-2 rtl:mr-2 my-auto h-9"
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
                      <SimpleStringSelect
                        t={t}
                        name="backupMessageIndex"
                        label={t("message")}
                        value={
                          (action.backupMessageIndex === null
                            ? "null"
                            : (action.backupMessageIndex ?? 0)) as
                            | number
                            | "null"
                        }
                        options={messageOptions}
                        onChange={(value) => {
                          action.backupMessageIndex =
                            value === "null" ? null : value;
                          update();
                        }}
                        required
                        disabled={
                          !selected || selected.data.messages.length <= 1
                        }
                      />
                    )
                  }
                </>
              );
            })()
          ) : action.type === FlowActionType.CreateThread ? (
            (() => {
              const channel = channels.find(
                (c) => c.id === action.channel?.value,
              );
              return (
                <>
                  <div>
                    <p className="text-sm select-none">{t("channel")}</p>
                    <ChannelSelect
                      t={t}
                      name="channelId"
                      channels={channels.filter((c) =>
                        ["text", "forum", "media"].includes(c.type),
                      )}
                      value={channel}
                      onChange={(c) => {
                        if (c) {
                          action.channel = { value: c.id };
                          if (["forum", "media"].includes(c.type)) {
                            action.threadType = ChannelType.PublicThread;
                          }
                          update();
                        }
                      }}
                    />
                    {channels.length === 0 ? (
                      <p className="text-blurple dark:text-blurple-300 text-sm leading-tight">
                        {t("noMentionsActionNote")}
                      </p>
                    ) : null}
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
                  {(!channel || !["forum", "media"].includes(channel.type)) && (
                    <SimpleStringSelect
                      t={t}
                      name="threadType"
                      label={t("type")}
                      required
                      options={
                        threadTypeOptions as {
                          label: string;
                          value: typeof action.threadType;
                        }[]
                      }
                      value={action.threadType}
                      onChange={(value) => {
                        action.threadType = value ?? undefined;
                        update();
                      }}
                    />
                  )}
                  <SimpleStringSelect
                    t={t}
                    name="autoArchiveDuration"
                    label={t("autoArchiveDuration")}
                    options={threadAutoArchiveOptions}
                    value={action.autoArchiveDuration}
                    onChange={(value) => {
                      action.autoArchiveDuration = value;
                      update();
                    }}
                  />
                  {channel?.type &&
                    ["forum", "media"].includes(channel.type) && (
                      <StringSelect
                        name="appliedTags"
                        label="Tags"
                        options={[]}
                      />
                    )}
                </>
              );
            })()
          ) : action.type === FlowActionType.SetVariable ? (
            <FlowActionSetVariableEditor
              t={t}
              action={action}
              update={update}
            />
          ) : action.type === FlowActionType.DeleteMessage ? (
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
                    i18nKey={
                      isComponent
                        ? `deleteMessageIdOnComponent.${!!varAction}`
                        : `deleteMessageIdNote.${!!varAction}`
                    }
                    components={[
                      !!varAction || isComponent ? (
                        <CoolIcon
                          key="0"
                          icon="Circle_Check"
                          className="text-green-400"
                        />
                      ) : (
                        <CoolIcon
                          key="0"
                          icon="Close_Circle"
                          className="text-red-400"
                        />
                      ),
                      <span
                        key="0"
                        className={twJoin(mentionStyle, "font-code")}
                      />,
                    ]}
                    values={{
                      value: varAction?.value,
                    }}
                  />
                </p>
              );
            })()
          ) : action.type === FlowActionType.Stop ? (
            <>
              <p className="text-sm">
                <Trans
                  t={t}
                  i18nKey="stopMessageNote"
                  components={[
                    <Link
                      key="0"
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
                        onCheckedChange={(checked) => {
                          checked ? flags.add(flag) : flags.remove(flag);

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
  // deemphasize?: boolean;
  staticInputElement?: React.ReactElement;
}> = ({
  t,
  action,
  update,
  anonymous,
  flex,
  // deemphasize,
  staticInputElement,
}) => {
  // const deemphStyle = deemphasize
  //   ? "text-muted dark:text-muted-dark focus:text-current"
  //   : undefined;
  return (
    <div className={twJoin("flex gap-1", flex ? "flex-row" : "flex-col")}>
      <div className={twJoin(flex ? "w-1/3" : "contents")}>
        <SimpleStringSelect
          t={t}
          name="varType"
          label={t("type")}
          options={varTypeOptions}
          value={action.varType ?? varTypeOptions[0].value}
          onChange={(value) => {
            action.varType = value;
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
        {(action.varType === FlowActionSetVariableType.Static ||
          action.varType === undefined) &&
        staticInputElement ? (
          staticInputElement
        ) : (
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
        )}
      </div>
    </div>
  );
};

/** extra "mask" types for easier seeding/UX */
enum FlowActionCheckFunctionMaskType {
  MemberHasRole = 100,
}

const checkFunctionSeed = (
  type: FlowActionCheckFunctionType | FlowActionCheckFunctionMaskType,
): FlowActionCheckFunction =>
  type === FlowActionCheckFunctionMaskType.MemberHasRole
    ? {
        type: FlowActionCheckFunctionType.In,
        element: { value: "" },
        array: {
          value: "member.role_ids",
          varType: FlowActionSetVariableType.Get,
        },
      }
    : type === FlowActionCheckFunctionType.And ||
        type === FlowActionCheckFunctionType.Or ||
        type === FlowActionCheckFunctionType.Not
      ? { type, conditions: [] }
      : type === FlowActionCheckFunctionType.In
        ? {
            type,
            array: { value: "" },
            element: { value: "" },
          }
        : type === FlowActionCheckFunctionType.Equals
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
  guildId?: string;
  roles?: ResolvableAPIRole[];
  parentContext?: FlowParentContext;
}> = ({
  t,
  function: func,
  setFunction,
  remove,
  update,
  level,
  guildId,
  roles,
  parentContext,
}) => {
  const id = randomString(5);
  const isMemberRoleCheck =
    !!func &&
    func.type === FlowActionCheckFunctionType.In &&
    func.array.varType === FlowActionSetVariableType.Get &&
    (func.array.value === "selected_member.role_ids" ||
      func.array.value === "member.role_ids");

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
      <SimpleStringSelect<
        FlowActionCheckFunctionType | FlowActionCheckFunctionMaskType
      >
        t={t}
        name="functionType"
        label={t("checkFunctionTypeText")}
        value={
          isMemberRoleCheck
            ? FlowActionCheckFunctionMaskType.MemberHasRole
            : func?.type
        }
        options={[
          {
            label: t("checkFunctionMaskType.100"),
            value: FlowActionCheckFunctionMaskType.MemberHasRole,
          },
          ...checkFunctionTypes
            // Max recursion. Could definitely be increased in the future
            .filter(level >= 5 ? (val) => ![0, 1, 3].includes(val) : () => true)
            .map((value) => ({
              value,
              label: t(`checkFunctionType.${value}`),
            })),
        ]}
        onChange={(value) => {
          setFunction(checkFunctionSeed(value));
          update();
        }}
        required
      />
      {func ? (
        isMemberRoleCheck && roles ? (
          <div className="mt-2">
            <FlowActionSetVariableEditor
              t={t}
              action={func.element}
              update={update}
              anonymous
              flex
              staticInputElement={
                <div>
                  <p className="text-sm font-medium cursor-default">
                    {t("role")}
                  </p>
                  <RoleSelect
                    t={t}
                    name="value"
                    roles={roles}
                    value={roles.find(
                      (r) => r.id === String(func.element.value),
                    )}
                    onChange={(role) => {
                      if (role) {
                        func.element.value = role.id;
                        update();
                      }
                    }}
                    guildId={guildId}
                  />
                  {roles.length === 0 ? (
                    <p className="text-blurple dark:text-blurple-300 text-sm leading-tight">
                      {t("noMentionsActionNote")}
                    </p>
                  ) : null}
                </div>
              }
            />
            {/*
             * Allow choosing between the member (target user) and selected
             * member (value of user/mentionable select)
             */}
            {parentContext === `component.${ComponentType.UserSelect}` ||
            parentContext === `component.${ComponentType.MentionableSelect}` ? (
              <div className="space-y-0.5 mt-2">
                <div className="flex items-center">
                  <label
                    htmlFor={`${id}-switch`}
                    className="cursor-pointer select-none grow"
                  >
                    {t("checkSelectedMember")}
                  </label>
                  <Switch.Root
                    id={`${id}-switch`}
                    className={switchStyles.root}
                    checked={func.array.value === "selected_member.role_ids"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        func.array.value = "selected_member.role_ids";
                      } else {
                        func.array.value = "member.role_ids";
                      }
                      update();
                    }}
                  >
                    <Switch.Thumb className={switchStyles.thumb} />
                  </Switch.Root>
                </div>
                <p className="text-muted dark:text-muted-dark text-sm">
                  {t("checkSelectedMemberDescription")}
                </p>
              </div>
            ) : null}
          </div>
        ) : func.type === FlowActionCheckFunctionType.And ||
          func.type === FlowActionCheckFunctionType.Or ||
          func.type === FlowActionCheckFunctionType.Not ? (
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
                  guildId={guildId}
                  roles={roles}
                  parentContext={parentContext}
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
              onValueChange={(value) => {
                func.conditions.push(checkFunctionSeed(value));
                update();
              }}
            >
              {t("addCondition")}
            </ButtonSelect>
          </div>
        ) : func.type === FlowActionCheckFunctionType.In ? (
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
        ) : func.type === FlowActionCheckFunctionType.Equals ? (
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
        ) : null
      ) : null}
    </>
  );
};
