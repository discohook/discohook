import { DiscordErrorData, REST } from "@discordjs/rest";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIActionRowComponent,
  APIEmbed,
  APIMessage,
  APIWebhook,
  ButtonStyle,
  ComponentType,
  RESTJSONErrorCodes,
} from "discord-api-types/v10";
import { TFunction } from "i18next";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { SetErrorFunction } from "~/components/Error";
import { getSetEditingComponentProps } from "~/components/editor/ComponentEditor";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { DraftFile, getQdMessageId } from "~/routes/_index";
import { APIMessageActionRowComponent, QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { MESSAGE_REF_RE } from "~/util/constants";
import {
  cdnImgAttributes,
  executeWebhook,
  hasCustomId,
  updateWebhookMessage,
  webhookAvatarUrl,
} from "~/util/discord";
import { useSafeFetcher } from "~/util/loader";
import { getMessageText } from "~/util/message";
import { action as ApiAuditLogAction } from "../api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { MessageSendResultModal } from "./MessageSendResultModal";
import { MessageTroubleshootModal } from "./MessageTroubleshootModal";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

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

export const submitMessage = async (
  target: Pick<APIWebhook, "id" | "token">,
  message: QueryData["messages"][number],
  files?: DraftFile[],
  rest?: REST,
  orThreadId?: string,
): Promise<SubmitMessageResult> => {
  const token = target.token;
  if (!token) {
    return {
      status: "error",
      data: {
        code: -1,
        message: "No webhook token was provided.",
      },
    };
  }
  let data: APIMessage | DiscordErrorData;
  const components = message.data.components
    ? structuredClone(message.data.components).map((row) => {
        for (const child of row.components) {
          if (!hasCustomId(child)) {
            child.custom_id = undefined;
          }
        }
        return row;
      })
    : [];

  if (message.reference) {
    const match = message.reference.match(MESSAGE_REF_RE);
    if (!match) {
      throw Error(`Invalid message reference: ${message.reference}`);
    }
    data = await updateWebhookMessage(
      target.id,
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
      },
      files,
      message.thread_id ?? orThreadId,
      rest,
    );
  } else {
    const threadName = message.data.thread_name?.trim();
    data = await executeWebhook(
      target.id,
      token,
      {
        username: message.data.author?.name,
        avatar_url: message.data.author?.icon_url,
        content: message.data.content?.trim() ?? "",
        embeds:
          message.data.embeds?.map((e) => {
            e.color = e.color ?? undefined;
            return e as APIEmbed;
          }) ?? [],
        components,
        flags: message.data.flags,
        thread_name: threadName || undefined,
      },
      files,
      threadName ? undefined : message.thread_id ?? orThreadId,
      rest,
    );
  }
  return {
    status: "code" in data ? "error" : "success",
    data: "code" in data ? (data as unknown as DiscordErrorData) : data,
  } as SubmitMessageResult;
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

  const submitMessages = async (webhooks: APIWebhook[]) => {
    setSending(true);
    const results: SubmitMessageResult[] = [];
    for (const webhook of webhooks) {
      // If a message created a forum thread, assume subsequent
      // messages with no thread_id or thread_name set are intended
      // to send into the new thread. This should be a reasonably
      // harmless assumption since the request will error otherwise.
      let forumThreadId: string | undefined;

      for (const message of data.messages.filter((m) => {
        const id = getQdMessageId(m);
        return !messages[id] || messages[id].enabled;
      })) {
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
        const rowsWithoutFlows: APIActionRowComponent<APIMessageActionRowComponent>[] =
          [];
        for (const row of message.data.components ?? []) {
          rowsWithoutFlows.push({
            type: ComponentType.ActionRow,
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
            let updated: APIMessageActionRowComponent;
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
            rowsWithoutFlows[rowsWithoutFlows.length - 1].components.push(
              withoutFlow,
            );

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
              const url = new URL(withoutFlow.url);
              withoutFlow.url = url.href;
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
            webhook,
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
            result = await submitMessage(webhook, msgWithoutFlows, files?.[id]);
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

export const MessageSendModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    setAddingTarget: (open: boolean) => void;
    data: QueryData;
    cache?: CacheManager;
    sending: boolean;
    messages: SubmissionManager["messages"];
    updateMessages: SubmissionManager["updateMessages"];
    setShowingResult: SubmissionManager["setShowingResult"];
    submitMessages: SubmissionManager["submitMessages"];
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
    data,
    cache,
  } = props;

  const [selectedWebhooks, setSelectedWebhooks] = useState<
    Record<string, boolean>
  >({});

  // We don't want to execute this hook every time selectedWebhooks updates
  // (which is also every time this hook runs)
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    setSelectedWebhooks(
      Object.keys(targets).reduce(
        (o, targetId) => ({
          // biome-ignore lint/performance/noAccumulatingSpread:
          ...o,
          // Set new targets to be enabled by default,
          // but don't affect manually updated ones
          [targetId]: Object.keys(selectedWebhooks).includes(targetId)
            ? selectedWebhooks[targetId]
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

  const [troubleshootOpen, setTroubleshootOpen] = useState(false);

  return (
    <Modal {...props} setOpen={setOpen}>
      <PlainModalHeader>
        {t("sendMessageN", { count: data.messages.length })}
      </PlainModalHeader>
      <MessageTroubleshootModal
        open={troubleshootOpen}
        setOpen={setTroubleshootOpen}
      />
      <p className="text-sm font-medium">{t("messages")}</p>
      <div className="space-y-1">
        {data.messages.length > 0 ? (
          data.messages.map((message, i) => {
            const id = getQdMessageId(message);
            const previewText = getMessageText(message.data);
            return (
              <div key={`message-send-${id}`} className="flex">
                {messages[id]?.result && (
                  <button
                    type="button"
                    className={twJoin(
                      "flex ltr:mr-1 rtl:ml-1 px-3 rounded transition",
                      messages[id].result.status === "error"
                        ? "bg-rose-400/20 hover:bg-rose-400/30 text-rose-500 dark:text-rose-400 hover:dark:text-rose-100"
                        : "bg-blurple/20 hover:bg-blurple/30 text-blurple dark:text-blurple-400 hover:dark:text-blurple-100",
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
                <label className="flex grow rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer overflow-hidden">
                  <div className="my-auto grow text-left ltr:mr-2 rtl:ml-2 truncate">
                    <p className="font-semibold text-base truncate">
                      {t(previewText ? "messageNText" : "messageN", {
                        replace: { n: i + 1, text: previewText },
                      })}
                    </p>
                    {messages[id]?.result?.status === "error" && (
                      <p className="text-rose-400 text-sm leading-none">
                        {(() => {
                          const { result } = messages[id];
                          return result.data.code ===
                            RESTJSONErrorCodes.UnknownMessage
                            ? "Message link does not match webhook. Did you forget to provide a thread ID?"
                            : result.data.code ===
                                RESTJSONErrorCodes.UnknownChannel
                              ? "Unknown thread ID. The webhook should be in the thread's parent channel."
                              : result.data.message;
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
                  <div className="ltr:ml-auto rtl:mr-auto my-auto space-x-2 rtl:space-x-reverse text-2xl text-blurple dark:text-blurple-400">
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
          Object.entries(targets).map(([targetId, target]) => {
            return (
              <label
                key={`target-${targetId}`}
                className="flex rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer"
              >
                <img
                  {...cdnImgAttributes(64, (size) =>
                    webhookAvatarUrl(target, { size }),
                  )}
                  alt={target.name ?? "Webhook"}
                  className="rounded-full h-12 w-12 mr-2 my-auto shrink-0"
                />
                <div className="my-auto grow text-left truncate mr-2">
                  <p className="font-semibold text-base truncate">
                    {target.name ?? "Webhook"}
                  </p>
                  {cache && (
                    <p className="text-sm leading-none">
                      #
                      {cache.resolve({
                        scope: "channel",
                        key: target.channel_id,
                      })?.name ?? t("mention.unknown")}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  name="webhook"
                  checked={!!selectedWebhooks[target.id]}
                  onChange={(e) =>
                    setSelectedWebhooks({
                      ...selectedWebhooks,
                      [target.id]: e.currentTarget.checked,
                    })
                  }
                  hidden
                />
                <CoolIcon
                  icon={
                    selectedWebhooks[target.id]
                      ? "Checkbox_Check"
                      : "Checkbox_Unchecked"
                  }
                  className="ml-auto my-auto text-2xl text-blurple dark:text-blurple-400"
                />
              </label>
            );
          })
        ) : (
          <div>
            <p>{t("sendNoWebhooks")}</p>
            <Button onClick={() => setAddingTarget(true)}>
              {t("addWebhook")}
            </Button>
          </div>
        )}
      </div>
      <ModalFooter className="flex gap-2 flex-wrap">
        <Button
          className="ltr:mr-auto rtl:ml-auto"
          disabled={
            countSelected(selectedWebhooks) === 0 ||
            enabledMessagesCount === 0 ||
            sending
          }
          onClick={() =>
            submitMessages(
              Object.entries(targets)
                .filter(([targetId]) => selectedWebhooks[targetId])
                .map(([, target]) => target),
            )
          }
        >
          {t(
            sending
              ? withReferenceCount === 0
                ? "sending"
                : withReferenceCount === enabledMessagesCount
                  ? "editing"
                  : "submitting"
              : countSelected(selectedWebhooks) <= 1 && enabledMessagesCount > 1
                ? withReferenceCount === 0
                  ? "sendAll"
                  : "submitAll"
                : countSelected(selectedWebhooks) > 1
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
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setTroubleshootOpen(true)}
        >
          {t("havingTrouble")}
        </Button>
        {/* <Button
          disabled={
            countSelected(selectedWebhooks) === 0 || enabledMessagesCount === 0
          }
          onClick={() => {}}
        >
          {t(enabledMessagesCount > 1 ? "scheduleSendAll" : "schedule")}
        </Button> */}
      </ModalFooter>
    </Modal>
  );
};
