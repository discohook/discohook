import { useLoaderData, useSearchParams } from "@remix-run/react";
import { APIWebhook } from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeParseError, SafeParseReturnType, ZodError } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { InvalidShareIdData } from "~/api/v1/share.$shareId";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { SimpleMessageEditor } from "~/components/editor-simple/SimpleMessageEditor";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Message } from "~/components/preview/Message";
import { TabsWindow } from "~/components/tabs";
import { AuthFailureModal } from "~/modals/AuthFaillureModal";
import { AuthSuccessModal } from "~/modals/AuthSuccessModal";
import { HistoryModal } from "~/modals/HistoryModal";
import { ImageModal, ImageModalProps } from "~/modals/ImageModal";
import { MessageSaveModal } from "~/modals/MessageSaveModal";
import { MessageSendModal } from "~/modals/MessageSendModal";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { ShareExpiredModal } from "~/modals/ShareExpiredModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import { getUser } from "~/session.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import {
  INDEX_FAILURE_MESSAGE,
  INDEX_MESSAGE,
  WEBHOOK_URL_RE,
} from "~/util/constants";
import { getWebhook } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { base64Decode, base64UrlEncode, randomString } from "~/util/text";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString } from "~/util/zod";
import { DraftFile, HistoryItem, safePushState } from "./_index";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return {
    user,
    discordApplicationId: context.env.DISCORD_CLIENT_ID,
  };
};

export default function Index() {
  const { t } = useTranslation();
  const { user, discordApplicationId } = useLoaderData<typeof loader>();
  const isPremium = user ? userIsPremium(user) : false;
  const [settings] = useLocalStorage();

  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const shareId = searchParams.get("share");
  const backupIdParsed = snowflakeAsString().safeParse(
    searchParams.get("backup"),
  );

  // Editor state
  const [backupId, setBackupId] = useState<bigint>();
  const [data, setData] = useState<QueryData>({
    version: "d2",
    messages: [],
    components: {},
  });
  const [files, setFiles] = useState<DraftFile[]>([]);

  const [urlTooLong, setUrlTooLong] = useState(false);
  const [badShareData, setBadShareData] = useState<InvalidShareIdData>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once, on page load
  useEffect(() => {
    const loadInitialTargets = async (targets: { url: string }[]) => {
      for (const target of targets) {
        const match = target.url.match(WEBHOOK_URL_RE);
        if (!match) continue;

        const webhook = await getWebhook(match[1], match[2]);
        if (webhook.id) {
          updateTargets({ [webhook.id]: webhook });
        }
      }
    };

    const loadMessageComponents = async (messages: QueryData["messages"]) => {
      const built: typeof data.components = {};
      let i = -1;
      for (const message of messages) {
        i += 1;
        const withCustomIds = (message.data.components ?? [])
          .map((r) => r.components)
          .reduce((prev, cur) => {
            prev.push(...cur);
            return prev;
          }, [])
          .filter((c) => "custom_id" in c);
        if (withCustomIds.length === 0) {
          // built[i] = [];
          continue;
        }

        const url = new URL(apiUrl(BRoutes.components()));
        for (const component of withCustomIds) {
          url.searchParams.append("id", component.custom_id.replace(/^p_/, ""));
        }
        const response = await fetch(url, { method: "GET" });
        built[i] = await response.json();
      }
      if (Object.keys(built).length !== 0) {
        setData({ ...data, components: built });
      }
    };

    if (shareId) {
      fetch(apiUrl(BRoutes.share(shareId)), { method: "GET" }).then((r) => {
        if (r.status === 200) {
          r.json().then((d: any) => {
            const qd: QueryData = d.data;
            if (!qd.messages) {
              // This shouldn't happen but it could if something was saved wrong
              qd.messages = [];
            }
            setData(qd);
            loadInitialTargets(qd.targets ?? []);
            loadMessageComponents(qd.messages);
          });
        } else {
          r.json().then((d: any) => {
            setBadShareData(d as InvalidShareIdData);
          });
        }
      });
    } else if (backupIdParsed.success) {
      fetch(`${apiUrl(BRoutes.backups(backupIdParsed.data))}?data=true`, {
        method: "GET",
      }).then((r) => {
        if (r.status === 200) {
          setBackupId(backupIdParsed.data);
          r.json().then((d: any) => {
            const qd: QueryData = d.data;
            if (!qd.messages) {
              // This shouldn't happen but it could if something was saved wrong
              qd.messages = [];
            }
            setData({ ...qd, backup_id: backupIdParsed.data.toString() });
            loadInitialTargets(qd.targets ?? []);
            loadMessageComponents(qd.messages);
          });
        }
      });
    } else {
      let parsed:
        | SafeParseReturnType<QueryData, QueryData>
        | SafeParseError<QueryData>;
      try {
        parsed = ZodQueryData.safeParse(
          JSON.parse(
            searchParams.get("data")
              ? base64Decode(searchParams.get("data") ?? "{}") ?? "{}"
              : JSON.stringify({ messages: [INDEX_MESSAGE] }),
          ),
        );
      } catch (e) {
        parsed = {
          success: false,
          error: { issues: [e] } as ZodError<QueryData>,
        };
      }

      if (parsed.success) {
        if (parsed.data?.backup_id !== undefined) {
          setBackupId(BigInt(parsed.data.backup_id));
        }
        setData({ version: "d2", ...parsed.data });
        loadInitialTargets(parsed.data.targets ?? []);
        loadMessageComponents(parsed.data.messages);
      } else {
        console.error("QueryData failed parsing:", parsed.error.issues);
        setData({ version: "d2", messages: [INDEX_FAILURE_MESSAGE] });
      }
    }
  }, []);

  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [updateCount, setUpdateCount] = useState(-1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this when `data` changes
  useEffect(() => setUpdateCount(updateCount + 1), [data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
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
            ].slice(isPremium ? -30 : -15),
          );
        }
        setUpdateCount(updateCount + 1);
        if (backupId !== undefined) {
          console.log("Saving backup", backupId);
          fetch(apiUrl(BRoutes.backups(backupId)), {
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
      // We might want to lower this even more since the
      // browser starts to complain at 4,096 bytes
      const fullUrl = new URL(`${pathUrl}?data=${encoded}`);
      if (fullUrl.toString().length >= 16000) {
        setUrlTooLong(true);
        if (searchParams.get("data")) {
          safePushState({ path: pathUrl }, pathUrl);
        }
      } else {
        setUrlTooLong(false);
        safePushState({ path: fullUrl.toString() }, fullUrl.toString());
      }
    } else {
      // Make sure it stays there, we also want to wipe any other params
      setUrlTooLong(false);
      const fullUrl = `${pathUrl}?backup=${backupId}`;
      safePushState({ path: fullUrl.toString() }, fullUrl.toString());
    }
  }, [backupId, data, updateCount]);

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD }) as Targets,
    {},
  );
  const [addingTarget, setAddingTarget] = useState(dm === "add-target");
  const [settingMessageIndex, setSettingMessageIndex] = useState(
    dm?.startsWith("set-reference") ? Number(dm.split("-")[2]) : undefined,
  );
  const [imageModalData, setImageModalData] = useState<ImageModalProps>();
  const [authSuccessOpen, setAuthSuccessOpen] = useState(dm === "auth-success");
  const [authFailureOpen, setAuthFailureOpen] = useState(dm === "auth-failure");
  const [sendingMessages, setSendingMessages] = useState(dm === "submit");
  const [sharing, setSharing] = useState(dm === "share-create");
  const [editingWebhook, setEditingWebhook] = useState<string>();
  const [showHistory, setShowHistory] = useState(dm === "history");

  const [viewMessageIndex, setViewMessageIndex] = useState<number>(0);
  const [tab, setTab] = useState<"editor" | "preview" | "previewAll">(
    "previewAll",
  );

  return (
    <div className="h-screen overflow-hidden">
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
        resetData={() => {
          setData({
            messages: [{ data: {} }],
            targets: undefined,
          });
        }}
      />
      <TargetAddModal
        open={addingTarget}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
      />
      <ShareExpiredModal
        open={!!badShareData}
        setOpen={() => setBadShareData(undefined)}
        data={badShareData}
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
      <Prose className="h-full p-2 sm:p-4 md:p-8 overflow-y-auto">
        <TabsWindow
          tab={String(viewMessageIndex)}
          setTab={(v) => {
            if (v === "add") {
              if (data.messages.length >= 10) return;
              setData({ ...data, messages: [...data.messages, { data: {} }] });
              setViewMessageIndex(data.messages.length);
            } else {
              setViewMessageIndex(Number(v));
            }
          }}
          data={[
            ...data.messages.map((_, i) => ({
              label: `Message ${i + 1}`,
              value: String(i),
            })),
            ...(data.messages.length >= 10
              ? []
              : [
                  {
                    label: (
                      <>
                        <CoolIcon icon="Add_Plus_Circle" /> Add Message
                      </>
                    ),
                    value: "add",
                  },
                ]),
          ]}
        >
          <div className="">
            <div className="flex space-x-2">
              <Button
                className=""
                onClick={() => setTab("editor")}
                disabled={tab === "editor"}
              >
                {t("editor")}
              </Button>
              <Button
                className=""
                onClick={() => setTab("preview")}
                disabled={tab === "preview"}
              >
                {t("preview")}
              </Button>
              <Button
                className=""
                onClick={() => setTab("previewAll")}
                disabled={tab === "previewAll"}
              >
                {t("previewAll")}
              </Button>
            </div>
            <hr className="border-primary-500 my-2" />
          </div>
          {data.messages[viewMessageIndex] && (
            <div className="h-full overflow-y-auto">
              {tab === "editor" ? (
                <div>
                  <SimpleMessageEditor
                    data={data}
                    discordApplicationId={discordApplicationId}
                    index={viewMessageIndex}
                    setData={setData}
                    files={files}
                    setFiles={setFiles}
                    setSettingMessageIndex={setSettingMessageIndex}
                    webhooks={Object.values(targets)}
                  />
                </div>
              ) : tab === "preview" ? (
                <div>
                  <Message
                    message={data.messages[viewMessageIndex].data}
                    discordApplicationId={discordApplicationId}
                    index={viewMessageIndex}
                    data={data}
                    files={files}
                    webhooks={Object.values(targets)}
                    setImageModalData={setImageModalData}
                    messageDisplay={settings.messageDisplay}
                    compactAvatars={settings.compactAvatars}
                    forceSeparateAuthor
                  />
                </div>
              ) : tab === "previewAll" ? (
                <div>
                  {data.messages.map((message, i) => (
                    <Message
                      message={message.data}
                      discordApplicationId={discordApplicationId}
                      index={i}
                      data={data}
                      files={files}
                      webhooks={Object.values(targets)}
                      setImageModalData={setImageModalData}
                      messageDisplay={settings.messageDisplay}
                      compactAvatars={settings.compactAvatars}
                    />
                  ))}
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
}
