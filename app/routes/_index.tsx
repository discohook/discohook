import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import LocalizedStrings from "react-localization";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { MessageEditor } from "~/components/editor/MessageEditor";
import { Message } from "~/components/preview/Message";
import { AuthFailureModal } from "~/modals/AuthFaillureModal";
import { AuthSuccessModal } from "~/modals/AuthSuccessModal";
import { ImageModal, ImageModalProps } from "~/modals/ImageModal";
import { MessageSendModal } from "~/modals/MessageSendModal";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { PreviewDisclaimerModal } from "~/modals/PreviewDisclaimerModal";
import { ShareCreateModal } from "~/modals/ShareCreateModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { getUser } from "~/session.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { INDEX_FAILURE_MESSAGE, INDEX_MESSAGE } from "~/util/constants";
import { cdn } from "~/util/discord";
import { base64Decode, base64Encode } from "~/util/text";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return { user };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Boogiehook" },
    {
      name: "description",
      content:
        "Free, intuitive interface for creating webhook messages in your Discord server.",
    },
    {
      property: "og:image",
      content: "logos/boogiehook_512w.png",
    },
  ];
};

const strings = new LocalizedStrings({
  en: {
    editor: "Editor",
    preview: "Preview",
    send: "Send",
    shareMessage: "Share Message",
    addWebhook: "Add Webhook",
    addMessage: "Add Message",
    previewInfo: "Preview Info",
  },
});

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const defaultModal = searchParams.get("m");

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
  const [urlTooLong, setUrlTooLong] = useState(false);

  useEffect(() => {
    const encoded = base64Encode(JSON.stringify(data));
    // URLs on Cloudflare are limited to 16KB
    const fullUrl = new URL(
      location.origin + location.pathname + `?data=${encoded}`
    );
    if (fullUrl.toString().length >= 16000) {
      setUrlTooLong(true);
      if (searchParams.get("data")) {
        const urlWithoutQuery = location.origin + location.pathname;
        history.pushState({ path: urlWithoutQuery }, "", urlWithoutQuery);
      }
    } else {
      setUrlTooLong(false);
      history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
    }
  }, [data]);

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD } as Targets),
    {}
  );
  const [showDisclaimer, setShowDisclaimer] = useState(
    defaultModal === "preview"
  );
  const [addingTarget, setAddingTarget] = useState(
    defaultModal === "add-target"
  );
  const [settingMessageIndex, setSettingMessageIndex] = useState<
    number | undefined
  >(
    defaultModal && defaultModal.startsWith("set-reference")
      ? Number(defaultModal.split("-")[2])
      : undefined
  );
  const [imageModalData, setImageModalData] = useState<ImageModalProps>();
  const [authSuccessOpen, setAuthSuccessOpen] = useState(
    defaultModal === "auth-success"
  );
  const [authFailureOpen, setAuthFailureOpen] = useState(
    defaultModal === "auth-failure"
  );
  const [sendingMessages, setSendingMessages] = useState(
    defaultModal === "submit"
  );
  const [sharing, setSharing] = useState(defaultModal === "share-create");

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
      <MessageSendModal
        open={sendingMessages}
        setOpen={setSendingMessages}
        setAddingTarget={setAddingTarget}
        targets={targets}
        data={data}
      />
      <ShareCreateModal
        open={sharing}
        setOpen={setSharing}
        targets={targets}
        data={data}
      />
      <TargetAddModal
        open={addingTarget}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
      />
      <AuthSuccessModal
        open={authSuccessOpen}
        setOpen={setAuthSuccessOpen}
        user={user}
      />
      <AuthFailureModal open={authFailureOpen} setOpen={setAuthFailureOpen} />
      <ImageModal
        images={imageModalData?.images}
        startIndex={imageModalData?.startIndex}
        clear={() => setImageModalData(undefined)}
      />
      <Header user={user} />
      <div className="md:flex h-[calc(100%_-_3rem)]">
        <div
          className={`p-4 md:w-1/2 h-full overflow-y-scroll ${
            tab === "editor" ? "" : "hidden md:block"
          }`}
        >
          {urlTooLong && (
            <p className="mb-4 text-sm font-regular p-2 rounded bg-yellow-100 border-2 border-yellow-200 dark:bg-yellow-300 dark:border-yellow-300 dark:text-black dark:font-medium select-none">
              <CoolIcon icon="Triangle_Warning" /> Your message data is too
              large to be shown in the page URL. If you need to share this page,
              use the "Share Message" button.
            </p>
          )}
          <div className="flex mb-2">
            <Button
              onClick={() => setAddingTarget(true)}
              disabled={Object.keys(targets).length >= 10}
            >
              {strings.addWebhook}
            </Button>
            <Button
              className="ml-auto md:hidden"
              onClick={() => setTab("preview")}
              discordstyle={ButtonStyle.Secondary}
            >
              {strings.preview} <CoolIcon icon="Chevron_Right" />
            </Button>
          </div>
          {Object.values(targets).map((webhook) => {
            const avatarUrl = webhook.avatar
              ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
              : cdn.defaultAvatar(5);

            return (
              <div
                key={`target-${webhook.id}`}
                className="flex rounded bg-gray-300 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 md:px-4 mb-2"
              >
                <img
                  className="rounded-full mr-4 h-12 my-auto"
                  src={avatarUrl}
                />
                <div className="my-auto grow truncate">
                  <p className="font-semibold truncate">{webhook.name}</p>
                  <p className="text-sm leading-none truncate">
                    {webhook.user?.username}
                  </p>
                </div>
                <div className="ml-auto space-x-2 my-auto shrink-0 text-xl">
                  <button
                    onClick={() => {
                      delete targets[webhook.id];
                      updateTargets({ ...targets });
                    }}
                  >
                    <CoolIcon icon="Trash_Full" />
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex">
            <Button
              onClick={() => setSendingMessages(true)}
              disabled={data.messages.length === 0}
              >
              {strings.send}
            </Button>
            <Button
              className="ml-2"
              onClick={() => setSharing(true)}
              discordstyle={ButtonStyle.Secondary}
              disabled={data.messages.length === 0}
            >
              {strings.shareMessage}
            </Button>
          </div>
          {data.messages.map((_, i) => (
            <div key={`edit-message-${i}`}>
              <MessageEditor
                index={i}
                data={data}
                setData={setData}
                setSettingMessageIndex={setSettingMessageIndex}
              />
              {i < data.messages.length - 1 && (
                <hr className="border border-gray-500/20 mt-4" />
              )}
            </div>
          ))}
          <Button
            className="mt-4 w-full"
            disabled={data.messages.length >= 10}
            onClick={() => {
              data.messages.push({ data: {} });
              setData({ ...data });
            }}
          >
            {strings.addMessage}
          </Button>
        </div>
        <div
          className={`md:border-l-2 border-l-gray-400 dark:border-l-[#1E1F22] p-4 md:w-1/2 h-full overflow-y-scroll relative ${
            tab === "preview" ? "" : "hidden md:block"
          }`}
        >
          <div className="md:hidden">
            <Button
              onClick={() => setTab("editor")}
              discordstyle={ButtonStyle.Secondary}
            >
              <CoolIcon icon="Chevron_Left" /> {strings.editor}
            </Button>
            <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          </div>
          {data.messages.map((message, i) => (
            <Message
              key={`preview-message-${i}`}
              message={message.data}
              index={i}
              data={data}
              setImageModalData={setImageModalData}
            />
          ))}
          <Button
            className="fixed bottom-4 right-4"
            discordstyle={ButtonStyle.Secondary}
            onClick={() => setShowDisclaimer(true)}
          >
            <CoolIcon icon="Info" className="mr-1.5" />
            {strings.previewInfo}
          </Button>
        </div>
      </div>
    </div>
  );
}
