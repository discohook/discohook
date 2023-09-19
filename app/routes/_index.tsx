import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { MessageEditor } from "~/components/editor/MessageEditor";
import { Message } from "~/components/preview/Message";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { PreviewDisclaimerModal } from "~/modals/PreviewDisclaimerModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { INDEX_FAILURE_MESSAGE, INDEX_MESSAGE } from "~/util/constants";
import { cdn } from "~/util/discord";
import { base64Decode, base64Encode } from "~/util/text";

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
  useEffect(() => {
    setSearchParams(
      { data: base64Encode(JSON.stringify(data)) },
      { replace: true, preventScrollReset: true }
    );
  }, [data]);

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD } as Targets),
    {}
  );
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [addingTarget, setAddingTarget] = useState(false);
  const [settingMessageIndex, setSettingMessageIndex] = useState<number>();

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen overflow-hidden">
      <PreviewDisclaimerModal
        open={showDisclaimer}
        setOpen={setShowDisclaimer}
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
      <TargetAddModal
        open={addingTarget}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
      />
      <Header />
      <div className="md:flex h-[calc(100%_-_3rem)]">
        <div
          className={`p-4 md:w-1/2 h-full overflow-y-scroll ${
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
          {data.messages.map((message, i) => (
            <MessageEditor
              key={`edit-message-${i}`}
              message={message}
              index={i}
              data={data}
              setData={setData}
              setSettingMessageIndex={setSettingMessageIndex}
            />
          ))}
        </div>
        <div
          className={`md:border-l-2 border-l-gray-400 p-4 md:w-1/2 h-full overflow-y-scroll relative ${
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
          <Button
            className="fixed bottom-4 right-4"
            discordstyle={ButtonStyle.Secondary}
            onClick={() => setShowDisclaimer(true)}
          >
            <CoolIcon icon="Info" className="mr-1.5" />
            Preview Info
          </Button>
        </div>
      </div>
    </div>
  );
}
