import { useLoaderData, useSearchParams } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { zx } from "zodix";
import { ImageModal, ImageModalProps } from "~/modals/ImageModal";
import { getUser } from "~/session.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import {
  INDEX_FAILURE_MESSAGE,
  INDEX_MESSAGE,
  WEBHOOK_URL_RE,
} from "~/util/constants";
import { cdn, getWebhook } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { base64Decode, base64UrlEncode, randomString } from "~/util/text";
import { CoolIcon } from "~/components/CoolIcon";
import { Button } from "~/components/Button";
import { Message } from "~/components/preview/Message";
import { PreviewDisclaimerModal } from "~/modals/PreviewDisclaimerModal";
import { ExampleModal } from "~/modals/ExampleModal";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { MessageSendModal } from "~/modals/MessageSendModal";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import { MessageSaveModal } from "~/modals/MessageSaveModal";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { MessageEditor } from "~/components/editor/MessageEditor";
import { AuthFailureModal } from "~/modals/AuthFaillureModal";
import { AuthSuccessModal } from "~/modals/AuthSuccessModal";
import { HistoryModal } from "~/modals/HistoryModal";
import { TargetAddModal } from "~/modals/TargetAddModal";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return {
    user,
    discordApplicationId: context.env.DISCORD_CLIENT_ID,
  };
};

export interface HistoryItem {
  id: string;
  createdAt: Date;
  data: QueryData;
}

const strings = {
  editor: "Editor",
  preview: "Preview",
  send: "Send",
  saveMessage: "Save Message",
  addWebhook: "Add Webhook",
  addMessage: "Add Message",
  embedExample: "Embed Example",
  previewInfo: "Preview Info",
  history: "History",
  editingBackup:
    'You\'re editing a backup, so your work is saved periodically while you edit. In order to share this message with others, use the "Save Message" button.',
};
//   fr: {
//     embedExample: "Exemple",
//   },
// });

export default function Index() {
  const { user, discordApplicationId } = useLoaderData<typeof loader>();
  const [settings] = useLocalStorage();

  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const shareId = searchParams.get("share");
  const backupIdParsed = zx.NumAsString.safeParse(searchParams.get("backup"));

  const [backupId, setBackupId] = useState<number>();
  const [data, setData] = useState<QueryData>({
    version: "d2",
    messages: [],
  });
  const [urlTooLong, setUrlTooLong] = useState(false);

  useEffect(() => {
    if (shareId) {
      fetch(`/api/share/${shareId}`, { method: "GET" }).then((r) => {
        if (r.status === 200) {
          r.json().then((d: any) => setData(d.data));
        }
      });
    } else if (backupIdParsed.success) {
      fetch(`/api/backups/${backupIdParsed.data}?data=true`, {
        method: "GET",
      }).then((r) => {
        if (r.status === 200) {
          setBackupId(backupIdParsed.data);
          r.json().then((d: any) =>
            setData({ ...d.data, backup_id: backupIdParsed.data }),
          );
        }
      });
    } else {
      let parsed;
      try {
        parsed = ZodQueryData.safeParse(
          JSON.parse(
            searchParams.get("data")
              ? base64Decode(searchParams.get("data") ?? "{}") ?? "{}"
              : JSON.stringify({ messages: [INDEX_MESSAGE] }),
          ),
        );
      } catch {
        parsed = {};
      }

      if (parsed.success) {
        if (parsed.data?.backup_id !== undefined) {
          setBackupId(parsed.data.backup_id);
        }
        setData({ version: "d2", ...(parsed.data as QueryData) });
        if (parsed.data?.targets && parsed.data.targets.length !== 0) {
          // Load webhook URLs on initial parse of query data
          (async () => {
            for (const target of parsed.data!.targets!) {
              const match = target.url.match(WEBHOOK_URL_RE);
              if (!match) continue;

              const webhook = await getWebhook(match[1], match[2]);
              if (webhook.id) {
                updateTargets({ [webhook.id]: webhook });
              }
            }
          })();
        }
      } else {
        setData({ version: "d2", messages: [INDEX_FAILURE_MESSAGE] });
      }
    }
  }, []);

  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [updateCount, setUpdateCount] = useState(-1);
  useEffect(() => setUpdateCount(updateCount + 1), [data]);

  useEffect(() => {
    if (updateCount % 20 === 0) {
      const lastHistoryItem = localHistory.slice(-1)[0];
      if (
        !lastHistoryItem ||
        JSON.stringify(lastHistoryItem.data) !== JSON.stringify(data)
      ) {
        if (data.messages.length > 0) {
          setLocalHistory(
            [
              ...localHistory,
              {
                id: randomString(10),
                createdAt: new Date(),
                data: structuredClone(data),
              },
            ].slice(-20),
          );
        }
        setUpdateCount(updateCount + 1);
        if (backupId !== undefined) {
          console.log("Saving backup", backupId);
          fetch(`/api/backups/${backupId}`, {
            method: "PATCH",
            body: new URLSearchParams({
              data: JSON.stringify(data),
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });
        }
      }
    }

    const pathUrl = location.origin + location.pathname;
    const encoded = base64UrlEncode(JSON.stringify(data));
    if (backupId === undefined) {
      // URLs on Cloudflare are limited to 16KB
      const fullUrl = new URL(pathUrl + `?data=${encoded}`);
      if (fullUrl.toString().length >= 16000) {
        setUrlTooLong(true);
        if (searchParams.get("data")) {
          history.pushState({ path: pathUrl }, "", pathUrl);
        }
      } else {
        setUrlTooLong(false);
        history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
      }
    } else {
      // Make sure it stays there, we also want to wipe any other params
      setUrlTooLong(false);
      const fullUrl = pathUrl + `?backup=${backupId}`;
      history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
    }
  }, [backupId, data, updateCount]);

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD }) as Targets,
    {},
  );
  const [showDisclaimer, setShowDisclaimer] = useState(dm === "preview");
  const [addingTarget, setAddingTarget] = useState(dm === "add-target");
  const [settingMessageIndex, setSettingMessageIndex] = useState(
    dm && dm.startsWith("set-reference") ? Number(dm.split("-")[2]) : undefined,
  );
  const [imageModalData, setImageModalData] = useState<ImageModalProps>();
  const [exampleOpen, setExampleOpen] = useState(dm === "embed-example");
  const [authSuccessOpen, setAuthSuccessOpen] = useState(dm === "auth-success");
  const [authFailureOpen, setAuthFailureOpen] = useState(dm === "auth-failure");
  const [sendingMessages, setSendingMessages] = useState(dm === "submit");
  const [sharing, setSharing] = useState(dm === "share-create");
  const [editingWebhook, setEditingWebhook] = useState<string>();
  const [showHistory, setShowHistory] = useState(dm === "history");

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen overflow-hidden">
      <PreviewDisclaimerModal
        open={showDisclaimer}
        setOpen={setShowDisclaimer}
      />
      <ExampleModal open={exampleOpen} setOpen={setExampleOpen} />
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
      <WebhookEditModal
        open={editingWebhook !== undefined}
        setOpen={() => setEditingWebhook(undefined)}
        targets={targets}
        updateTargets={updateTargets}
        webhookId={editingWebhook}
        user={user}
      />
      <MessageSaveModal
        open={sharing}
        setOpen={setSharing}
        targets={targets}
        data={data}
        setData={setData}
        user={user}
      />
      <HistoryModal
        open={showHistory}
        setOpen={setShowHistory}
        localHistory={localHistory}
        setLocalHistory={setLocalHistory}
        setData={setData}
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
            <InfoBox icon="Triangle_Warning" severity="yellow">
              Your message data is too large to be shown in the page URL. If you
              need to share this page, use the "Share Message" button.
            </InfoBox>
          )}
          {backupId !== undefined && (
            <InfoBox icon="Save" collapsible open>
              {strings.editingBackup}
            </InfoBox>
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
                    {webhook.application_id === discordApplicationId ? (
                      <>
                        <CoolIcon
                          icon="Circle_Check"
                          className="text-blurple-500"
                        />{" "}
                        Owned by Boogiehook
                      </>
                    ) : (
                      webhook.user?.username
                    )}
                  </p>
                </div>
                <div className="ml-auto space-x-2 my-auto shrink-0 text-xl">
                  <button onClick={() => setEditingWebhook(webhook.id)}>
                    <CoolIcon icon="Edit_Pencil_01" />
                  </button>
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
              {strings.saveMessage}
            </Button>
            <Button
              className="ml-2"
              onClick={() => setShowHistory(true)}
              discordstyle={ButtonStyle.Secondary}
              disabled={localHistory.length === 0}
            >
              {strings.history}
            </Button>
          </div>
          {data.messages.map((_, i) => (
            <div key={`edit-message-${i}`}>
              <MessageEditor
                index={i}
                data={data}
                discordApplicationId={discordApplicationId}
                setData={setData}
                setSettingMessageIndex={setSettingMessageIndex}
                webhooks={Object.values(targets)}
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
              discordApplicationId={discordApplicationId}
              webhooks={Object.values(targets)}
              index={i}
              data={data}
              setImageModalData={setImageModalData}
              messageDisplay={settings.messageDisplay}
              compactAvatars={settings.compactAvatars}
            />
          ))}
          <div className="fixed bottom-4 right-4 grid gap-2 grid-cols-1">
            <Button
              discordstyle={ButtonStyle.Secondary}
              onClick={() => setExampleOpen(true)}
            >
              {strings.embedExample}
            </Button>
            <Button
              discordstyle={ButtonStyle.Secondary}
              onClick={() => setShowDisclaimer(true)}
            >
              <CoolIcon icon="Info" className="mr-1.5" />
              {strings.previewInfo}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
