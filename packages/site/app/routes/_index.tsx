import { SerializeFrom, defer } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { SafeParseError, SafeParseReturnType, ZodError } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { InvalidShareIdData } from "~/api/v1/share.$shareId";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { MessageEditor } from "~/components/editor/MessageEditor";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Message } from "~/components/preview/Message";
import { AuthFailureModal } from "~/modals/AuthFaillureModal";
import { AuthSuccessModal } from "~/modals/AuthSuccessModal";
import { ExampleModal } from "~/modals/ExampleModal";
import { HistoryModal } from "~/modals/HistoryModal";
import { ImageModal, ImageModalProps } from "~/modals/ImageModal";
import { MessageSaveModal } from "~/modals/MessageSaveModal";
import { MessageSendModal } from "~/modals/MessageSendModal";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { PreviewDisclaimerModal } from "~/modals/PreviewDisclaimerModal";
import { ShareExpiredModal } from "~/modals/ShareExpiredModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import { getUser } from "~/session.server";
import { discordMembers, eq, getDb } from "~/store.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { useCache } from "~/util/cache/CacheManager";
import {
  INDEX_FAILURE_MESSAGE,
  INDEX_MESSAGE,
  WEBHOOK_URL_RE,
} from "~/util/constants";
import { cdn, getWebhook } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { base64Decode, base64UrlEncode, randomString } from "~/util/text";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  const db = getDb(context.env.DATABASE_URL);
  const memberships = (async () => {
    return user?.discordId
      ? (
          await db.query.discordMembers.findMany({
            where: eq(discordMembers.userId, user.discordId),
            with: {
              guild: true,
            },
          })
        ).filter((m) =>
          new PermissionsBitField(BigInt(m.permissions ?? "0")).has(
            PermissionFlags.ManageWebhooks,
          ),
        )
      : [];
  })();

  return defer({
    user,
    memberships,
    discordApplicationId: context.env.DISCORD_CLIENT_ID,
  });
};

export type LoadedMembership = Awaited<
  SerializeFrom<typeof loader>["memberships"]
>[number];

export interface DraftFile {
  id: string;
  file: File;
  description?: string;
  url?: string;
  embed?: boolean;
}

export interface HistoryItem {
  id: string;
  createdAt: Date;
  data: QueryData;
}

export const safePushState = (data: any, url?: string | URL | null): void => {
  // Avoid redundant call. This ignores `data` but we aren't using it for non-`url` state right now
  if (url && url === location.href) return;
  try {
    history.pushState(data, "", url);
  } catch (e) {
    if (e instanceof DOMException) {
      // We were getting errors about insecurity when inputting too quickly
      // despite only dealing with the same origin, so we just ignore
      // these and skip the state push.
      return;
    }
    console.log(e);
  }
};

export const getQdMessageId = (message: QueryData["messages"][number]) => {
  // Technically not a unique prop right now
  // if (message.reference) {
  //   const match = message.reference.match(MESSAGE_REF_RE);
  //   if (match) return match[3];
  // }
  if (message._id) return message._id;
  const id = randomString(10);
  message._id = id;
  return id;
};

export default function Index() {
  const { t } = useTranslation();
  const { user, memberships, discordApplicationId } =
    useLoaderData<typeof loader>();
  const isPremium = user ? userIsPremium(user) : false;
  const [settings] = useLocalStorage();
  const cache = user ? useCache() : undefined;

  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const shareId = searchParams.get("share");
  const backupIdParsed = snowflakeAsString().safeParse(
    searchParams.get("backup"),
  );

  // Editor state
  const [backupId, setBackupId] = useState<bigint>();
  const [files, setFiles] = useState<Record<string, DraftFile[]>>({});
  const [data, setData] = useReducer(
    (cur: QueryData, d: QueryData) => {
      const newData = d;

      // Update file preview if any are referenced in embeds
      setFiles(
        Object.fromEntries(
          newData.messages.map((d) => [
            getQdMessageId(d),
            files[getQdMessageId(d)]?.map((f) => {
              const uri = `attachment://${f.file.name}`;
              f.embed =
                !!d.data.embeds &&
                d.data.embeds?.filter(
                  (e) =>
                    e.author?.icon_url === uri ||
                    e.image?.url === uri ||
                    e.thumbnail?.url === uri ||
                    e.footer?.icon_url === uri,
                ).length !== 0;
              return f;
            }) ?? [],
          ]),
        ),
      );
      return newData;
    },
    {
      version: "d2",
      messages: [],
      components: {},
    },
  );

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
  const [showDisclaimer, setShowDisclaimer] = useState(dm === "preview");
  const [addingTarget, setAddingTarget] = useState(dm === "add-target");
  const [settingMessageIndex, setSettingMessageIndex] = useState(
    dm?.startsWith("set-reference") ? Number(dm.split("-")[2]) : undefined,
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
        cache={cache}
      />
      <MessageSendModal
        open={sendingMessages}
        setOpen={setSendingMessages}
        setAddingTarget={setAddingTarget}
        targets={targets}
        data={data}
        files={files}
        cache={cache}
      />
      <WebhookEditModal
        open={editingWebhook !== undefined}
        setOpen={() => setEditingWebhook(undefined)}
        targets={targets}
        updateTargets={updateTargets}
        webhookId={editingWebhook}
        user={user}
        cache={cache}
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
        memberships={memberships}
        cache={cache}
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
      <div
        className={twJoin(
          "h-[calc(100%_-_3rem)]",
          settings.forceDualPane ? "flex" : "md:flex",
        )}
      >
        <div
          className={twMerge(
            "p-4 h-full overflow-y-scroll md:w-1/2",
            settings.forceDualPane
              ? "w-1/2"
              : tab === "editor"
                ? ""
                : "hidden md:block",
          )}
        >
          {urlTooLong && (
            <InfoBox icon="Triangle_Warning" severity="yellow">
              Your message data is too large to be shown in the page URL. If you
              need to share this page, use the "Share Message" button.
            </InfoBox>
          )}
          {backupId !== undefined && (
            <InfoBox icon="Save" collapsible open>
              {t("editingBackupNote")}
            </InfoBox>
          )}
          <div className="flex mb-2">
            <Button
              onClick={() => setAddingTarget(true)}
              disabled={Object.keys(targets).length >= 10}
            >
              {t("addWebhook")}
            </Button>
            <Button
              className={twJoin(
                "ml-auto",
                settings.forceDualPane ? "hidden" : "md:hidden",
              )}
              onClick={() => setTab("preview")}
              discordstyle={ButtonStyle.Secondary}
            >
              {t("preview")} <CoolIcon icon="Chevron_Right" />
            </Button>
          </div>
          {Object.values(targets).map((webhook) => {
            const avatarUrl = webhook.avatar
              ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
              : cdn.defaultAvatar(5);

            return (
              <div
                key={`target-${webhook.id}`}
                className="rounded-lg py-2 px-3 mb-2 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
              >
                <img
                  className="rounded-full my-auto w-8 h-8 mr-3"
                  src={avatarUrl}
                  alt=""
                />
                <div className="truncate my-auto">
                  <div className="flex max-w-full">
                    <p className="font-semibold truncate dark:text-primary-230 text-lg">
                      <span className="align-baseline">{webhook.name}</span>
                      {webhook.application_id === discordApplicationId && (
                        <span
                          className="ml-1 inline-block"
                          title={t("createdByDiscohook")}
                        >
                          <CoolIcon
                            icon="Circle_Check"
                            className="text-blurple-500 dark:text-blurple-400"
                          />
                        </span>
                      )}
                    </p>
                  </div>
                  {/* {cache && (
                    <p className="text-xs text-primary-400">
                      #
                      {cache.resolve({
                        scope: "channel",
                        key: webhook.channel_id,
                      })?.name ?? t("mention.unknown")}
                    </p>
                  )} */}
                </div>
                <div className="ml-auto space-x-2 rtl:space-x-reverse my-auto shrink-0 text-xl">
                  <button
                    type="button"
                    title={t("editResource", { replace: [webhook.name] })}
                    onClick={() => setEditingWebhook(webhook.id)}
                  >
                    <CoolIcon icon="Edit_Pencil_01" />
                  </button>
                  <button
                    type="button"
                    title={t("removeResource", { replace: [webhook.name] })}
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
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              onClick={() => setSendingMessages(true)}
              disabled={data.messages.length === 0}
            >
              {t("send")}
            </Button>
            <Button
              onClick={() => setSharing(true)}
              discordstyle={ButtonStyle.Secondary}
              disabled={data.messages.length === 0}
            >
              {t("saveMessage")}
            </Button>
            <Button
              onClick={() => setShowHistory(true)}
              discordstyle={ButtonStyle.Secondary}
            >
              {t("history")}
            </Button>
          </div>
          {data.messages.map((d, i) => {
            const id = getQdMessageId(d);
            return (
              <div key={`edit-message-${id}`}>
                <MessageEditor
                  index={i}
                  data={data}
                  files={files[id] ?? []}
                  discordApplicationId={discordApplicationId}
                  setData={setData}
                  setFiles={(newF) =>
                    setFiles({ ...files, [id]: newF as DraftFile[] })
                  }
                  setSettingMessageIndex={setSettingMessageIndex}
                  webhooks={Object.values(targets)}
                  cache={cache}
                />
                {i < data.messages.length - 1 && (
                  <hr className="border border-gray-500/20 mt-4" />
                )}
              </div>
            );
          })}
          <Button
            className="mt-4 w-full"
            disabled={data.messages.length >= 10}
            onClick={() => {
              data.messages.push({ data: {} });
              setData({ ...data });
            }}
          >
            {t("addMessage")}
          </Button>
        </div>
        <div
          className={twMerge(
            "border-l-gray-400 dark:border-l-[#1E1F22] h-full flex-col md:w-1/2",
            settings.forceDualPane
              ? "flex w-1/2 border-l-2"
              : tab === "preview"
                ? "flex"
                : "hidden md:border-l-2 md:flex",
          )}
        >
          <div className="overflow-y-scroll grow p-4 pb-8">
            <div className={settings.forceDualPane ? "hidden" : "md:hidden"}>
              <Button
                onClick={() => setTab("editor")}
                discordstyle={ButtonStyle.Secondary}
              >
                <CoolIcon icon="Chevron_Left" /> {t("editor")}
              </Button>
              <hr className="border border-gray-400 dark:border-gray-600 my-4" />
            </div>
            {data.messages.map((message, i) => {
              const id = getQdMessageId(message);
              return (
                <Message
                  key={`preview-message-${id}`}
                  message={message.data}
                  cache={cache}
                  discordApplicationId={discordApplicationId}
                  webhooks={Object.values(targets)}
                  index={i}
                  data={data}
                  files={files[id]}
                  setImageModalData={setImageModalData}
                  messageDisplay={settings.messageDisplay}
                  compactAvatars={settings.compactAvatars}
                />
              );
            })}
          </div>
          <div className="grid gap-2 grid-cols-3 mt-auto px-4 py-2 bg-slate-50 dark:bg-[#1E1F22]">
            <Button
              discordstyle={ButtonStyle.Secondary}
              onClick={() => setExampleOpen(true)}
            >
              {t("embedExample")}
            </Button>
            <Button
              discordstyle={ButtonStyle.Secondary}
              onClick={() => setShowDisclaimer(true)}
            >
              {t("previewInfo")}
            </Button>
            <Link to="/donate" target="_blank" className="contents">
              <Button
                // Green link buttons are sinful, but eye-catching
                discordstyle={ButtonStyle.Success}
              >
                {t("donate")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
