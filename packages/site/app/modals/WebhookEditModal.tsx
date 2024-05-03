import { Form, Link } from "@remix-run/react";
import { APIWebhook, RESTPatchAPIWebhookJSONBody } from "discord-api-types/v10";
import { useEffect, useReducer } from "react";
import { Trans, useTranslation } from "react-i18next";
import { z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { ChannelSelect } from "~/components/ChannelSelect";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Markdown, linkClassName } from "~/components/preview/Markdown";
import { User } from "~/session.server";
import { CacheManager, ResolvableAPIChannel } from "~/util/cache/CacheManager";
import { cdn, modifyWebhook } from "~/util/discord";
import { getUserTag } from "~/util/users";
import { Modal, ModalProps } from "./Modal";

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
    ["text", "voice", "forum"].includes(c.type),
  );

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

  return (
    <Modal title={t("editWebhook")} {...props}>
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
          updateTargets({ [webhook.id]: result });
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
                      .includes(file.name.split(".").slice(-1)[0])
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
                  name="channelId"
                  channels={channels}
                  value={channels.find((c) => c.id === payload.channelId)}
                  onChange={(o) => updatePayload({ channelId: o?.id })}
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
                    <Markdown
                      content={t("webhookChannelMentionAndThreads", {
                        replace: [webhook.channel_id],
                      })}
                      features="full"
                      cache={cache}
                    />
                    <p>
                      <Trans
                        t={t}
                        i18nKey="cannotChangeChannel"
                        components={[
                          <Link
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
        <div className="flex w-full mt-4">
          <Button type="submit" className="mx-auto">
            {t("save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
