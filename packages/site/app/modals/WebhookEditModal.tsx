import { Form, Link } from "@remix-run/react";
import {
  type APIWebhook,
  ButtonStyle,
  type RESTError,
  type RESTPatchAPIWebhookJSONBody,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { useEffect, useMemo, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { z } from "zod/v3";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { ChannelSelect } from "~/components/ChannelSelect";
import { useError } from "~/components/Error";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { InfoBox } from "~/components/InfoBox";
import { linkClassName, Markdown } from "~/components/preview/Markdown";
import { TextInput } from "~/components/TextInput";
import type { User } from "~/session.server";
import type {
  CacheManager,
  ResolvableAPIChannel,
} from "~/util/cache/CacheManager";
import { cdn, modifyWebhook } from "~/util/discord";
import { cycleCopyText } from "~/util/text";
import { getUserTag } from "~/util/users";
import { Modal, ModalFooter, type ModalProps, PlainModalHeader } from "./Modal";

export const WebhookEditModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    updateTargets: React.Dispatch<Partial<Record<string, APIWebhook>>>;
    webhookId: string | undefined;
    submit?: (payload: RESTPatchAPIWebhookJSONBody) => void;
    user?: User | null;
    cache?: CacheManager;
    channels?: ResolvableAPIChannel[];
  },
) => {
  const { t } = useTranslation();
  const { webhookId, targets, updateTargets, user, cache } = props;
  const webhook = webhookId ? targets[webhookId] : undefined;
  const channels = props.channels?.filter((c) =>
    ["text", "voice", "forum", "media"].includes(c.type),
  );
  const [error, setError] = useError(t);

  type Payload = {
    name?: string;
    avatarUrl?: string | null;
    channelId?: string | null;
  };
  const [payload, updatePayload] = useReducer(
    (d: Payload, partialD: Partial<Payload>) => ({ ...d, ...partialD }),
    {},
  );
  useEffect(() => {
    if (webhook) {
      updatePayload({
        name: webhook.name ?? "",
        avatarUrl: webhook.avatar
          ? cdn.avatar(webhook.id, webhook.avatar)
          : undefined,
        channelId: webhook.channel_id,
      });
    }
  }, [webhook]);

  const webhookUrl = useMemo(() => {
    if (webhook) {
      return webhook.token
        ? `${RouteBases.api}${Routes.webhook(webhook.id, webhook.token)}`
        : webhook.url;
    }
  }, [webhook]);

  const [uploadedAvatarSize, setUploadedAvatarSize] = useState<number | null>(
    null,
  );

  return (
    <Modal
      {...props}
      setOpen={(o) => {
        props.setOpen(o);
        if (!o) {
          setError(undefined);
          setUploadedAvatarSize(null);
        }
      }}
    >
      <PlainModalHeader>{t("editWebhook")}</PlainModalHeader>
      {error}
      {uploadedAvatarSize !== null &&
      // https://developer.apple.com/forums/thread/701895 cites "500K", but I
      // was having issues with files as small as 396KB. I was seeing truncation
      // of about 4KB, but we're going to give this warning plenty of room for
      // error. 350KB might be better, given testing.
      // Why not just upload the file normally?: Discord requires that the
      // image data is uploaded as a base64 string in a JSON request.
      // Discohook would need to proxy the request and upload from the server,
      // which may happen in the future.
      uploadedAvatarSize >= 300_000 &&
      navigator.userAgent.includes("Safari") ? (
        <InfoBox icon="File_Upload" severity="yellow">
          {t("safariAvatarTooLarge")}
        </InfoBox>
      ) : null}
      <Form
        onSubmit={async (e) => {
          e.preventDefault();

          const body = new FormData(e.currentTarget);
          const parsed = await zx.parseFormSafe(body, {
            name: z.ostring(),
            avatar: z.ostring(),
            channelId: z.ostring(),
          });
          if (!parsed.success) {
            return;
          }

          if (props.submit) {
            props.submit({
              name: parsed.data.name,
              avatar:
                payload.avatarUrl === null
                  ? null
                  : !parsed.data.avatar
                    ? undefined
                    : parsed.data.avatar,
              channel_id: parsed.data.channelId,
            } satisfies RESTPatchAPIWebhookJSONBody);
            return;
          }

          if (!webhook || !webhook.token) return;
          const result = await modifyWebhook(
            webhook.id,
            webhook.token,
            {
              ...parsed.data,
              avatar:
                payload.avatarUrl === null
                  ? null
                  : !parsed.data.avatar
                    ? undefined
                    : parsed.data.avatar,
            },
            user ? getUserTag(user) : "anonymous",
          );
          if (!result.id) {
            const error = result as unknown as RESTError;
            setError({
              message: `${error.message}: ${JSON.stringify(
                error.errors ?? String(error.code),
              )}`,
            });
            return;
          }
          updateTargets({ [webhook.id]: result });
          setUploadedAvatarSize(null);
        }}
      >
        <div className="flex">
          <div className="my-auto ltr:mr-6 rtl:ml-6 shrink-0">
            <input type="type" name="avatar" readOnly hidden />
            <label className="relative group block cursor-pointer">
              <input
                type="file"
                accept=".jpeg,.jpg,.png,.gif"
                onChange={({ currentTarget }) => {
                  const files = currentTarget.files;
                  if (!files || files.length === 0) return;

                  const file = files[0];
                  if (
                    !currentTarget.accept
                      .split(",")
                      .map((ext) => ext.replace(".", ""))
                      .includes(file.name.split(".").slice(-1)[0].toLowerCase())
                  )
                    return;

                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    const input = document.querySelector<HTMLInputElement>(
                      'input[name="avatar"]',
                    );
                    if (input) input.value = result;
                    updatePayload({ avatarUrl: result });
                  };
                  reader.readAsDataURL(file);
                  setUploadedAvatarSize(file.size);
                }}
                hidden
              />
              <img
                src={payload.avatarUrl ?? cdn.defaultAvatar(5)}
                className="rounded-full h-24 w-24"
                alt=""
              />
              <div className="absolute top-0 left-0 rounded-full h-24 w-24 bg-black/50 opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute top-0 ltr:right-0 rtl:left-0 rounded-full p-1 px-2 flex dark:bg-white">
                <CoolIcon
                  icon="Image_01"
                  className="m-auto dark:text-gray-500 text-xl"
                />
              </div>
            </label>
            {payload.avatarUrl && (
              <div className="w-full flex mt-2">
                <button
                  type="button"
                  className="font-medium text-sm text-[#006ce7] dark:text-[#00a8fc] hover:underline mx-auto"
                  onClick={() => {
                    updatePayload({ avatarUrl: null });
                    setUploadedAvatarSize(null);
                    const input = document.querySelector<HTMLInputElement>(
                      'input[name="avatar"]',
                    );
                    if (input) input.value = "";
                  }}
                >
                  {t("resetAvatar")}
                </button>
              </div>
            )}
          </div>
          <div className="grow space-y-2">
            <TextInput
              label={t("name")}
              name="name"
              maxLength={80}
              value={payload.name ?? ""}
              onInput={(e) => updatePayload({ name: e.currentTarget.value })}
              className="w-full"
            />
            <div>
              <p className="text-sm font-medium">{t("channel")}</p>
              {channels ? (
                <ChannelSelect
                  t={t}
                  name="channelId"
                  channels={channels}
                  value={
                    channels.find((c) => c.id === payload.channelId) ?? null
                  }
                  onChange={(c) => updatePayload({ channelId: c?.id })}
                />
              ) : (
                webhook &&
                (cache ? (
                  <div
                    style={{
                      // @ts-expect-error
                      "--font-size": "1rem",
                    }}
                  >
                    {
                      // Don't resolve the channel unnecessarily
                      props.open && (
                        <Markdown
                          content={t("webhookChannelMentionAndThreads", {
                            replace: [webhook.channel_id],
                          })}
                          features="full"
                          cache={cache}
                        />
                      )
                    }
                    <p>
                      <Trans
                        t={t}
                        i18nKey="cannotChangeChannel"
                        components={[
                          <Link
                            key="0"
                            to={`/s/${webhook.guild_id}?t=webhooks`}
                            className={linkClassName}
                            target="_blank"
                          />,
                        ]}
                      />
                    </p>
                  </div>
                ) : (
                  <p>ID: {webhook?.channel_id}</p>
                ))
              )}
            </div>
          </div>
        </div>
        <ModalFooter className="flex">
          {/*!!webhook?.token && (
            <TextButton className="text-red-400" onClick={() => {}}>
              {t("deleteWebhook")}
            </TextButton>
          )*/}
          <Button type="submit" className="ms-auto">
            {t("save")}
          </Button>
          {!!webhookUrl && (
            <Button
              className="ms-2"
              discordstyle={ButtonStyle.Secondary}
              onClick={(e) =>
                cycleCopyText(webhookUrl, t, e.currentTarget, "copyWebhookUrl")
              }
            >
              {t("copyWebhookUrl")}
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
};
