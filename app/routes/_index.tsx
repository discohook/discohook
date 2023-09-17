import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { APIEmbed, APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useReducer, useState } from "react";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { TextArea } from "~/components/TextArea";
import { TextInput } from "~/components/TextInput";
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
        <div
          className={`p-4 md:w-1/2 overflow-y-auto ${
            tab === "editor" ? "" : "hidden md:block"
          }`}
        >
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
          <div className="flex">
            <Button
              onClick={() => setAddingTarget(true)}
              disabled={Object.keys(targets).length >= 10}
            >
              Add Webhook
            </Button>
            <Button
              className="ml-auto md:hidden"
              onClick={() => setTab("preview")}
              discordstyle={ButtonStyle.Secondary}
            >
              Preview <CoolIcon icon="Chevron_Right" />
            </Button>
          </div>
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
                  {message.data.embeds && message.data.embeds.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {message.data.embeds.map((embed, ei) => {
                        const updateEmbed = (partialEmbed: Partial<APIEmbed>) =>
                          setData({
                            ...data,
                            messages: data.messages.splice(i, 1, {
                              ...message,
                              data: {
                                ...message.data,
                                embeds: message.data.embeds!.splice(ei, 1, {
                                  ...embed,
                                  ...partialEmbed,
                                }),
                              },
                            }),
                          });
                        return (
                          <div
                            key={`edit-message-${i}-embed-${ei}`}
                            className="rounded p-4 bg-gray-400"
                          >
                            <div className="flex">
                              <div className="grow">
                                <TextInput
                                  label="Title"
                                  className="w-full"
                                  maxLength={256}
                                  value={embed.title}
                                  onInput={(e) =>
                                    updateEmbed({
                                      title: e.currentTarget.value,
                                    })
                                  }
                                />
                              </div>
                              {embed.url === undefined && (
                                <Button
                                  className="ml-2 mt-auto shrink-0"
                                  onClick={() =>
                                    updateEmbed({ url: location.origin })
                                  }
                                >
                                  Add URL
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-2 mt-2">
                              {embed.url !== undefined && (
                                <div className="flex">
                                  <div className="grow">
                                    <TextInput
                                      label="Title URL"
                                      className="w-full"
                                      type="url"
                                      value={embed.url}
                                      onInput={(e) =>
                                        updateEmbed({
                                          url: e.currentTarget.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <Button
                                    className="ml-2 mt-auto shrink-0"
                                    onClick={() =>
                                      updateEmbed({ url: undefined })
                                    }
                                  >
                                    Remove
                                    <span className="hidden sm:inline">
                                      {" "}
                                      URL
                                    </span>
                                  </Button>
                                </div>
                              )}
                              <TextInput
                                label="Sidebar Color"
                                className="w-full"
                                value={
                                  embed.color
                                    ? `#${embed.color.toString(16)}`
                                    : undefined
                                }
                                onInput={(e) =>
                                  updateEmbed({
                                    color: e.currentTarget.value
                                      ? Number(e.currentTarget.value)
                                      : undefined,
                                  })
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Button onClick={() => setSettingMessageIndex(i)}>
                    Set Reference
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={`md:border-l-2 border-l-gray-400 p-4 md:w-1/2 overflow-y-auto ${
            tab === "preview" ? "" : "hidden md:block"
          }`}
        >
          <div className="md:hidden">
            <Button
              onClick={() => setTab("editor")}
              discordstyle={ButtonStyle.Secondary}
            >
              <CoolIcon icon="Chevron_Left" /> Editor
            </Button>
            <hr className="border border-gray-400 my-4" />
          </div>
          {data.messages.map((message, i) => (
            <Message key={`preview-message-${i}`} message={message.data} />
          ))}
        </div>
      </div>
    </div>
  );
}
