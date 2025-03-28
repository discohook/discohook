import {
  APIWebhook,
  ButtonStyle,
  RESTJSONErrorCodes,
} from "discord-api-types/v10";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, TextButton } from "~/components/Button";
import { InfoBox } from "~/components/InfoBox";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { loadMessageComponents } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { MESSAGE_REF_RE } from "~/util/constants";
import {
  cdnImgAttributes,
  getWebhookMessage,
  webhookAvatarUrl,
} from "~/util/discord";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

export const MessageSetModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    setAddingTarget: (open: boolean) => void;
    data: QueryData;
    setData: React.Dispatch<QueryData>;
    messageIndex?: number;
    cache?: CacheManager;
  },
) => {
  const { t } = useTranslation();
  const { targets, setAddingTarget, data, setData, messageIndex, cache } =
    props;
  const message =
    messageIndex !== undefined ? data.messages[messageIndex] : undefined;

  const [webhook, setWebhook] = useState<
    (typeof targets)[string] | undefined
  >();
  const [messageLink, setMessageLink] =
    useState<[string | undefined, string | undefined, string]>();
  const [error, setError] = useState<ReactNode>();

  const setOpen = (s: boolean) => {
    props.setOpen(s);
    if (!s) {
      setWebhook(undefined);
      setMessageLink(undefined);
      setError(undefined);
    }
  };

  const possibleWebhooks = Object.values(targets).filter((w) =>
    messageLink && w.guild_id && messageLink[0]
      ? w.guild_id === messageLink[0]
      : true,
  );
  if (message?.data?.webhook_id) {
    const extantWebhookMatch = targets[message.data.webhook_id];
    if (extantWebhookMatch && !possibleWebhooks.includes(extantWebhookMatch)) {
      possibleWebhooks.splice(0, 0, extantWebhookMatch);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (message) {
      if (message.data.webhook_id) {
        setWebhook(targets[message.data.webhook_id]);
      }
      if (message.reference) {
        const match = message.reference.match(MESSAGE_REF_RE);
        if (match) {
          setMessageLink([match[1], match[2], match[3]]);
        }
      }
    }
  }, [message]);

  return (
    <Modal {...props} setOpen={setOpen}>
      <PlainModalHeader>{t("setMessageLink")}</PlainModalHeader>
      <InfoBox severity="blue" icon="Info" collapsible open={false}>
        <span>What is this?</span>
        <p>
          You can use this menu if you're editing a message that has already
          been sent. To get started, right click/long press the message you want
          to edit, select "Copy Message Link", then paste the link in the box
          below.
          <br />
          <br />
          If you want to overwrite what is currently written in Discohook: Add
          the webhook that sent the message, then press "Overwrite Editor".
          Otherwise, just select "Set Message Link". The submit button at the
          top of the page will now allow you to edit the message.
        </p>
      </InfoBox>
      <div>
        <TextInput
          className="w-full"
          errors={[error]}
          defaultValue={message?.reference}
          placeholder="https://discord.com/channels/.../.../..."
          onInput={async (e) => {
            setError(undefined);
            setMessageLink(undefined);
            if (!e.currentTarget.value) return;

            const match = e.currentTarget.value.match(MESSAGE_REF_RE);
            if (!match) {
              setError(t("invalidMessageLink"));
              return;
            }
            setMessageLink([match[1], match[2], match[3]]);
          }}
        />
      </div>
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <p className="text-sm font-medium">{t("webhook")}</p>
      <div className="space-y-1">
        {Object.keys(possibleWebhooks).length > 0 ? (
          Object.entries(possibleWebhooks).map(([targetId, target]) => {
            return (
              <label
                key={`target-${targetId}`}
                className="flex rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 hover:dark:bg-gray-600 transition py-2 px-4 w-full cursor-pointer"
              >
                <img
                  {...cdnImgAttributes(64, (size) =>
                    webhookAvatarUrl(target, { size }),
                  )}
                  alt={target.name ?? t("webhook")}
                  className="rounded-full h-12 w-12 mr-2 my-auto"
                />
                <div className="my-auto grow text-left">
                  <p className="font-semibold text-base">
                    {target.name ?? t("webhook")}
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
                  type="radio"
                  name="webhook"
                  checked={!!webhook && target.id === webhook.id}
                  onChange={(e) => {
                    if (e.currentTarget.checked) setWebhook(target);
                  }}
                  onClick={() => {
                    if (webhook && target.id === webhook.id) {
                      setWebhook(undefined);
                    }
                  }}
                  hidden
                />
                <CoolIcon
                  icon={
                    !!webhook && webhook.id === target.id
                      ? "Radio_Fill"
                      : "Radio_Unchecked"
                  }
                  className="ml-auto my-auto text-2xl text-blurple dark:text-blurple-400"
                />
              </label>
            );
          })
        ) : (
          <div>
            {Object.keys(targets).length > 0 &&
              messageLink &&
              messageLink[0] && <p>{t("referenceNoWebhooks")}</p>}
            <Button onClick={() => setAddingTarget(true)}>
              {t("addWebhook")}
            </Button>
          </div>
        )}
      </div>
      <ModalFooter className="flex">
        {!!message?.reference && (
          <TextButton
            className="text-red-400"
            onClick={() => {
              if (message) {
                message.data.webhook_id = undefined;
                message.reference = undefined;
                setData({ ...data });
                setOpen(false);
              }
            }}
          >
            {t("removeMessageLink")}
          </TextButton>
        )}
        <Button
          disabled={!messageLink}
          className="my-auto ltr:ml-auto rtl:mr-2"
          onClick={() => {
            if (messageLink && messageIndex !== undefined) {
              data.messages.splice(messageIndex, 1, {
                ...data.messages[messageIndex],
                reference: messageLink[0]
                  ? `https://discord.com/channels/${messageLink[0]}/${messageLink[1]}/${messageLink[2]}`
                  : messageLink[2],
              });
              setData({ ...data });
              setOpen(false);
            }
          }}
        >
          {t("setMessageLink")}
        </Button>
        <Button
          disabled={!messageLink || !webhook}
          className="my-auto ltr:ml-2 rtl:mr-2"
          discordstyle={ButtonStyle.Secondary}
          onClick={async () => {
            setError(undefined);
            if (messageLink && webhook) {
              if (messageLink[0] && webhook.guild_id !== messageLink[0]) {
                setError("Webhook server ID does not match message link.");
                return;
              }
              if (!webhook.token) {
                setError("Webhook had no token.");
                return;
              }

              let msg = await getWebhookMessage(
                webhook.id,
                webhook.token,
                messageLink[2],
              );
              let threadId: string | undefined;
              if (
                "code" in msg &&
                msg.code === RESTJSONErrorCodes.UnknownMessage &&
                messageLink[1]
              ) {
                console.log(
                  `Message ID ${messageLink[2]} not found in webhook channel, trying again with ${messageLink[1]} as thread ID`,
                );
                msg = await getWebhookMessage(
                  webhook.id,
                  webhook.token,
                  messageLink[2],
                  messageLink[1],
                );
                // Success, save the thread ID in the query data so we don't
                // need to do this again while editing
                if (msg.id) threadId = messageLink[1];
              }
              if ("message" in msg) {
                setError(msg.message as string);
                return;
              }
              if (messageIndex !== undefined) {
                data.messages.splice(messageIndex, 1, {
                  data: {
                    content: msg.content,
                    embeds: msg.embeds,
                    attachments: msg.attachments,
                    webhook_id: msg.webhook_id,
                    components: msg.components,
                  },
                  thread_id: threadId,
                  reference: messageLink[0]
                    ? `https://discord.com/channels/${messageLink[0]}/${messageLink[1]}/${messageLink[2]}`
                    : messageLink[2],
                });

                setData({ ...data });
                await loadMessageComponents(data, setData);
                setOpen(false);
              }
            }
          }}
        >
          {t("overwriteMessage")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
