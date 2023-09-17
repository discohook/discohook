import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { APIWebhook } from "discord-api-types/v10";
import { useReducer, useState } from "react";
import { Button } from "~/components/Button";
import { TextArea } from "~/components/TextArea";
import { Message } from "~/components/preview/Message";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { INDEX_FAILURE_MESSAGE, INDEX_MESSAGE } from "~/util/constants";
import { cdn } from "~/util/discord";
import { base64Decode } from "~/util/text";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Boogiehook" },
    {
      name: "description",
      content: "The funkiest webhook interface since Discohook.",
    },
  ];
};

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  let parsed;
  try {
    parsed = ZodQueryData.safeParse(
      JSON.parse(
        searchParams.get("data")
          ? base64Decode(searchParams.get("data") ?? "{}") ?? "{}"
          : JSON.stringify({ messages: [INDEX_MESSAGE] })
      )
    );
  } catch {
    parsed = {};
  }
  const [data, setData] = useState<QueryData>(
    parsed.success
      ? { version: "d2", ...(parsed.data as QueryData) }
      : { version: "d2", messages: [INDEX_FAILURE_MESSAGE] }
  );

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD } as Targets),
    {}
  );
  const [addingTarget, setAddingTarget] = useState(false);
  const [settingMessageIndex, setSettingMessageIndex] = useState<number>();

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen">
      <TargetAddModal
        open={addingTarget}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
      />
      <MessageSetModal
        open={settingMessageIndex !== undefined}
        setOpen={() => setSettingMessageIndex(undefined)}
        targets={targets}
        setAddingTarget={setAddingTarget}
        data={data}
        setData={setData}
        messageIndex={settingMessageIndex}
      />
      <div className="md:flex h-full">
        <div className="p-4 md:w-1/2 overflow-y-auto">
          {Object.values(targets).map((webhook) => {
            const avatarUrl = webhook.avatar
              ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
              : cdn.defaultAvatar(5);

            return (
              <div
                key={`target-${webhook.id}`}
                className="flex rounded bg-gray-300 p-2 mb-2"
              >
                <img
                  className="rounded-full mr-4 h-12 my-auto"
                  src={avatarUrl}
                />
                <div className="my-auto grow">
                  <p className="font-semibold">{webhook.name}</p>
                  <p className="text-sm leading-none">
                    {webhook.user?.username}
                  </p>
                </div>
              </div>
            );
          })}
          <Button
            onClick={() => setAddingTarget(true)}
            disabled={Object.keys(targets).length >= 10}
          >
            Add Webhook
          </Button>
          {data.messages.map((message, i) => {
            return (
              <div key={`edit-message-${i}`} className="mt-4">
                <div className="font-semibold text-base flex">
                  Message #{i + 1}
                  <div className="ml-auto space-x-1"></div>
                </div>
                <div className="rounded bg-gray-100 p-2 mt-1 space-y-2">
                  <TextArea
                    label="Content"
                    className="w-full h-40"
                    value={message.data.content ?? undefined}
                    maxLength={2000}
                    onInput={(e) => {
                      message.data.content = e.currentTarget.value;
                      setData({ ...data });
                    }}
                  />
                  <Button onClick={() => setSettingMessageIndex(i)}>
                    Set Reference
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="md:border-l-2 border-l-gray-400 p-4 md:w-1/2 overflow-y-auto">
          {data.messages.map((message, i) => (
            <Message key={`preview-message-${i}`} message={message.data} />
          ))}
        </div>
      </div>
    </div>
  );
}
