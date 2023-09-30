import { APIWebhook } from "discord-api-types/v10";
import { useEffect, useReducer } from "react";
import LocalizedStrings from "react-localization";
import { z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { TextInput } from "~/components/TextInput";
import { User } from "~/session.server";
import { cdn, modifyWebhook } from "~/util/discord";
import { getUserTag } from "~/util/users";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "Edit Webhook",
    name: "Name",
    channel: "Channel",
    cannotChangeChannel: "Webhook channel must be set inside Discord.",
    requestedBy: "Requested on Boogiehook by {0}",
    resetAvatar: "Remove",
    save: "Save",
  },
  // fr: {
  //   resetAvatar: "Supprimer",
  // },
});

export const WebhookEditModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    updateTargets: React.Dispatch<Partial<Record<string, APIWebhook>>>;
    webhookId: string | undefined;
    user?: User | null;
  }
) => {
  const { webhookId, targets, updateTargets, user } = props;
  const webhook = webhookId ? targets[webhookId] : undefined;

  type Payload = { name?: string; avatarUrl?: string | null };
  const [payload, updatePayload] = useReducer(
    (d: Payload, partialD: Partial<Payload>) => ({ ...d, ...partialD }),
    {}
  );
  useEffect(() => {
    if (webhook) {
      updatePayload({
        name: webhook.name ?? "",
        avatarUrl: webhook.avatar
          ? cdn.avatar(webhook.id, webhook.avatar)
          : undefined,
      });
    }
  }, [webhook]);

  return (
    <Modal title={strings.title} {...props}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!webhook || !webhook.token) return;

          const body = new FormData(e.currentTarget);
          const parsed = await zx.parseFormSafe(body, {
            name: z.ostring(),
            avatar: z.ostring(),
          });
          if (!parsed.success) {
            return;
          }

          const result = await modifyWebhook(
            webhook.id,
            webhook.token,
            {
              ...parsed.data,
              avatar: payload.avatarUrl === null ? null : parsed.data.avatar,
            },
            strings
              .formatString(
                strings.requestedBy,
                user ? getUserTag(user) : "anonymous"
              )
              .toString()
          );
          updateTargets({ [webhook.id]: result });
        }}
      >
        <div className="flex">
          <div className="my-auto mr-6 shrink-0">
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
                    const result = e.target!.result as string;
                    document.querySelector<HTMLInputElement>(
                      'input[name="avatar"]'
                    )!.value = result;
                    updatePayload({ avatarUrl: result });
                  };
                  reader.readAsDataURL(file);
                }}
                hidden
              />
              <img
                src={payload.avatarUrl ?? cdn.defaultAvatar(5)}
                className="rounded-full h-24 w-24"
              />
              <div className="absolute top-0 left-0 rounded-full h-24 w-24 bg-black/50 opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute top-0 right-0 rounded-full p-1 px-2 flex dark:bg-white">
                <CoolIcon
                  icon="Image_01"
                  className="m-auto dark:text-gray-500 text-xl"
                />
              </div>
            </label>
            {payload.avatarUrl && (
              <div className="w-full flex mt-2">
                <button
                  className="font-medium text-sm text-[#006ce7] dark:text-[#00a8fc] hover:underline mx-auto"
                  onClick={() => {
                    updatePayload({ avatarUrl: null });
                    const input = document.querySelector<HTMLInputElement>(
                      'input[name="avatar"]'
                    );
                    if (input) input.value = "";
                  }}
                >
                  {strings.resetAvatar}
                </button>
              </div>
            )}
          </div>
          <div className="grow space-y-2">
            <TextInput
              label={strings.name}
              name="name"
              maxLength={80}
              value={payload.name ?? ""}
              onInput={(e) => updatePayload({ name: e.currentTarget.value })}
              className="w-full"
            />
            <TextInput
              label={strings.channel}
              description={strings.cannotChangeChannel}
              value={webhook?.channel_id ?? ""}
              className="w-full"
              readOnly
            />
          </div>
        </div>
        <div className="flex w-full mt-4">
          <Button className="mx-auto">{strings.save}</Button>
        </div>
      </form>
    </Modal>
  );
};
