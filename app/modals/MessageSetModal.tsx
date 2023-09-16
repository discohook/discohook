import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { Modal, ModalProps } from "./Modal";
import { ReactNode, useState } from "react";
import { TextInput } from "~/components/TextInput";
import { MESSAGE_REF_RE } from "~/util/constants";
import { cdn, getWebhookMessage } from "~/util/discord";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { QueryData } from "~/types/QueryData";

export const MessageSetModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    setAddingTarget: (open: boolean) => void;
    data: QueryData;
    setData: React.Dispatch<React.SetStateAction<QueryData>>;
    messageIndex?: number;
  }
) => {
  const { targets, setAddingTarget, data, setData, messageIndex } = props;

  const [webhook, setWebhook] = useState<(typeof targets)[string]>();
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
      : true
  );

  return (
    <Modal title="Set Message" {...props} setOpen={setOpen}>
      <div>
        <TextInput
          label="Message Link"
          className="w-full"
          errors={[error]}
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
                </>
              );
              return;
            }
            setMessageLink([match[1], match[2], match[3]]);
          }}
        />
      </div>
      <hr className="border border-gray-400 my-4" />
      <p className="text-sm font-medium">Webhook</p>
      <div className="space-y-1">
        {Object.keys(possibleWebhooks).length > 0 ? (
          Object.entries(possibleWebhooks).map(([targetId, target]) => {
            return (
              <button
                key={`target-${targetId}`}
                className="flex rounded bg-gray-200 py-2 px-4 w-full"
                onClick={() => setWebhook(target)}
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
                <CoolIcon
                  icon={
                    webhook?.id === targetId ? "Radio_Fill" : "Radio_Unchecked"
                  }
                  className="ml-auto my-auto text-2xl text-blurple"
                />
              </button>
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
                  messageLink[2]
                );
                if ("code" in msg && msg.code === 10008 && messageLink[1]) {
                  msg = await getWebhookMessage(
                    webhook.id,
                    webhook.token!,
                    messageLink[2],
                    messageLink[1]
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
        </div>
      </div>
    </Modal>
  );
};
