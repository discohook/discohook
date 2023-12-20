import { DiscordErrorData } from "@discordjs/rest";
import { useFetcher } from "@remix-run/react";
import { APIMessage, APIWebhook } from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { getMessageText } from "~/components/editor/MessageEditor";
import { QueryData } from "~/types/QueryData";
import { MESSAGE_REF_RE } from "~/util/constants";
import { cdn, executeWebhook, updateWebhookMessage } from "~/util/discord";
import { action as ApiAuditLogAction } from "../routes/api.audit-log";
import { MessageSendResultModal } from "./MessageSendResultModal";
import { Modal, ModalProps } from "./Modal";

const strings = {
  send: "Send",
  sendToAll: "Send to All",
  sendAll: "Send All",
  noMessages: "You have no messages to send.",
  willBeEdited: "This message has a reference set, so it will be edited.",
  skippedEdit: "Skipped edit due to mismatched webhook ID.",
};

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
  target: APIWebhook,
  message: QueryData["messages"][number]
): Promise<SubmitMessageResult> => {
  let data;
  if (message.reference) {
    data = await updateWebhookMessage(
      target.id,
      target.token!,
      message.reference.match(MESSAGE_REF_RE)![3],
      {
        content: message.data.content?.trim() || undefined,
        embeds: message.data.embeds || undefined,
      }
    );
  } else {
    data = await executeWebhook(target.id, target.token!, {
      username: message.data.author?.name,
      avatar_url: message.data.author?.icon_url,
      content: message.data.content?.trim() || undefined,
      embeds: message.data.embeds || undefined,
    });
  }
  return {
    status: "code" in data ? "error" : "success",
    data: "code" in data ? (data as unknown as DiscordErrorData) : data,
  } as SubmitMessageResult;
};

export const MessageSendModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    setAddingTarget: (open: boolean) => void;
    data: QueryData;
  }
) => {
  const { targets, setAddingTarget, data } = props;

  const auditLogFetcher = useFetcher<typeof ApiAuditLogAction>();

  const [selectedWebhooks, updateSelectedWebhooks] = useReducer(
    (d: Record<string, boolean>, partialD: Record<string, boolean>) => ({
      ...d,
      ...partialD,
    }),
    {}
  );
  useEffect(() => {
    // Set new targets to be enabled by default,
    // but don't affect manually updated ones
    updateSelectedWebhooks(
      Object.keys(targets)
        .filter((targetId) => !Object.keys(selectedWebhooks).includes(targetId))
        .reduce((o, targetId) => ({ ...o, [targetId]: true }), {})
    );
  }, [targets]);

  // Indexed by stringified data.messages index
  type MessagesData = Record<
    string,
    { result?: SubmitMessageResult; enabled: boolean }
  >;
  const [messages, updateMessages] = useReducer(
    (d: MessagesData, partialD: MessagesData) => ({
      ...d,
      ...partialD,
    }),
    {}
  );
  const enabledMessagesCount = Object.values(messages).filter(
    (d) => d.enabled
  ).length;
  useEffect(() => {
    // Reset all messages to be enabled by default
    // since the index is not a static identifier
    updateMessages(
      data.messages
        .map((_, i) => i)
        .reduce((o, index) => ({ ...o, [index]: { enabled: true } }), {})
    );
  }, [data.messages]);

  const setOpen = (s: boolean) => {
    props.setOpen(s);
    if (!s) {
      updateMessages(
        Array(10)
          .fill(undefined)
          .map((_, i) => i)
          .reduce(
            (o, index) => ({
              ...o,
              [index]: { result: undefined, enabled: true },
            }),
            {}
          )
      );
    }
  };

  const [showingResult, setShowingResult] = useState<SubmitMessageResult>();

  return (
    <Modal
      title={`Send Message${data.messages.length === 1 ? "" : "s"}`}
      {...props}
      setOpen={setOpen}
    >
      <MessageSendResultModal
        open={!!showingResult}
        setOpen={() => setShowingResult(undefined)}
        result={showingResult}
      />
      <p className="text-sm font-medium">Messages</p>
      <div className="space-y-1">
        {data.messages.length > 0 ? (
          data.messages.map((message, i) => {
            const previewText = getMessageText(message.data);
            return (
              <div key={`message-send-${i}`} className="flex">
                <label className="flex grow rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer overflow-hidden">
                  {!!messages[i]?.result && (
                    <CoolIcon
                      icon={
                        messages[i]?.result!.status === "success"
                          ? "Check"
                          : "Close_MD"
                      }
                      className={`text-2xl my-auto mr-1 ${
                        messages[i]?.result!.status === "success"
                          ? "text-green-600"
                          : "text-rose-600"
                      }`}
                    />
                  )}
                  <div className="my-auto grow text-left mr-2 truncate">
                    <p className="font-semibold text-base truncate">
                      Message {i + 1}
                      {!!previewText && (
                        <span className="truncate ml-1">- {previewText}</span>
                      )}
                    </p>
                    {messages[i]?.result?.status === "error" && (
                      <p className="text-rose-500 text-sm leading-none">
                        <CoolIcon icon="Circle_Warning" className="mr-1" />
                        {(messages[i].result?.data as DiscordErrorData).message}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    name="message"
                    checked={!!messages[i]?.enabled}
                    onChange={(e) =>
                      updateMessages({
                        [i]: { enabled: e.currentTarget.checked },
                      })
                    }
                    hidden
                  />
                  <div className="ml-auto my-auto space-x-2 text-2xl text-blurple dark:text-blurple-400">
                    {message.reference && (
                      <CoolIcon
                        title={strings.willBeEdited}
                        icon="Edit_Pencil_01"
                      />
                    )}
                    <CoolIcon
                      icon={
                        messages[i]?.enabled
                          ? "Checkbox_Check"
                          : "Checkbox_Unchecked"
                      }
                    />
                  </div>
                </label>
                {messages[i]?.result && (
                  <button
                    className="flex ml-2 p-2 text-2xl rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 text-blurple dark:text-blurple-400 hover:text-blurple-400 hover:dark:text-blurple-300 transition"
                    onClick={() => setShowingResult(messages[i].result)}
                  >
                    <CoolIcon icon="Info" className="m-auto" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p>{strings.noMessages}</p>
        )}
      </div>
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <p className="text-sm font-medium">Webhooks</p>
      <div className="space-y-1">
        {Object.keys(targets).length > 0 ? (
          Object.entries(targets).map(([targetId, target]) => {
            return (
              <label
                key={`target-${targetId}`}
                className="flex rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer"
              >
                <img
                  src={
                    target.avatar
                      ? cdn.avatar(target.id, target.avatar, { size: 64 })
                      : cdn.defaultAvatar(5)
                  }
                  alt={target.name ?? "Webhook"}
                  className="rounded-full h-12 w-12 mr-2 my-auto shrink-0"
                />
                <div className="my-auto grow text-left truncate mr-2">
                  <p className="font-semibold text-base truncate">
                    {target.name ?? "Webhook"}
                  </p>
                  <p className="text-sm leading-none truncate">
                    Channel ID {target.channel_id}
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="webhook"
                  checked={!!selectedWebhooks[target.id]}
                  onChange={(e) =>
                    updateSelectedWebhooks({
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
            <p>You have no webhooks to send to.</p>
            <Button onClick={() => setAddingTarget(true)}>Add Webhook</Button>
          </div>
        )}
      </div>
      <div className="flex mt-4">
        <div className="mx-auto space-x-2">
          <Button
            disabled={
              countSelected(selectedWebhooks) === 0 ||
              enabledMessagesCount === 0
            }
            onClick={async () => {
              for (const [targetId] of Object.entries(selectedWebhooks).filter(
                ([_, v]) => v
              )) {
                const webhook = targets[targetId];
                for (const [index] of Object.entries(messages).filter(
                  ([_, v]) => v.enabled
                )) {
                  const message = data.messages[Number(index)];
                  if (!message) continue;
                  if (
                    message.data.webhook_id &&
                    targetId !== message.data.webhook_id
                  ) {
                    updateMessages({
                      [index]: {
                        result: {
                          status: "error",
                          data: {
                            code: 0,
                            message: strings.skippedEdit,
                          },
                        },
                        enabled: true,
                      },
                    });
                    continue;
                  }

                  const result = await submitMessage(webhook, message);
                  if (result.status === "success") {
                    auditLogFetcher.submit(
                      {
                        type: message.reference ? "edit" : "send",
                        webhookId: webhook.id,
                        webhookToken: webhook.token!,
                        messageId: result.data.id,
                        // threadId: ,
                      },
                      {
                        method: "POST",
                        action: "/api/audit-log",
                      }
                    );
                  }

                  updateMessages({
                    [index]: { result, enabled: true },
                  });
                }
              }
            }}
          >
            {countSelected(selectedWebhooks) <= 1 && enabledMessagesCount > 1
              ? strings.sendAll
              : countSelected(selectedWebhooks) > 1
                ? strings.sendToAll
                : strings.send}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
