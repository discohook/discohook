import { Dialog } from "@base-ui-components/react/dialog";
import { SerializeFrom } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIWebhook,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import React, { useEffect, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { UAParser } from "ua-parser-js";
import { SafeParseError, SafeParseReturnType, ZodError } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { InvalidShareIdData } from "~/api/v1/share.$shareId";
import { ApiGetCurrentUser } from "~/api/v1/users.@me";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { TextInput } from "~/components/TextInput";
import { MessageEditor } from "~/components/editor/MessageEditor.client";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Logo } from "~/components/icons/Logo";
import { PostChannelIcon } from "~/components/icons/channel";
import { linkClassName } from "~/components/preview/Markdown";
import { Message } from "~/components/preview/Message.client";
import { AuthFailureModal } from "~/modals/AuthFaillureModal";
import { AuthSuccessModal } from "~/modals/AuthSuccessModal";
import {
  CodeGeneratorModal,
  CodeGeneratorProps,
} from "~/modals/CodeGeneratorModal";
import {
  ComponentEditModal,
  EditingComponentData,
} from "~/modals/ComponentEditModal";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { EditingFlowData, FlowEditModal } from "~/modals/FlowEditModal";
import { HistoryModal } from "~/modals/HistoryModal";
import { ImageModal, ImageModalProps } from "~/modals/ImageModal";
import { JsonEditorModal, JsonEditorProps } from "~/modals/JsonEditorModal";
import { MessageAllowedMentionsModal } from "~/modals/MessageAllowedMentionsModal";
import { MessageBackupsModal } from "~/modals/MessageBackupsModal";
import { MessageFlagsEditModal } from "~/modals/MessageFlagsEditModal";
import {
  MessageSendModal,
  useMessageSubmissionManager,
} from "~/modals/MessageSendModal";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { MessageShareModal } from "~/modals/MessageShareModal";
import { DialogPortal, ModalFooter } from "~/modals/Modal";
import { ShareExpiredModal } from "~/modals/ShareExpiredModal";
import { SimpleTextModal } from "~/modals/SimpleTextModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import { getSessionStorage, getUserId } from "~/session.server";
import {
  type APIComponentInMessageActionRow,
  type QueryData,
  type QueryDataTarget,
  ZodQueryData,
} from "~/types/QueryData";
import { QueryDataMessageDataRaw } from "~/types/QueryData-raw";
import { useCache } from "~/util/cache/CacheManager";
import {
  INDEX_FAILURE_MESSAGE,
  INDEX_MESSAGE,
  WEBHOOK_URL_RE,
} from "~/util/constants";
import {
  DISCORD_API,
  DISCORD_API_V,
  cdnImgAttributes,
  extractInteractiveComponents,
  getWebhook,
  isComponentsV2,
  webhookAvatarUrl,
} from "~/util/discord";
import { ATTACHMENT_URI_EXTENSIONS, transformFileName } from "~/util/files";
import { LoaderArgs, useApiLoader } from "~/util/loader";
import { Settings, useLocalStorage } from "~/util/localstorage";
import {
  base64Decode,
  base64UrlEncode,
  copyText,
  randomString,
} from "~/util/text";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString } from "~/util/zod";
import { type ApiGetBackupWithData } from "../api/v1/backups.$id";
import { loader as ApiGetComponents } from "../api/v1/components";
import {
  buildStorableComponent,
  unresolveStorableComponent,
} from "./edit.component.$id";

export const loader = async ({ request, context }: LoaderArgs) => {
  const userId = await getUserId(request, context);
  let authFailure: string | undefined;
  const defaultModal = new URL(request.url).searchParams.get("m");
  if (!userId && defaultModal === "auth-failure") {
    const storage = getSessionStorage(context);
    const session = await storage.getSession(request.headers.get("Cookie"));
    authFailure = session.get("auth:error")?.toString() ?? undefined;
  }

  return {
    userId,
    discordApplicationId: context.env.DISCORD_CLIENT_ID,
    cdn: context.env.CDN_ORIGIN,
    debug: {
      environment: context.env.ENVIRONMENT,
      version: context.env.VERSION,
      authFailure,
    },
  };
};

export interface DraftFile {
  id: string;
  file: File;
  description?: string;
  url?: string;
  embed?: boolean;
  is_thumbnail?: boolean;
  spoiler?: boolean;
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

export const loadMessageComponents = async (
  data: QueryData,
  setData: React.Dispatch<QueryData>,
) => {
  const allComponentsById = Object.fromEntries(
    data.messages.flatMap((m) =>
      extractInteractiveComponents(m.data.components ?? [])
        .map((c) => {
          if (!!c.custom_id && /^p_\d+/.test(c.custom_id)) {
            return [c.custom_id.replace(/^p_/, ""), c];
          }
          // We don't really need to load data for link buttons.
          // This is pretty much just to reduce residue.
          // @deprecated - we don't assign dhc-id anymore
          if (c.type === ComponentType.Button && isLinkButton(c)) {
            try {
              const url = new URL(c.url);
              const id = url.searchParams.get("dhc-id");
              if (id && /\d+/.test(id)) {
                return [id, c];
              }
            } catch {}
          }
          return undefined;
        })
        .filter((pair): pair is NonNullable<typeof pair> => Boolean(pair)),
    ),
  ) as Record<string, APIComponentInMessageActionRow>;

  if (Object.keys(allComponentsById).length !== 0) {
    const params = new URLSearchParams();
    for (const id of Object.keys(allComponentsById)) {
      params.append("id", id);
    }

    const response = await fetch(`${apiUrl(BRoutes.components())}?${params}`, {
      method: "GET",
    });
    const raw = (await response.json()) as SerializeFrom<
      typeof ApiGetComponents
    >;
    for (const stored of raw) {
      const local = allComponentsById[stored.id];
      if (local) {
        const unresolved = unresolveStorableComponent(stored.data);
        Object.assign(
          local,
          buildStorableComponent(
            unresolved.component,
            stored.id,
            unresolved.flows,
          ),
        );
      }
    }

    setData({ ...data });
  }
};

const getNewMessageData = (settings: Settings): QueryDataMessageDataRaw => {
  const data: QueryDataMessageDataRaw = {};
  if (settings.defaultMessageFlag === "components") {
    data.flags = MessageFlags.IsComponentsV2;
  }
  return data;
};

export default function Index() {
  const { t } = useTranslation();
  const user = useApiLoader<ApiGetCurrentUser>("/users/@me");
  const { userId, cdn, discordApplicationId, debug } =
    useLoaderData<typeof loader>();

  const V2_CREATE_PROMPT = debug.environment === "dev";

  const isPremium = user ? userIsPremium(user) : false;
  const [settings] = useLocalStorage();
  const cache = useCache(!user);
  const [error, setError] = useError(t);

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
              // https://discord.dev/reference#editing-message-attachments-using-attachments-within-embeds
              const uri = `attachment://${transformFileName(f.file.name)}`;
              if (
                ATTACHMENT_URI_EXTENSIONS.find((ext) =>
                  f.file.name.toLowerCase().endsWith(ext),
                ) !== undefined
              ) {
                f.embed =
                  !!d.data.embeds &&
                  d.data.embeds?.filter(
                    (e) =>
                      e.author?.icon_url?.trim() === uri ||
                      e.image?.url?.trim() === uri ||
                      e.thumbnail?.url?.trim() === uri ||
                      e.footer?.icon_url?.trim() === uri,
                  ).length !== 0;
                // Being in an embed overrides the thumbnail attribute
                // TODO: people might think this is a bug; improve communication
                if (f.embed && f.is_thumbnail) {
                  f.is_thumbnail = false;
                }
              }
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
    },
  );
  const [editingComponent, setEditingComponent] =
    useState<EditingComponentData>();
  const [editingFlow, setEditingFlow] = useState<EditingFlowData>();

  const [urlTooLong, setUrlTooLong] = useState(false);
  const [badShareData, setBadShareData] = useState<InvalidShareIdData>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once, on page load
  useEffect(() => {
    const loadInitialTargets = async (targets: QueryDataTarget[]) => {
      const cachingGuildIds: string[] = [];
      for (const target of targets) {
        const match = target.url.match(WEBHOOK_URL_RE);
        if (!match) continue;

        const webhook = await getWebhook(match[1], match[2]);
        if (webhook.id) {
          updateTargets({ [webhook.id]: webhook });
        }
        if (
          webhook.guild_id &&
          !cachingGuildIds.includes(webhook.guild_id) &&
          cache
        ) {
          cachingGuildIds.push(webhook.guild_id);
          cache
            .fetchGuildCacheable(webhook.guild_id)
            .then(() =>
              console.log(
                `Cached cacheables for ${webhook.guild_id} (webhook ID ${webhook.id})`,
              ),
            );
        }
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
            loadMessageComponents(qd, setData);
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
          r.json().then((d: unknown) => {
            const raw = d as ApiGetBackupWithData;
            document.title = `${raw.name} - Discohook`;
            if (!raw.data.messages) {
              // This shouldn't happen but it could if something was saved wrong
              raw.data.messages = [];
            }
            setData({ ...raw.data, backup_id: backupIdParsed.data.toString() });
            loadInitialTargets(raw.data.targets ?? []);
            loadMessageComponents(raw.data, setData);
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
        loadMessageComponents(parsed.data, setData);
      } else {
        console.log("QueryData failed parsing:", parsed.error.format());
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
            body: JSON.stringify({ data }),
            headers: { "Content-Type": "application/json" },
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
  const messagesWithReference = data.messages.filter(
    (m) => !!m.reference,
  ).length;

  type Targets = Record<string, APIWebhook>;
  const [targets, updateTargets] = useReducer(
    (d: Targets, partialD: Partial<Targets>) =>
      ({ ...d, ...partialD }) as Targets,
    {},
  );
  const [addingTarget, setAddingTarget] = useState(dm === "add-target");
  const {
    sending,
    setShowingResult,
    resultModal,
    submitMessages,
    ...restSubmission
  } = useMessageSubmissionManager(t, data, setData, files, setError);

  const [settingMessageIndex, setSettingMessageIndex] = useState(
    dm?.startsWith("set-reference") ? Number(dm.split("-")[2]) : undefined,
  );
  const [editingMessageFlags, setEditingMessageFlags] = useState<number>();
  const [editingAllowedMentions, setEditingAllowedMentions] =
    useState<number>();
  const [imageModalData, setImageModalData] = useState<ImageModalProps>();
  const [authSuccessOpen, setAuthSuccessOpen] = useState(dm === "auth-success");
  const [authFailureOpen, setAuthFailureOpen] = useState(dm === "auth-failure");
  const [sendingMessages, setSendingMessages] = useState(dm === "submit");
  const [sharing, setSharing] = useState(dm === "share-create");
  const [showBackups, setShowBackups] = useState(dm === "backups");
  const [editingWebhook, setEditingWebhook] = useState<string>();
  const [showHistory, setShowHistory] = useState(dm === "history");
  const [jsonEditor, setJsonEditor] = useState<JsonEditorProps>();
  const [codeGenerator, setCodeGenerator] = useState<CodeGeneratorProps>();
  const [showOrgMigration, setShowOrgMigration] = useState(dm === "org");
  const [showAddMessageMenu, setShowAddMessageMenu] = useState(false);
  const [confirm, setConfirm] = useConfirmModal();

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  const ua = new UAParser(navigator.userAgent).getResult();

  // Warn users if they can't connect to Discord
  const [blockTest, setBlockTest] = useState<"success" | "failure">();
  const performBlockTest = () => {
    fetch(`${DISCORD_API}/v${DISCORD_API_V}/invites/discord-developers`, {
      method: "HEAD",
    })
      // we don't care about the response itself, just if the promise was
      // rejected due to being blocked by an extension
      .then(() => {
        setBlockTest("success");
      })
      .catch((e) => {
        setBlockTest("failure");
      });
  };
  useEffect(performBlockTest, []);

  return (
    <div className="h-screen overflow-hidden">
      <ComponentEditModal
        open={!!editingComponent}
        setOpen={() => setEditingComponent(undefined)}
        {...editingComponent}
        submit={user ? editingComponent?.submit : undefined}
        setEditingFlow={setEditingFlow}
        cache={cache}
      />
      <FlowEditModal
        open={!!editingFlow}
        setOpen={() => setEditingFlow(undefined)}
        // confusing
        guildId={Object.values(targets)[0]?.guild_id}
        {...editingFlow}
        cache={cache}
        premium={isPremium}
      />
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
      <MessageFlagsEditModal
        open={editingMessageFlags !== undefined}
        setOpen={() => setEditingMessageFlags(undefined)}
        data={data}
        setData={setData}
        messageIndex={editingMessageFlags}
      />
      <MessageAllowedMentionsModal
        open={editingAllowedMentions !== undefined}
        setOpen={() => setEditingAllowedMentions(undefined)}
        data={data}
        setData={setData}
        cache={cache}
        messageIndex={editingAllowedMentions}
      />
      <MessageSendModal
        open={sendingMessages}
        setOpen={setSendingMessages}
        setAddingTarget={setAddingTarget}
        targets={targets}
        sending={sending}
        data={data}
        cache={cache}
        messages={restSubmission.messages}
        updateMessages={restSubmission.updateMessages}
        setShowingResult={setShowingResult}
        submitMessages={submitMessages}
      />
      {resultModal}
      <WebhookEditModal
        open={editingWebhook !== undefined}
        setOpen={() => setEditingWebhook(undefined)}
        targets={targets}
        updateTargets={updateTargets}
        webhookId={editingWebhook}
        user={user}
        cache={cache}
      />
      <MessageShareModal
        open={sharing}
        setOpen={setSharing}
        targets={targets}
        data={data}
      />
      <MessageBackupsModal
        open={showBackups}
        setOpen={setShowBackups}
        targets={targets}
        data={data}
        setData={setData}
        updateTargets={updateTargets}
        setBackupId={setBackupId}
        user={user}
        cache={cache}
      />
      <JsonEditorModal
        open={!!jsonEditor}
        setOpen={() => setJsonEditor(undefined)}
        {...jsonEditor}
      />
      <CodeGeneratorModal
        open={!!codeGenerator}
        setOpen={() => setCodeGenerator(undefined)}
        data={codeGenerator?.data ?? {}}
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
        hasAuthentication={!!userId}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
        discordApplicationId={discordApplicationId}
        cache={cache}
      />
      <ShareExpiredModal
        open={!!badShareData}
        setOpen={() => setBadShareData(undefined)}
        data={badShareData}
      />
      <SimpleTextModal open={showOrgMigration} setOpen={setShowOrgMigration}>
        <p className="font-medium text-lg mb-2">{t("orgRedirectTitle")}</p>
        <p>
          <Trans
            t={t}
            i18nKey="orgRedirectBody"
            components={{
              bold: <span className="font-semibold" />,
              importLink: (
                <Link
                  to="/me/import-org-backups"
                  className={linkClassName}
                  target="_blank"
                />
              ),
              infoLink: (
                <Link
                  to="/guide/deprecated/migrate-utils"
                  className={linkClassName}
                  target="_blank"
                />
              ),
            }}
          />
        </p>
      </SimpleTextModal>
      {confirm}
      <AuthSuccessModal
        open={authSuccessOpen}
        setOpen={setAuthSuccessOpen}
        user={user}
      />
      <AuthFailureModal
        open={authFailureOpen}
        setOpen={setAuthFailureOpen}
        message={debug.authFailure}
      />
      <ImageModal
        {...imageModalData}
        clear={() => setImageModalData(undefined)}
      />
      <Header user={user} setShowHistoryModal={setShowHistory} />
      <div
        className={twJoin(
          "h-[calc(100%_-_3rem)]",
          settings.forceDualPane ? "flex" : "md:flex",
        )}
      >
        <div
          className={twMerge(
            "py-4 h-full overflow-y-scroll",
            settings.forceDualPane
              ? "w-1/2"
              : twJoin("md:w-1/2", tab === "editor" ? "" : "hidden md:block"),
          )}
        >
          <div className="px-4">
            {blockTest === "failure" ? (
              <InfoBox icon="Link_Break" severity="red" open>
                <Trans
                  t={t}
                  i18nKey="discordRequestBlocked"
                  components={{
                    bold: <span className="font-semibold" />,
                    retry: (
                      <button
                        type="button"
                        className="text-start contents text-blue-700 hover:underline"
                        onClick={performBlockTest}
                      />
                    ),
                  }}
                />
              </InfoBox>
            ) : null}
            {error}
            {urlTooLong && (
              <InfoBox icon="Triangle_Warning" severity="yellow">
                Your message data is too large to be shown in the page URL. If
                you need to share this page, use the "Share Message" button.
              </InfoBox>
            )}
            {backupId !== undefined && (
              <InfoBox icon="Save" collapsible open>
                {t("editingBackupNote")}
              </InfoBox>
            )}
            <div className="flex">
              <div className="flex mb-2 flex-wrap gap-x-2 gap-y-1 ltr:mr-2 rtl:ml-2">
                <Button
                  onClick={() => setSharing(true)}
                  discordstyle={ButtonStyle.Secondary}
                  disabled={data.messages.length === 0}
                >
                  {t("share")}
                </Button>
                <Button
                  onClick={() => setShowBackups(true)}
                  discordstyle={ButtonStyle.Secondary}
                >
                  {t("backups")}
                </Button>
                <Button
                  onClick={() =>
                    setConfirm({
                      title: t("resetEditor"),
                      children: (
                        <>
                          <p>
                            {t("resetEditorConfirm", {
                              count: data.messages.length,
                            })}
                          </p>
                          <p className="text-muted dark:text-muted-dark text-sm font-medium mt-1">
                            <Trans
                              t={t}
                              i18nKey="resetEditorFootnote"
                              components={[
                                <button
                                  type="button"
                                  className={twJoin(linkClassName, "contents")}
                                  onClick={() => {
                                    setShowHistory(true);
                                    setConfirm(undefined);
                                  }}
                                />,
                              ]}
                            />
                          </p>
                          <ModalFooter className="flex gap-2">
                            <Button
                              className="ltr:ml-auto rtl:mr-auto"
                              onClick={() => {
                                setData({
                                  messages: [
                                    { data: getNewMessageData(settings) },
                                  ],
                                  targets: undefined,
                                });
                                setConfirm(undefined);
                              }}
                              discordstyle={ButtonStyle.Danger}
                            >
                              {t("resetEditor")}
                            </Button>
                            <Button
                              onClick={() => setConfirm(undefined)}
                              discordstyle={ButtonStyle.Secondary}
                            >
                              {t("cancel")}
                            </Button>
                          </ModalFooter>
                        </>
                      ),
                    })
                  }
                  discordstyle={ButtonStyle.Secondary}
                >
                  {t("resetEditor")}
                </Button>
              </div>
              <Button
                className={twJoin(
                  "ltr:ml-auto rtl:mr-auto",
                  settings.forceDualPane ? "hidden" : "md:hidden",
                )}
                onClick={() => setTab("preview")}
                discordstyle={ButtonStyle.Secondary}
              >
                {t("preview")}{" "}
                <CoolIcon icon="Chevron_Right" rtl="Chevron_Left" />
              </Button>
            </div>
            {Object.values(targets).map((webhook) => (
              <div
                key={`target-${webhook.id}`}
                className="rounded-lg py-2 px-3 mb-2 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
              >
                <img
                  {...cdnImgAttributes(64, (size) =>
                    webhookAvatarUrl(webhook, { size }),
                  )}
                  className="rounded-full my-auto w-8 h-8 ltr:mr-3 rtl:ml-3"
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
                </div>
                <div className="ltr:ml-auto rtl:mr-auto space-x-2 rtl:space-x-reverse my-auto shrink-0 text-xl">
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
            ))}
            {settings.webhookInput === "classic" && (
              <div className="flex mb-2">
                {/* <CoolIcon
                icon="Add_Plus_Circle"
                className="my-auto text-2xl ltr:mr-2 rtl:ml-2 text-muted dark:text-muted-dark"
              /> */}
                <div className="grow">
                  <TextInput
                    className="w-full text-base"
                    onChange={async ({ currentTarget }) => {
                      setError(undefined);
                      const { value } = currentTarget;
                      if (!value.trim()) return;

                      const match = WEBHOOK_URL_RE.exec(value);
                      if (!match) {
                        setError({ code: "invalidWebhookUrl" });
                        return;
                      }

                      const live = await getWebhook(match[1], match[2]);
                      if (live.id) {
                        if (cache && live.guild_id && !targets[live.id]) {
                          cache.fetchGuildCacheable(live.guild_id);
                        }
                        updateTargets({ [live.id]: live });
                        currentTarget.value = "";
                      } else if ("message" in live) {
                        setError({ message: live.message as string });
                      }
                    }}
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>
              </div>
            )}
            <div className="flex space-x-2 rtl:space-x-reverse">
              {settings.webhookInput !== "classic" && (
                <Button
                  onClick={() => setAddingTarget(true)}
                  disabled={Object.keys(targets).length >= 10}
                >
                  {t("addWebhook")}
                </Button>
              )}
              <Button
                disabled={data.messages.length === 0 || sending}
                onClick={async () => {
                  if (settings.webhookInput !== "classic") {
                    setSendingMessages(true);
                    return;
                  }
                  const results = await submitMessages(Object.values(targets));
                  const errors = results.filter((r) => r.status === "error");
                  if (errors.length === 1) {
                    setShowingResult(errors[0]);
                  } else if (errors.length !== 0) {
                    setSendingMessages(true);
                  }
                }}
              >
                {t(
                  // This is so awkward
                  settings.webhookInput !== "classic"
                    ? messagesWithReference === 0
                      ? "send"
                      : messagesWithReference === data.messages.length
                        ? "edit"
                        : "submit"
                    : sending
                      ? messagesWithReference === 0
                        ? "sending"
                        : messagesWithReference === data.messages.length
                          ? "editing"
                          : "submitting"
                      : Object.keys(targets).length <= 1 &&
                          data.messages.length > 1
                        ? messagesWithReference === 0
                          ? "sendAll"
                          : "submitAll"
                        : Object.keys(targets).length > 1
                          ? messagesWithReference === 0
                            ? "sendToAll"
                            : "submitToAll"
                          : messagesWithReference === 0
                            ? "send"
                            : messagesWithReference === data.messages.length
                              ? "edit"
                              : "submit",
                )}
              </Button>
            </div>
          </div>
          {data.messages.map((d, i) => {
            const id = getQdMessageId(d);
            return (
              <MessageEditor
                key={`edit-message-${id}`}
                index={i}
                data={data}
                files={files[id] ?? []}
                discordApplicationId={discordApplicationId}
                setData={setData}
                setFiles={(newF) =>
                  setFiles({ ...files, [id]: newF as DraftFile[] })
                }
                setSettingMessageIndex={setSettingMessageIndex}
                setEditingMessageFlags={setEditingMessageFlags}
                setEditingAllowedMentions={setEditingAllowedMentions}
                setJsonEditor={setJsonEditor}
                setCodeGenerator={setCodeGenerator}
                webhooks={Object.values(targets)}
                setEditingComponent={setEditingComponent}
                cache={cache}
                cdn={cdn}
              />
            );
          })}
          <div className="px-4">
            {V2_CREATE_PROMPT ? (
              <Dialog.Root
                open={showAddMessageMenu}
                onOpenChange={setShowAddMessageMenu}
              >
                <Dialog.Trigger
                  disabled={data.messages.length >= 10}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      // doesn't seem to do anything (for our use case)?
                      e.preventBaseUIHandler();
                      setShowAddMessageMenu(false);

                      data.messages.push({
                        data: getNewMessageData(settings),
                      });
                      setData({ ...data });
                    }
                  }}
                  render={
                    <Button
                      className="mt-4 w-full"
                      disabled={data.messages.length >= 10}
                    >
                      <div className="flex">
                        <PostChannelIcon className="h-5 w-5 my-auto ltr:mr-1 rtl:ml-1" />
                        <span className="my-auto">{t("addMessage")}</span>
                      </div>
                    </Button>
                  }
                />
                <DialogPortal className="flex flex-col gap-y-2">
                  <button
                    className={twJoin(
                      "rounded-lg bg-gray-200 dark:bg-gray-800 py-4 px-6 gap-4 flex text-start",
                      "border border-gray-300 dark:border-gray-700 hover:border-blurple",
                      "shadow hover:shadow-md transition",
                    )}
                    type="button"
                    onClick={() => {
                      data.messages.push({ data: {} });
                      setData({ ...data });
                      setShowAddMessageMenu(false);
                    }}
                  >
                    <CoolIcon icon="Text" className="my-auto text-4xl" />
                    <div className="my-auto">
                      <p className="font-semibold text-lg">
                        {t("standardMessage")}
                      </p>
                      <p className="text-muted dark:text-muted-dark">
                        {t("standardMessageDescription")}
                      </p>
                    </div>
                  </button>
                  <button
                    className={twJoin(
                      "rounded-lg bg-gray-200 dark:bg-gray-800 py-4 px-6 gap-4 flex text-start",
                      "border border-gray-300 dark:border-gray-700 hover:border-blurple",
                      "shadow hover:shadow-md transition relative",
                    )}
                    type="button"
                    onClick={() => {
                      data.messages.push({
                        data: { flags: MessageFlags.IsComponentsV2 },
                      });
                      setData({ ...data });
                      setShowAddMessageMenu(false);
                    }}
                  >
                    <CoolIcon icon="Rows" className="my-auto text-4xl" />
                    <div className="my-auto">
                      <p className="font-semibold text-lg">
                        {t("componentsMessage")}
                      </p>
                      <p className="text-muted dark:text-muted-dark">
                        {t("componentsMessageDescription")}
                      </p>
                    </div>
                    <div className="absolute -top-1 -right-1 rounded-full bg-red-500 font-bold text-xs px-2 py-0.5 uppercase">
                      {t("new")}
                    </div>
                  </button>
                </DialogPortal>
              </Dialog.Root>
            ) : (
              <Button
                className="mt-4 w-full"
                disabled={data.messages.length >= 10}
                onClick={() => {
                  data.messages.push({ data: {} });
                  setData({ ...data });
                }}
              >
                <div className="flex">
                  <PostChannelIcon className="h-5 w-5 my-auto ltr:mr-1 rtl:ml-1" />
                  <span className="my-auto">{t("addMessage")}</span>
                </div>
              </Button>
            )}
            <hr className="border border-gray-400 dark:border-gray-600 my-6" />
            <div className="grayscale hover:grayscale-0 group flex text-sm opacity-60 hover:opacity-100 transition-opacity">
              <div className="mb-auto mt-1 ltr:ml-2 rtl:mr-2">
                <Logo pink={isPremium} />
              </div>
              <div className="ltr:ml-6 rtl:mr-6">
                <p>
                  Discohook is brought to you free of charge by me (shay) and a
                  history of contributors.{" "}
                  <Link
                    to="/donate"
                    target="_blank"
                    className="underline hover:no-underline"
                  >
                    Consider donating
                  </Link>{" "}
                  if you would like to support the project.
                </p>
                <hr className="border-gray-400 dark:border-gray-600 mb-1 mt-2" />
                <button
                  type="button"
                  className="text-muted dark:text-muted-dark text-xs text-start"
                  title={t("clickToCopy")}
                  onClick={(e) => copyText(e.currentTarget.textContent ?? "")}
                >
                  Discohook {debug.version.id.split("-")[0]}
                  {debug.environment === "production"
                    ? ""
                    : ` (${debug.environment})`}
                  {"\n"}
                  <br />
                  {ua.browser.name} {ua.browser.version} ({ua.engine.name})
                  {"\n"}
                  <br />
                  {ua.os.name} {ua.os.version}
                </button>
                <hr className="border-gray-400 dark:border-gray-600 mt-1 mb-2" />
                <p className="flex flex-wrap gap-2">
                  <Link
                    to="/bot"
                    className="underline hover:no-underline"
                    target="_blank"
                  >
                    {t("inviteBot")}
                  </Link>
                  <a
                    href="https://github.com/discohook/discohook"
                    className="underline hover:no-underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://docs.discohook.app"
                    className="underline hover:no-underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    API
                  </a>
                  {location.hostname === "discohook.app" && (
                    <span>Email: "hello" at {location.hostname}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={twMerge(
            "h-full flex-col",
            "ltr:border-l-gray-400 ltr:dark:border-l-[#1E1F22]",
            "rtl:border-r-gray-400 rtl:dark:border-r-[#1E1F22]",
            settings.forceDualPane
              ? "flex w-1/2 ltr:border-l-2 rtl:border-r-2"
              : twJoin(
                  "md:w-1/2 ltr:md:border-l-2 rtl:md:border-r-2",
                  tab === "preview" ? "flex" : "hidden md:flex",
                ),
          )}
        >
          <div className="overflow-y-scroll grow p-4 pb-8">
            <div className={settings.forceDualPane ? "hidden" : "md:hidden"}>
              <Button
                onClick={() => setTab("editor")}
                discordstyle={ButtonStyle.Secondary}
              >
                <CoolIcon icon="Chevron_Left" rtl="Chevron_Right" />{" "}
                {t("editor")}
              </Button>
              <hr className="border border-gray-400 dark:border-gray-600 my-4" />
            </div>
            {data.messages.find((m) => isComponentsV2(m.data)) !== undefined ? (
              <InfoBox severity="blue" icon="Flag" collapsible open>
                Hey! You're currently using an open beta for Discohook's
                components V2 support. Some things are still incomplete,
                including the live preview and interactive components. Please
                give feedback in the Components V2 thread.
              </InfoBox>
            ) : null}
            {data.messages.map((message, i) => {
              const mid = getQdMessageId(message);
              return (
                <Message
                  key={`preview-message-${mid}`}
                  message={message.data}
                  cache={cache}
                  discordApplicationId={discordApplicationId}
                  webhooks={Object.values(targets)}
                  index={i}
                  data={data}
                  files={files[mid]}
                  setImageModalData={setImageModalData}
                  messageDisplay={settings.messageDisplay}
                  compactAvatars={settings.compactAvatars}
                  cdn={cdn}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
