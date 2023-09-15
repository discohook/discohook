import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { Modal, ModalProps } from "./Modal";
import { ReactNode, useState } from "react";
import { TextInput } from "~/components/TextInput";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { cdn, getSnowflakeDate, getWebhook } from "~/util/discord";
import { Button } from "~/components/Button";

export const TargetAddModal = (
  props: ModalProps & {
    updateTargets: React.Dispatch<Partial<Record<string, APIWebhook>>>;
  }
) => {
  const [webhook, setWebhook] = useState<APIWebhook>();
  const [error, setError] = useState<ReactNode>();

  const avatarUrl = webhook
    ? webhook.avatar
      ? cdn.avatar(webhook.id, webhook.avatar, { size: 128 })
      : cdn.defaultAvatar(1)
    : null;

  const setOpen = (s: boolean) => {
    props.setOpen(s);
    if (!s) setWebhook(undefined);
  };

  return (
    <Modal title="Add Target" {...props} setOpen={setOpen}>
      <div>
        <TextInput
          label="Webhook URL"
          className="w-full"
          errors={[error]}
          delayOnInput={200}
          onInput={async (e) => {
            setError(undefined);
            setWebhook(undefined);
            if (!e.currentTarget.value) return;

            const match = e.currentTarget.value.match(WEBHOOK_URL_RE);
            if (!match) {
              setError(
                <>
                  Invalid webhook URL. They start with{" "}
                  https://discord.com/api/webhooks/...
                </>
              );
              return;
            }

            const webhook = await getWebhook(match[1], match[2]);
            if (webhook.id) {
              setWebhook(webhook);
            } else if ("message" in webhook) {
              setError(webhook.message as string);
            }
          }}
        />
      </div>
      <hr className="border border-gray-400 my-4" />
      <div className={`flex py-4 ${!webhook ? "animate-pulse" : ""}`}>
        <div className="w-1/3 mr-4 my-auto">
          {avatarUrl ? (
            <img
              className="rounded-full h-24 w-24 m-auto"
              src={avatarUrl}
              alt={webhook!.name ?? "Webhook"}
            />
          ) : (
            <div className="rounded-full h-24 w-24 bg-gray-400 m-auto" />
          )}
        </div>
        <div className="grow">
          {webhook ? (
            <>
              <p className="font-bold text-xl">{webhook.name}</p>
              <p>
                Created {getSnowflakeDate(webhook.id).toLocaleDateString()} by{" "}
                {webhook?.user ? webhook.user.username : "someone"}
              </p>
              <hr className="border border-gray-400 my-2" />
              <p>
                Channel ID{" "}
                <a
                  className="hover:underline"
                  href={`https://discord.com/channels/${webhook.guild_id}/${webhook.channel_id}`}
                  target="_blank"
                >
                  {webhook.channel_id}
                </a>
              </p>
              <p>
                Server ID{" "}
                <a
                  className="hover:underline"
                  href={`https://discord.com/channels/${webhook.guild_id}`}
                  target="_blank"
                >
                  {webhook.guild_id}
                </a>
              </p>
            </>
          ) : (
            <div>
              <div className="h-5 rounded-full bg-gray-400 w-1/3" />
              <div className="h-4 rounded-full bg-gray-400 mt-1 w-1/2" />
              <hr className="border border-gray-400 my-4" />
              <div className="h-4 rounded-full bg-gray-400 mt-1 w-4/6" />
              <div className="h-4 rounded-full bg-gray-400 mt-1 w-3/6" />
            </div>
          )}
        </div>
      </div>
      <div className="flex mt-4">
        <Button
          className="mx-auto"
          disabled={!webhook}
          onClick={() => {
            if (webhook) {
              props.updateTargets({ [webhook.id]: webhook });
              setOpen(false);
            }
          }}
        >
          Add Webhook
        </Button>
      </div>
    </Modal>
  );
};
