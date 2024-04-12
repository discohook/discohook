import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { QueryData } from "~/types/QueryData";
import { MESSAGE_REF_RE } from "~/util/constants";
import { cdn, getWebhookMessage } from "~/util/discord";
import { Modal, ModalProps } from "./Modal";

export const MessageSetModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    setAddingTarget: (open: boolean) => void;
    data: QueryData;
    setData: React.Dispatch<React.SetStateAction<QueryData>>;
    messageIndex?: number;
  },
) => {
  const { targets, setAddingTarget, data, setData, messageIndex } = props;
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
    <Modal title="Set Message Reference" {...props} setOpen={setOpen}>
      <div>
        <TextInput
          label="Message Link"
          className="w-full"
          errors={[error]}
          defaultValue={message?.reference}
          onInput={async (e) => {
            setError(undefined);
            setMessageLink(undefined);
            if (!e.currentTarget.value) return;

            const match = e.currentTarget.value.match(MESSAGE_REF_RE);
            if (!match) {
              setError(
                <>
                  Invalid message link. They start with{" "}
                  https://discord.com/channels/... and have three sets of
                  numbers.
                </>,
              );
              return;
            }
            setMessageLink([match[1], match[2], match[3]]);
          }}
        />
      </div>
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <p className="text-sm font-medium">Webhook</p>
      <div className="space-y-1">
        {Object.keys(possibleWebhooks).length > 0 ? (
          Object.entries(possibleWebhooks).map(([targetId, target]) => {
            return (
              <label
                key={`target-${targetId}`}
                className="flex rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 hover:dark:bg-gray-600 transition py-2 px-4 w-full cursor-pointer"
              >
                <img
                  src={
                    target.avatar
                      ? cdn.avatar(target.id, target.avatar, { size: 64 })
                      : cdn.defaultAvatar(5)
                  }
                  alt={target.name ?? "Webhook"}
                  className="rounded-full h-12 w-12 mr-2 my-auto"
                />
                <div className="my-auto grow text-left">
                  <p className="font-semibold text-base">
                    {target.name ?? "Webhook"}
                  </p>
                  <p className="text-sm leading-none">
                    Channel ID {target.channel_id}
                  </p>
                </div>
                <input
                  type="radio"
                  name="webhook"
                  checked={!!webhook && target.id === webhook.id}
                  onChange={(e) => {
                    if (e.currentTarget.checked) setWebhook(target);
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
              messageLink[0] && (
                <p>
                  You haven't added any webhooks that match the message link you
                  provided. To overwrite or edit, you will need to add the
                  correct webhook.
                </p>
              )}
            <Button onClick={() => setAddingTarget(true)}>Add Webhook</Button>
          </div>
        )}
      </div>
      <div className="flex mt-4">
        <div className="mx-auto space-x-2">
          <Button
            disabled={!messageLink}
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
            Set Reference
          </Button>
          <Button
            disabled={!messageLink || !webhook}
            discordstyle={ButtonStyle.Secondary}
            onClick={async () => {
              if (messageLink && webhook) {
                if (messageLink[0] && webhook.guild_id !== messageLink[0]) {
                  setError("Webhook server ID does not match message link.");
                }
                let msg = await getWebhookMessage(
                  webhook.id,
                  webhook.token!,
                  messageLink[2],
                );
                if ("code" in msg && msg.code === 10008 && messageLink[1]) {
                  console.log(
                    `Message ID ${messageLink[2]} not found in webhook channel, trying again with ${messageLink[1]} as thread ID`,
                  );
                  msg = await getWebhookMessage(
                    webhook.id,
                    webhook.token!,
                    messageLink[2],
                    messageLink[1],
                  );
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
                    },
                    reference: messageLink[0]
                      ? `https://discord.com/channels/${messageLink[0]}/${messageLink[1]}/${messageLink[2]}`
                      : messageLink[2],
                  });
                  setData({ ...data });
                  setOpen(false);
                }
              }
            }}
          >
            Overwrite Message
          </Button>
          <Button
            disabled={!message?.reference}
            discordstyle={ButtonStyle.Danger}
            onClick={() => {
              if (message) {
                message.data.webhook_id = undefined;
                message.reference = undefined;
                setData({ ...data });
                setOpen(false);
              }
            }}
          >
            Remove Reference
          </Button>
        </div>
      </div>
    </Modal>
  );
};
