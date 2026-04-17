import { Dialog } from "@base-ui-components/react/dialog";
import type { DiscordErrorData, REST } from "@discordjs/rest";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  type APIEmbed,
  type APIMessage,
  type APIWebhook,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  RESTJSONErrorCodes,
} from "discord-api-types/v10";
import { BitField, MessageFlagsBitField } from "discord-bitflag";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import { Button } from "~/components/Button";
import { getSetEditingComponentProps } from "~/components/editor/ComponentEditor";
import type { SetErrorFunction } from "~/components/Error";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import type {
  FluxerAPIWebhook,
  FluxerAPIWebhookWithoutUser,
} from "~/types/fluxer";
import type { TFunction } from "~/types/i18next";
import type {
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
  QueryData,
} from "~/types/QueryData";
import {
  QueryDataTarget,
  type TargetBot,
  type TargetFluxerWebhook,
  TargetType,
} from "~/types/QueryData-raw";
import type { CacheManager } from "~/util/cache/CacheManager";
import { MESSAGE_REF_RE } from "~/util/constants";
import {
  executeWebhook,
  hasCustomId,
  isActionRow,
  isComponentsV2,
  onlyActionRows,
  updateWebhookMessage,
} from "~/util/discord";
import { executeFluxerWebhook } from "~/util/fluxer";
import { useSafeFetcher } from "~/util/loader";
import { getMessageDisplayName } from "~/util/message";
import type { action as ApiAuditLogAction } from "../api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { MessageSendResultModal } from "./MessageSendResultModal";
import {
  DialogPortal,
  Modal,
  ModalFooter,
  type ModalProps,
  PlainModalHeader,
} from "./Modal";
import { ListTarget } from "./TargetAddModal";

const countSelected = (data: Record<string, boolean>) =>
  Object.values(data).filter((v) => v).length;

export type SubmitMessageResult =
  | {
      status: "success";
      data: APIMessage;
    }
  | {
      status: "error";
      data: DiscordErrorData;
    };

export type MinimalTarget =
  | {
      type: TargetType.Webhook;
      webhook: Pick<APIWebhook, "id" | "token" | "application_id">;
    }
  | {
      type: TargetType.FluxerWebhook;
      webhook: Pick<FluxerAPIWebhook, "id" | "token">;
    };

export const submitMessage = async (
  target: MinimalTarget,
  message: QueryData["messages"][number],
  files?: DraftFile[],
  rest?: REST,
  orThreadId?: string,
): Promise<SubmitMessageResult> => {
  const token = target.webhook.token;
  if (!token) {
    return {
      status: "error",
      data: {
        code: -1,
        message: "No webhook token was provided.",
      },
    };
  }

  switch (target.type) {
    case TargetType.Webhook: {
      const { webhook } = target;
      // `with_components` is `true` when:
      // - the webhook is not owned by an application, and
      // - there are components, and
      // - the message is using components v2 (required), or there are
      //   only non-actionable components (link buttons)
      // and `undefined` otherwise (let default behavior take over)
      const withComponents = webhook.application_id
        ? undefined
        : ((): true | undefined => {
            if (!message.data.components) return;
            // The param is required for Components V2 messages
            if (isComponentsV2(message.data)) {
              return true;
            }
            for (const row of onlyActionRows(message.data.components)) {
              for (const child of row.components) {
                // Any child encountered that is not a link
                // button (a V1 non-actionable component)
                if (
                  !(
                    child.type === ComponentType.Button &&
                    child.style === ButtonStyle.Link
                  )
                ) {
                  return;
                }
              }
            }
            return true;
          })();

      let data: APIMessage | DiscordErrorData;
      const components = message.data.components
        ? structuredClone(message.data.components).map((component) => {
            // Remove tracking IDs to avoid error from Discord.
            // We should really just use a custom prop instead.
            if (isActionRow(component)) {
              for (const child of component.components) {
                if (!hasCustomId(child)) {
                  child.custom_id = undefined;
                }
              }
              // TODO: unnecessary duplication, reduce
            } else if (component.type === ComponentType.Container) {
              for (const child of component.components) {
                if (isActionRow(child)) {
                  for (const subChild of child.components) {
                    if (!hasCustomId(subChild)) {
                      subChild.custom_id = undefined;
                    }
                  }
                } else if (
                  child.type === ComponentType.Section &&
                  child.accessory.type === ComponentType.Button &&
                  !hasCustomId(child.accessory)
                ) {
                  // @ts-expect-error
                  child.accessory.custom_id = undefined;
                }
              }
            } else if (
              component.type === ComponentType.Section &&
              component.accessory.type === ComponentType.Button &&
              !hasCustomId(component.accessory)
            ) {
              // @ts-expect-error
              component.accessory.custom_id = undefined;
            }
            return component;
          })
        : [];

      if (message.reference) {
        const match = message.reference.match(MESSAGE_REF_RE);
        if (!match) {
          throw Error(`Invalid message reference: ${message.reference}`);
        }
        data = await updateWebhookMessage(
          webhook.id,
          token,
          match[3],
          {
            content: message.data.content?.trim() ?? "",
            embeds:
              message.data.embeds?.map((e) => {
                e.color = e.color ?? undefined;
                return e as APIEmbed;
              }) ?? [],
            components,
            flags: message.data.flags,
            allowed_mentions: message.data.allowed_mentions,
          },
          files,
          message.thread_id ?? orThreadId,
          rest,
          withComponents,
        );
      } else {
        const threadName = message.data.thread_name?.trim();
        data = await executeWebhook(
          webhook.id,
          token,
          {
            username: message.data.username ?? message.data.author?.name,
            avatar_url:
              message.data.avatar_url ?? message.data.author?.icon_url,
            content: message.data.content?.trim() ?? "",
            embeds:
              message.data.embeds?.map((e) => {
                e.color = e.color ?? undefined;
                return e as APIEmbed;
              }) ?? [],
            components,
            flags: message.data.flags,
            thread_name: threadName || undefined,
            allowed_mentions: message.data.allowed_mentions,
          },
          files,
          threadName ? undefined : (message.thread_id ?? orThreadId),
          rest,
          withComponents,
        );
      }
      return {
        status: "code" in data ? "error" : "success",
        data: "code" in data ? (data as unknown as DiscordErrorData) : data,
      } as SubmitMessageResult;
    }
    case TargetType.FluxerWebhook: {
      const { webhook } = target;
      const flags = new BitField();
      const originalFlags = new MessageFlagsBitField(message.data.flags ?? 0);
      if (originalFlags.has(MessageFlags.SuppressEmbeds)) {
        flags.add(MessageFlags.SuppressEmbeds);
      }
      if (originalFlags.has(MessageFlags.SuppressNotifications)) {
        flags.add(MessageFlags.SuppressNotifications);
      }
      if (originalFlags.has(MessageFlags.IsVoiceMessage)) {
        flags.add(MessageFlags.IsVoiceMessage);
      }

      const data = await executeFluxerWebhook(
        webhook.id,
        token,
        {
          username: message.data.username ?? message.data.author?.name,
          avatar_url: message.data.avatar_url ?? message.data.author?.icon_url,
          content: message.data.content?.trim() ?? "",
          embeds:
            message.data.embeds?.map((e) => {
              e.color = e.color ?? undefined;
              return e as APIEmbed;
            }) ?? [],
          flags: Number(flags.value),
        },
        files,
      );

      return {
        status: "code" in data ? "error" : "success",
        // not actually DiscordErrorData but roughly compatible
        data: "code" in data ? (data as unknown as DiscordErrorData) : data,
      } as SubmitMessageResult;
    }
    default:
      break;
  }
  return {
    status: "error",
    data: {
      code: 0,
      message: "Incompatble target type used with submitMessage",
    },
  };
};

export const useMessageSubmissionManager = (
  t: TFunction,
  data: QueryData,
  setData: React.Dispatch<QueryData>,
  files?: Record<string, DraftFile[]>,
  setError?: SetErrorFunction,
) => {
  const [sending, setSending] = useState(false);
  const auditLogFetcher = useSafeFetcher<typeof ApiAuditLogAction>({
    onError: setError,
  });

  // Reset sending state if we have been sending for over 2 minutes.
  // It is likely at this point that something has gone wrong. This would be
  // better if instead we had a fetch timeout that cascaded back to this
  // function, but this will do for now.
  useEffect(() => {
    if (sending) {
      const timeout = setTimeout(() => {
        setSending(false);
      }, 120_000);
      return () => clearTimeout(timeout);
    }
  }, [sending]);

  type MessagesData = Record<
    string,
    { result?: SubmitMessageResult; enabled: boolean }
  >;
  const [messages, updateMessages] = useReducer(
    (d: MessagesData, partialD: MessagesData) => ({
      ...d,
      ...partialD,
    }),
    {},
  );

  const [showingResult, setShowingResult] = useState<SubmitMessageResult>();
  const resultModal = (
    <MessageSendResultModal
      open={!!showingResult}
      setOpen={() => setShowingResult(undefined)}
      result={showingResult}
    />
  );

  const submitMessages = async (targets: Target[]) => {
    setSending(true);
    const enabledMessages = data.messages.filter((m) => {
      const id = getQdMessageId(m);
      return !messages[id] || messages[id].enabled;
    });
    const results: SubmitMessageResult[] = [];
    for (const target of targets) {
      switch (target.type) {
        case TargetType.Webhook: {
          const { webhook } = target;
          // If a message created a forum thread, assume subsequent
          // messages with no thread_id or thread_name set are intended
          // to send into the new thread. This should be a reasonably
          // harmless assumption since the request will fail otherwise.
          let forumThreadId: string | undefined;

          for (const message of enabledMessages) {
            const id = getQdMessageId(message);
            if (
              message.reference &&
              message.data.webhook_id &&
              webhook.id !== message.data.webhook_id
            ) {
              const result: SubmitMessageResult = {
                status: "error",
                data: {
                  code: 0,
                  message: t("skippedEdit"),
                },
              };
              results.push(result);
              updateMessages({
                [id]: {
                  result,
                  enabled: true,
                },
              });
              continue;
            }

            let result: SubmitMessageResult | undefined;
            // TODO: ignores action rows/buttons nested in other components. need a catch all solution for these cases
            const rowsWithoutFlows: APIMessageTopLevelComponent[] = [];
            for (const row of message.data.components ?? []) {
              if (!isActionRow(row)) {
                rowsWithoutFlows.push(row);
                continue;
              }
              rowsWithoutFlows.push({
                id: row.id,
                type: row.type,
                components: [],
              });
              let ci = -1;
              for (const component of row.components) {
                ci += 1;
                // Make sure everything is saved before sending the message
                const editingProps = getSetEditingComponentProps({
                  component,
                  row,
                  componentIndex: ci,
                  data,
                  setData,
                  setEditingComponent: () => {},
                });
                let updated: APIComponentInMessageActionRow;
                try {
                  updated = await editingProps.submit(component, setError);
                } catch (e) {
                  result = {
                    status: "error",
                    data: {
                      code: 0,
                      message: `Invalid Component: ${e}`,
                    },
                  };
                  break;
                }
                const withoutFlow = structuredClone(updated);
                (
                  rowsWithoutFlows[rowsWithoutFlows.length - 1] as typeof row
                ).components.push(withoutFlow);

                if ("flow" in withoutFlow && withoutFlow.flow) {
                  withoutFlow.flow = undefined;
                }
                if ("flows" in withoutFlow && withoutFlow.flows) {
                  withoutFlow.flows = undefined;
                }
                if (
                  withoutFlow.type === ComponentType.Button &&
                  isLinkButton(withoutFlow) &&
                  withoutFlow.custom_id
                ) {
                  // Since this is a clone that we're submitting straight to
                  // discord (not saving anywhere), we don't need to validate
                  // the URL
                  withoutFlow.custom_id = undefined;
                }
              }
            }

            const msgWithoutFlows = {
              ...message,
              data: {
                ...message.data,
                components: rowsWithoutFlows,
              },
            };
            if (!result || result.status === "success") {
              result = await submitMessage(
                target,
                msgWithoutFlows,
                files?.[id],
                undefined,
                forumThreadId,
              );
            }
            if (
              result.status === "error" &&
              result.data.code === RESTJSONErrorCodes.UnknownMessage &&
              !forumThreadId &&
              !message.thread_id &&
              message.reference
            ) {
              // Assume that the message link contains a thread ID: set it and try again
              const match = message.reference.match(MESSAGE_REF_RE);
              if (match?.[2] && match[2] !== webhook.channel_id) {
                console.log(
                  `Message ID ${match[3]} not found in webhook channel, trying again with ${match[2]} as thread ID`,
                );
                message.thread_id = match[2];
                result = await submitMessage(
                  target,
                  msgWithoutFlows,
                  files?.[id],
                );
                if (result.status === "error") {
                  // Unmutate the state since our guess was wrong
                  message.thread_id = undefined;
                }
              }
            }

            if (result.status === "success") {
              if (message.data.thread_name) {
                forumThreadId = result.data.channel_id;
              }

              auditLogFetcher.submit(
                {
                  type: message.reference ? "edit" : "send",
                  threadId:
                    result.data.position !== undefined
                      ? result.data.channel_id
                      : undefined,
                },
                {
                  method: "POST",
                  action: apiUrl(
                    BRoutes.messageLog(
                      webhook.id,
                      // We needed the token in order to arrive at a success state
                      // biome-ignore lint/style/noNonNullAssertion: ^
                      webhook.token!,
                      result.data.id,
                    ),
                  ),
                },
              );
            }

            updateMessages({
              [id]: { result, enabled: true },
            });
            results.push(result);
          }
          break;
        }
        case TargetType.Bot: {
          console.error("Bot target is not implemented");
          break;
        }
        case TargetType.FluxerWebhook: {
          for (const message of enabledMessages) {
            const id = getQdMessageId(message);

            const result = await submitMessage(target, message, files?.[id]);
            updateMessages({
              [id]: { result, enabled: true },
            });
            results.push(result);
          }
          break;
        }
        default:
          break;
      }
    }

    setSending(false);
    return results;
  };

  return {
    sending,
    setSending,
    messages,
    updateMessages,
    showingResult,
    setShowingResult,
    resultModal,
    submitMessages,
  };
};

type SubmissionManager = ReturnType<typeof useMessageSubmissionManager>;

export type TargetKey = `${TargetType}:${string}`;

export type DraftTargetWebhook = {
  type: TargetType.Webhook;
  webhook: APIWebhook;
};
export type DraftTargetBot = TargetBot & { token: string };
export type DraftTargetFluxerWebhook = TargetFluxerWebhook & {
  webhook: FluxerAPIWebhookWithoutUser;
};
export type Target =
  | DraftTargetWebhook
  | DraftTargetBot
  | DraftTargetFluxerWebhook;

export type TargetMap = Record<TargetKey, Target>;

export const getTargetKey = (target: Target): TargetKey =>
  `${target.type}:${
    target.type === TargetType.Webhook ||
    target.type === TargetType.FluxerWebhook
      ? target.webhook.id
      : target.type === TargetType.Bot
        ? `${target.application_id}-${target.channel_id}`
        : ""
  }`;

export const draftTargetToQueryTarget = (target: Target): QueryDataTarget => {
  switch (target.type) {
    case TargetType.Webhook:
      return {
        type: target.type,
        url: `https://discord.com/api/webhooks/${target.webhook.id}/${target.webhook.token}`,
      };
    case TargetType.Bot: {
      const { token: _, ...rest } = target;
      return rest;
    }
    case TargetType.FluxerWebhook:
      return {
        type: target.type,
        id: target.webhook.id,
        token: target.webhook.token,
      };
    default:
      break;
  }
  throw Error("Unknown draft target type; cannot convert to query data target");
};

export const MessageSendModal = (
  props: ModalProps & {
    targets: TargetMap;
    setAddingTarget: (open: boolean) => void;
    data: QueryData;
    cache?: CacheManager;
    sending: boolean;
    messages: SubmissionManager["messages"];
    updateMessages: SubmissionManager["updateMessages"];
    setShowingResult: SubmissionManager["setShowingResult"];
    submitMessages: SubmissionManager["submitMessages"];
    resultModal?: JSX.Element;
  },
) => {
  const { t } = useTranslation();
  const {
    targets,
    setAddingTarget,
    sending,
    messages,
    updateMessages,
    setShowingResult,
    submitMessages,
    resultModal,
    data,
    cache,
  } = props;

  const [selectedTargets, setSelectedTargets] = useState<
    Record<string, boolean>
  >({});

  // We don't want to execute this hook every time selectedWebhooks updates
  // (which is also every time this hook runs)
  // biome-ignore lint/correctness/useExhaustiveDependencies: ^
  useEffect(() => {
    setSelectedTargets(
      Object.keys(targets).reduce(
        (o, targetKey) => ({
          // biome-ignore lint/performance/noAccumulatingSpread: I think this is fine
          ...o,
          // Set new targets to be enabled by default,
          // but don't affect manually updated ones
          [targetKey]: Object.keys(selectedTargets).includes(targetKey)
            ? selectedTargets[targetKey]
            : true,
        }),
        {},
      ),
    );
  }, [targets]);

  const enabledMessagesCount = Object.values(data.messages).filter((m) => {
    const id = getQdMessageId(m);
    return !messages[id] || messages[id].enabled;
  }).length;
  const withReferenceCount = Object.values(data.messages).filter((m) => {
    const id = getQdMessageId(m);
    return (
      (!messages[id] || messages[id].enabled) &&
      !!data.messages.find((m) => m._id === id)?.reference
    );
  }).length;

  const setOpen = (s: boolean) => {
    props.setOpen(s);
    if (!s) {
      updateMessages(
        Object.fromEntries(
          Object.entries(messages).map(
            // Reset result when modal is closed
            ([id, cur]) => [id, { result: undefined, enabled: cur.enabled }],
            {},
          ),
        ),
      );
    }
  };

  return (
    <Modal {...props} setOpen={setOpen}>
      <PlainModalHeader>
        {t("sendMessageN", { count: data.messages.length })}
      </PlainModalHeader>
      {resultModal ?? null}
      <p className="text-sm font-medium">{t("messages")}</p>
      <div className="space-y-1">
        {data.messages.length > 0 ? (
          data.messages.map((message, i) => {
            const id = getQdMessageId(message);
            return (
              <div key={`message-send-${id}`} className="flex">
                {messages[id]?.result && (
                  <button
                    type="button"
                    className={twJoin(
                      "flex me-1 px-3 rounded-lg transition border border-transparent",
                      messages[id].result.status === "error"
                        ? "bg-rose-400/20 hover:bg-rose-400/30 text-rose-500 dark:text-rose-400 hover:dark:text-rose-100 dark:border-[#362D30]"
                        : "bg-blurple/20 hover:bg-blurple/30 text-blurple dark:text-blurple-400 hover:dark:text-blurple-100 dark:border-[#222]",
                    )}
                    onClick={() => setShowingResult(messages[id].result)}
                  >
                    <CoolIcon
                      icon={
                        messages[id].result.status === "error"
                          ? "Octagon_Warning"
                          : "Info"
                      }
                      className="m-auto text-3xl"
                    />
                  </button>
                )}
                <label
                  className={twJoin(
                    "rounded-lg py-2 px-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex",
                    "grow w-full cursor-pointer overflow-hidden",
                  )}
                >
                  <div className="my-auto grow text-left me-2 truncate">
                    <p className="font-semibold text-base truncate">
                      {getMessageDisplayName(t, i, message)}
                    </p>
                    {messages[id]?.result?.status === "error" && (
                      <p className="text-rose-400 text-sm leading-none">
                        {(() => {
                          const { result } = messages[id];
                          switch (result.data.code) {
                            case RESTJSONErrorCodes.UnknownMessage:
                              return "Message link does not match webhook. Did you forget to provide a thread ID?";
                            case RESTJSONErrorCodes.UnknownChannel:
                              return "Unknown thread ID. The webhook should be in the thread's parent channel.";
                            case RESTJSONErrorCodes.InvalidFormBodyOrContentType:
                              return "Invalid data. Click the error icon for more info.";
                            default:
                              return result.data.message;
                          }
                        })()}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    name="message"
                    checked={!messages[id] ? true : messages[id].enabled}
                    onChange={(e) =>
                      updateMessages({
                        [id]: {
                          ...messages[id],
                          enabled: e.currentTarget.checked,
                        },
                      })
                    }
                    hidden
                  />
                  <div className="ms-auto my-auto space-x-2 rtl:space-x-reverse text-2xl text-blurple dark:text-blurple-400">
                    {message.reference && (
                      <CoolIcon
                        title={t("willBeEdited")}
                        icon="Edit_Pencil_01"
                      />
                    )}
                    <CoolIcon
                      icon={
                        !messages[id] || messages[id].enabled
                          ? "Checkbox_Check"
                          : "Checkbox_Unchecked"
                      }
                    />
                  </div>
                </label>
              </div>
            );
          })
        ) : (
          <p>{t("noMessages")}</p>
        )}
      </div>
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <p className="text-sm font-medium">{t("webhooks")}</p>
      <div className="space-y-1">
        {Object.keys(targets).length > 0 ? (
          Object.entries(targets).map(([targetKey, target]) => (
            <label key={`target-${targetKey}`} className="cursor-pointer">
              <input
                type="checkbox"
                name="webhook"
                checked={!!selectedTargets[targetKey]}
                onChange={(e) =>
                  setSelectedTargets({
                    ...selectedTargets,
                    [targetKey]: e.currentTarget.checked,
                  })
                }
                hidden
              />
              <ListTarget
                t={t}
                target={target}
                channel={
                  target.type === TargetType.Webhook
                    ? cache?.channel.get(target.webhook.channel_id)
                    : undefined
                }
                endComponent={
                  <CoolIcon
                    icon={
                      selectedTargets[targetKey]
                        ? "Checkbox_Check"
                        : "Checkbox_Unchecked"
                    }
                    className="text-2xl text-blurple dark:text-blurple-400"
                  />
                }
              />
            </label>
          ))
        ) : (
          <div>
            <p>{t("sendNoWebhooks")}</p>
            <Button onClick={() => setAddingTarget(true)}>
              {t("addTarget.1")}
            </Button>
          </div>
        )}
      </div>
      <ModalFooter className="flex gap-2 flex-wrap">
        <Button
          className="me-auto"
          disabled={
            countSelected(selectedTargets) === 0 ||
            enabledMessagesCount === 0 ||
            sending
          }
          loading={sending}
          onClick={() =>
            submitMessages(
              Object.entries(targets)
                .filter(([targetKey]) => selectedTargets[targetKey])
                .map(([, target]) => target),
            )
          }
        >
          {t(
            countSelected(selectedTargets) <= 1 && enabledMessagesCount > 1
              ? withReferenceCount === 0
                ? "sendAll"
                : "submitAll"
              : countSelected(selectedTargets) > 1
                ? withReferenceCount === 0
                  ? "sendToAll"
                  : "submitToAll"
                : withReferenceCount === 0
                  ? "send"
                  : withReferenceCount === enabledMessagesCount
                    ? "edit"
                    : "submit",
          )}
        </Button>
        <Dialog.Root>
          <Dialog.Trigger className="contents">
            <Button discordstyle={ButtonStyle.Secondary}>
              {t("havingTrouble")}
            </Button>
          </Dialog.Trigger>
          <DialogPortal>
            <PlainModalHeader>{t("havingTrouble")}</PlainModalHeader>
            <Dialog.Description>{t("troubleshootMessage")}</Dialog.Description>
          </DialogPortal>
        </Dialog.Root>
      </ModalFooter>
    </Modal>
  );
};
