import { DiscordErrorData, REST } from "@discordjs/rest";
import { SerializeFrom } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIMessage,
  APIWebhook,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { getMessageText } from "~/components/editor/MessageEditor.client";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { DraftFile, getQdMessageId } from "~/routes/_index";
import type { Flow } from "~/store.server";
import { QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { MESSAGE_REF_RE } from "~/util/constants";
import { cdn, executeWebhook, updateWebhookMessage } from "~/util/discord";
import { action as ApiAuditLogAction } from "../api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import type { action as ApiPostValidateFlows } from "../api/v1/validate.flows";
import { MessageSendResultModal } from "./MessageSendResultModal";
import { MessageTroubleshootModal } from "./MessageTroubleshootModal";
import { Modal, ModalProps } from "./Modal";

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
        content: message.data.content?.trim() || undefined,
        embeds: message.data.embeds || undefined,
        components: message.data.components,
      },
      files,
      undefined,
      rest,
    );
  } else {
    data = await executeWebhook(
      target.id,
      token,
      {
        username: message.data.author?.name,
        avatar_url: message.data.author?.icon_url,
        content: message.data.content?.trim() || undefined,
        embeds: message.data.embeds || undefined,
        components: message.data.components,
        flags: message.data.flags,
      },
      files,
      undefined,
      rest,
    );
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
    files?: Record<string, DraftFile[]>;
    cache?: CacheManager;
  },
) => {
  const { t } = useTranslation();
  const { targets, setAddingTarget, data, files, cache } = props;

  const auditLogFetcher = useFetcher<typeof ApiAuditLogAction>();
  // const backupFetcher = useFetcher<typeof ApiBackupsAction>();

  const [selectedWebhooks, updateSelectedWebhooks] = useReducer(
    (d: Record<string, boolean>, partialD: Record<string, boolean>) => ({
      ...d,
      ...partialD,
    }),
    {},
  );

  // We don't want to execute this hook every time selectedWebhooks updates
  // (which is also every time this hook runs)
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    // Set new targets to be enabled by default,
    // but don't affect manually updated ones
    updateSelectedWebhooks(
      Object.keys(targets)
        .filter((targetId) => !Object.keys(selectedWebhooks).includes(targetId))
        .reduce(
          (o, targetId) => ({
            // biome-ignore lint/performance/noAccumulatingSpread:
            ...o,
            [targetId]: true,
          }),
          {},
        ),
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
    {},
  );
  const enabledMessagesCount = Object.values(data.messages).filter((m) => {
    const id = getQdMessageId(m);
    return !messages[id] || messages[id].enabled;
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

  const [showingResult, setShowingResult] = useState<SubmitMessageResult>();
  const [troubleshootOpen, setTroubleshootOpen] = useState(false);

  return (
    <Modal
      title={t("sendMessageN", { count: data.messages.length })}
      {...props}
      setOpen={setOpen}
    >
      <MessageSendResultModal
        open={!!showingResult}
        setOpen={() => setShowingResult(undefined)}
        result={showingResult}
      />
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
                <label className="flex grow rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer overflow-hidden">
                  {!!messages[id]?.result && (
                    <CoolIcon
                      icon={
                        messages[id]?.result?.status === "success"
                          ? "Check"
                          : "Close_MD"
                      }
                      className={`text-2xl my-auto mr-1 ${
                        messages[id]?.result?.status === "success"
                          ? "text-green-600"
                          : "text-rose-600"
                      }`}
                    />
                  )}
                  <div className="my-auto grow text-left ltr:mr-2 rtl:ml-2 truncate">
                    <p className="font-semibold text-base truncate">
                      {t(previewText ? "messageNText" : "messageN", {
                        replace: { n: i + 1, text: previewText },
                      })}
                    </p>
                    {messages[id]?.result?.status === "error" && (
                      <p className="text-rose-500 text-sm leading-none">
                        <CoolIcon
                          icon="Circle_Warning"
                          className="ltr:mr-1 rtl:ml-1"
                        />
                        {
                          (messages[id].result?.data as DiscordErrorData)
                            .message
                        }
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
                {messages[id]?.result && (
                  <button
                    type="button"
                    className="flex ml-2 p-2 text-2xl rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 text-blurple dark:text-blurple-400 hover:text-blurple-400 hover:dark:text-blurple-300 transition"
                    onClick={() => setShowingResult(messages[id].result)}
                  >
                    <CoolIcon icon="Info" className="m-auto" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p>{t("noMessages")}</p>
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
            <Button onClick={() => setAddingTarget(true)}>
              {t("addWebhook")}
            </Button>
          </div>
        )}
      </div>
      <div className="flex mt-4">
        <div className="mx-auto space-x-2 rtl:space-x-reverse">
          <Button
            disabled={
              countSelected(selectedWebhooks) === 0 ||
              enabledMessagesCount === 0
            }
            onClick={async () => {
              for (const [targetId] of Object.entries(selectedWebhooks).filter(
                ([_, v]) => v,
              )) {
                const webhook = targets[targetId];
                if (!webhook) continue;

                for (const message of data.messages.filter((m) => {
                  const id = getQdMessageId(m);
                  return !messages[id] || messages[id].enabled;
                })) {
                  const id = getQdMessageId(message);
                  if (
                    message.data.webhook_id &&
                    targetId !== message.data.webhook_id
                  ) {
                    updateMessages({
                      [id]: {
                        result: {
                          status: "error",
                          data: {
                            code: 0,
                            message: t("skippedEdit"),
                          },
                        },
                        enabled: true,
                      },
                    });
                    continue;
                  }

                  const flows: Flow[] = [];
                  for (const row of message.data.components ?? []) {
                    for (const component of row.components) {
                      if ("flow" in component && component.flow) {
                        flows.push(component.flow);
                        component.flow = undefined;
                      }
                      if ("flows" in component && component.flows) {
                        flows.push(...Object.values(component.flows));
                        component.flows = undefined;
                      }
                      if (
                        component.type === ComponentType.Button &&
                        isLinkButton(component) &&
                        component.custom_id
                      ) {
                        const url = new URL(component.url);
                        url.searchParams.set(
                          "dhc-id",
                          component.custom_id.replace(/^p_/, ""),
                        );
                        component.url = url.href;
                        component.custom_id = undefined;
                      }
                    }
                  }
                  let result: SubmitMessageResult | undefined;
                  if (flows.length !== 0) {
                    const response = await fetch(
                      apiUrl(BRoutes.validateFlows()),
                      {
                        method: "POST",
                        body: JSON.stringify(flows),
                        headers: {
                          "Content-Type": "application/json",
                        },
                      },
                    );
                    const raw = (await response.json()) as SerializeFrom<
                      typeof ApiPostValidateFlows
                    >;
                    if (raw.success) {
                      result = {
                        status: "error",
                        data: {
                          code: 0,
                          message: "Invalid Flow",
                          errors: raw.error,
                        },
                      };
                    }
                  }

                  if (!result || result.status === "success") {
                    result = await submitMessage(webhook, message, files?.[id]);
                  }
                  if (result.status === "success") {
                    auditLogFetcher.submit(
                      {
                        type: message.reference ? "edit" : "send",
                        // threadId: ,
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
                }
              }
            }}
          >
            {t(
              countSelected(selectedWebhooks) <= 1 && enabledMessagesCount > 1
                ? "sendAll"
                : countSelected(selectedWebhooks) > 1
                  ? "sendToAll"
                  : "send",
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
              countSelected(selectedWebhooks) === 0 ||
              enabledMessagesCount === 0
            }
            onClick={() => {}}
          >
            {t(enabledMessagesCount > 1 ? "scheduleSendAll" : "schedule")}
          </Button> */}
        </div>
      </div>
    </Modal>
  );
};
