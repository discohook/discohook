import { calculateUserDefaultAvatarIndex } from "@discordjs/rest";
import { Form, Link } from "@remix-run/react";
import {
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
import { TargetType } from "~/types/QueryData-raw";
import type {
  CacheManager,
  ResolvableAPIChannel,
} from "~/util/cache/CacheManager";
import { cdn, modifyWebhook } from "~/util/discord";
import {
  FLUXER_API,
  FLUXER_API_V,
  fluxerDefaultAvatarUrl,
  fluxerWebhookAvatarUrl,
  updateFluxerWebhook,
} from "~/util/fluxer";
import { cycleCopyText } from "~/util/text";
import { getUserTag } from "~/util/users";
import type {
  DraftTargetFluxerWebhook,
  DraftTargetWebhook,
  TargetKey,
  TargetMap,
} from "./MessageSendModal";
import { Modal, ModalFooter, type ModalProps, PlainModalHeader } from "./Modal";

export const TargetEditModal = (
  props: ModalProps & {
    targets: TargetMap;
    updateTargets: React.Dispatch<Partial<TargetMap>>;
    targetKey: TargetKey | undefined;
    submit?: (payload: RESTPatchAPIWebhookJSONBody) => void;
    user?: User | null;
    cache?: CacheManager;
    channels?: ResolvableAPIChannel[];
  },
) => {
  const { t } = useTranslation();
  const { targetKey, targets, updateTargets, user, cache } = props;
  const target = targetKey ? targets[targetKey] : undefined;
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
    if (target) {
      switch (target.type) {
        case TargetType.Webhook:
          updatePayload({
            name: target.webhook.name ?? "",
            avatarUrl: target.webhook.avatar
              ? cdn.avatar(target.webhook.id, target.webhook.avatar)
              : undefined,
            channelId: target.webhook.channel_id,
          });
          break;
        // We need to store profile data with these
        // case TargetType.Bot:
        //   break;
        case TargetType.FluxerWebhook:
          updatePayload({
            name: target.webhook.name ?? "",
            avatarUrl: target.webhook.avatar
              ? fluxerWebhookAvatarUrl(target.webhook)
              : undefined,
            channelId: target.webhook.channel_id,
          });
          break;
        default:
          break;
      }
    }
  }, [target]);

  const computed = useMemo(() => {
    if (target) {
      switch (target.type) {
        case TargetType.Webhook:
          return {
            defaultAvatarUrl: cdn.defaultAvatar(
              calculateUserDefaultAvatarIndex(target.webhook.id),
            ),
            secret: target.webhook.token
              ? `${RouteBases.api}${Routes.webhook(target.webhook.id, target.webhook.token)}`
              : target.webhook.url,
          };
        case TargetType.Bot:
          return { secret: target.token };
        case TargetType.FluxerWebhook:
          return {
            defaultAvatarUrl: fluxerDefaultAvatarUrl(target.id),
            secret: `${FLUXER_API}/v${FLUXER_API_V}/webhooks/${target.id}/${target.token}`,
          };
        default:
          break;
      }
    }
  }, [target]);

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
          if (!parsed.success) return;

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

          if (!target) return;
          if (target.type === TargetType.Webhook) {
            if (!target.webhook.token) return;
            const result = await modifyWebhook(
              target.webhook.id,
              target.webhook.token,
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
            updateTargets({
              [`${TargetType.Webhook}:${target.webhook.id}`]: {
                type: TargetType.Webhook,
                webhook: result,
              } satisfies DraftTargetWebhook,
            });
            setUploadedAvatarSize(null);
          } else if (target.type === TargetType.FluxerWebhook) {
            if (!target.webhook.token) return;
            const result = await updateFluxerWebhook(
              target.webhook.id,
              target.webhook.token,
              {
                ...parsed.data,
                avatar:
                  payload.avatarUrl === null
                    ? null
                    : !parsed.data.avatar
                      ? undefined
                      : parsed.data.avatar,
              },
              // user ? getUserTag(user) : "anonymous",
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
            updateTargets({
              [`${TargetType.FluxerWebhook}:${target.webhook.id}`]: {
                type: TargetType.FluxerWebhook,
                id: result.id,
                token: result.token,
                webhook: result,
              } satisfies DraftTargetFluxerWebhook,
            });
            setUploadedAvatarSize(null);
          }
        }}
      >
        <div className="flex">
          <div className="my-auto me-6 shrink-0">
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
                src={payload.avatarUrl ?? computed?.defaultAvatarUrl}
                className="rounded-full size-24"
                alt=""
              />
              <div className="absolute top-0 left-0 rounded-full size-24 bg-black/50 opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute top-0 end-0 rounded-full p-1 px-2 flex dark:bg-white">
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
            {target && target.type === TargetType.Webhook ? (
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
                ) : cache ? (
                  // @ts-expect-error
                  <div style={{ "--font-size": "1rem" }}>
                    {
                      // Don't resolve the channel unnecessarily
                      props.open && (
                        <Markdown
                          content={t("webhookChannelMentionAndThreads", {
                            replace: [target.webhook.channel_id],
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
                            to={`/s/${target.webhook.guild_id}?t=webhooks`}
                            className={linkClassName}
                            target="_blank"
                          />,
                        ]}
                      />
                    </p>
                  </div>
                ) : (
                  <p>ID: {target.webhook?.channel_id}</p>
                )}
              </div>
            ) : null}
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
          {computed?.secret ? (
            <Button
              className="ms-2"
              discordstyle={ButtonStyle.Secondary}
              onClick={(e) =>
                cycleCopyText(
                  // biome-ignore lint/style/noNonNullAssertion: ternary above
                  computed.secret!,
                  t,
                  e.currentTarget,
                  "copyWebhookUrl",
                )
              }
            >
              {t("copyWebhookUrl")}
            </Button>
          ) : null}
        </ModalFooter>
      </Form>
    </Modal>
  );
};
