import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { ReactNode, useEffect, useState } from "react";
import LocalizedStrings from "react-localization";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { cdn, getSnowflakeDate, getWebhook } from "~/util/discord";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "Add Target",
    webhookUrl: "Webhook URL",
    invalidWebhookUrl:
      "Invalid webhook URL. They start with https://discord.com/api/webhooks/...",
    createdAtBy: "Created {0} by {1}",
    someone: "someone",
    channelId: "Channel ID: {0}",
    guildId: "Server ID: {0}",
    addWebhook: "Add Webhook",
    createWebhook: "Create Webhook",
  },
});

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
      : cdn.defaultAvatar(5)
    : null;

  const setOpen = (s: boolean) => {
    props.setOpen(s);
    if (!s) setWebhook(undefined);
  };

  useEffect(() => {
    // @ts-ignore
    window.handlePopupClose = (result: APIWebhook) => {
      props.updateTargets({ [result.id]: result });
      setOpen(false);
    };
  }, [webhook]);

  return (
    <Modal title={strings.title} {...props} setOpen={setOpen}>
      <div>
        <TextInput
          label={strings.webhookUrl}
          type="password"
          className="w-full"
          errors={[error]}
          onFocus={(e) => (e.currentTarget.type = "text")}
          onBlur={(e) => (e.currentTarget.type = "password")}
          delayOnInput={200}
          onInput={async (e) => {
            setError(undefined);
            setWebhook(undefined);
            if (!e.currentTarget.value) return;

            const match = e.currentTarget.value.match(WEBHOOK_URL_RE);
            if (!match) {
              setError(strings.invalidWebhookUrl);
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
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <div className={`flex py-4 ${!webhook ? "animate-pulse" : ""}`}>
        <div className="w-1/3 mr-4 my-auto">
          {avatarUrl ? (
            <img
              className="rounded-full h-24 w-24 m-auto"
              src={avatarUrl}
              alt={webhook!.name ?? "Webhook"}
            />
          ) : (
            <div className="rounded-full h-24 w-24 bg-gray-400 dark:bg-gray-600 m-auto" />
          )}
        </div>
        <div className="grow">
          {webhook ? (
            <>
              <p className="font-bold text-xl">{webhook.name}</p>
              <p>
                {strings.formatString(
                  strings.createdAtBy,
                  getSnowflakeDate(webhook.id).toLocaleDateString(),
                  webhook?.user ? webhook.user.username : strings.someone
                )}
              </p>
              <hr className="border border-gray-400 dark:border-gray-600 my-2" />
              <p className="text-gray-500 hover:text-gray-700 dark:text-gray-500 hover:dark:text-gray-500 transition">
                {strings.formatString(
                  strings.channelId,
                  <a
                    className="hover:underline"
                    href={`https://discord.com/channels/${webhook.guild_id}/${webhook.channel_id}`}
                    target="_blank"
                  >
                    {webhook.channel_id}
                  </a>
                )}
              </p>
              <p className="text-gray-500 hover:text-gray-700 dark:text-gray-500 hover:dark:text-gray-500 transition">
                {strings.formatString(
                  strings.guildId,
                  <a
                    className="hover:underline"
                    href={`https://discord.com/channels/${webhook.guild_id}`}
                    target="_blank"
                  >
                    {webhook.guild_id}
                  </a>
                )}
              </p>
            </>
          ) : (
            <div>
              <div className="h-5 rounded-full bg-gray-400 dark:bg-gray-600 w-1/3" />
              <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-1/2" />
              <hr className="border border-gray-400 dark:border-gray-600 my-4" />
              <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-4/6" />
              <div className="h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-3/6" />
            </div>
          )}
        </div>
      </div>
      <div className="flex mt-4">
        <div className="mx-auto space-x-2">
          <Button
            disabled={!webhook}
            onClick={() => {
              if (webhook) {
                props.updateTargets({ [webhook.id]: webhook });
                setOpen(false);
              }
            }}
          >
            {strings.addWebhook}
          </Button>
          <Button
            discordstyle={ButtonStyle.Link}
            onClick={() =>
              window.open(
                "/auth/discord-webhook",
                "_blank",
                "popup width=530 height=750"
              )
            }
          >
            {strings.createWebhook}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
