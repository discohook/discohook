import { SerializeFrom, defer } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { isLinkButton } from "discord-api-types/utils/v10";
import { APIWebhook, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import React, { useEffect, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { UAParser } from "ua-parser-js";
import { SafeParseError, SafeParseReturnType, ZodError } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import { InvalidShareIdData } from "~/api/v1/share.$shareId";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { TextInput } from "~/components/TextInput";
import { MessageEditor } from "~/components/editor/MessageEditor.client";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Logo } from "~/components/icons/Logo";
import { PostChannelIcon } from "~/components/icons/channel";
import {
  ATTACHMENT_URI_EXTENSIONS,
  transformFileName,
} from "~/components/preview/Embed";
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
import { MessageFlagsEditModal } from "~/modals/MesageFlagsEditModal";
import { MessageBackupsModal } from "~/modals/MessageBackupsModal";
import {
  MessageSendModal,
  useMessageSubmissionManager,
} from "~/modals/MessageSendModal";
import { MessageSetModal } from "~/modals/MessageSetModal";
import { MessageShareModal } from "~/modals/MessageShareModal";
import { ModalFooter } from "~/modals/Modal";
import { ShareExpiredModal } from "~/modals/ShareExpiredModal";
import { SimpleTextModal } from "~/modals/SimpleTextModal";
import { TargetAddModal } from "~/modals/TargetAddModal";
import { WebhookEditModal } from "~/modals/WebhookEditModal";
import { getSessionStorage, getUser } from "~/session.server";
import { getDb } from "~/store.server";
import {
  APIMessageActionRowComponent,
  QueryData,
  ZodQueryData,
} from "~/types/QueryData";
import { useCache } from "~/util/cache/CacheManager";
import {
  INDEX_FAILURE_MESSAGE,
  INDEX_MESSAGE,
  WEBHOOK_URL_RE,
} from "~/util/constants";
import { cdnImgAttributes, getWebhook, webhookAvatarUrl } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
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
  const user = await getUser(request, context);
  const db = getDb(context.env.HYPERDRIVE);
  const memberships = (async () => {
    return user?.discordId
      ? (
          await db.query.discordMembers.findMany({
            where: (discordMembers, { eq }) =>
              // biome-ignore lint/style/noNonNullAssertion: Checked above
              eq(discordMembers.userId, user.discordId!),
            with: {
              guild: {
                columns: {
                  id: true,
                  name: true,
                  icon: true,
                  botJoinedAt: true,
                },
              },
            },
          })
        ).filter(
          (m) =>
            m.owner ||
            new PermissionsBitField(BigInt(m.permissions ?? "0")).has(
              PermissionFlags.ManageWebhooks,
            ),
        )
      : [];
  })();

  let authFailure: string | undefined;
  const defaultModal = new URL(request.url).searchParams.get("m");
  if (!user && defaultModal === "auth-failure") {
    const storage = getSessionStorage(context);
    const session = await storage.getSession(request.headers.get("Cookie"));
    authFailure = session.get("auth:error")?.toString() ?? undefined;
  }

  return defer({
    user,
    memberships,
    discordApplicationId: context.env.DISCORD_CLIENT_ID,
    debug: {
      environment: context.env.ENVIRONMENT,
      version: context.env.VERSION,
      authFailure,
    },
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

export const loadMessageComponents = async (
  data: QueryData,
  setData: React.Dispatch<QueryData>,
) => {
  const allComponentsById = Object.fromEntries(
    data.messages.flatMap((m) =>
      (m.data.components ?? [])
        .flatMap((r) => r.components)
        .map((c) => {
          if (!!c.custom_id && /^p_\d+/.test(c.custom_id)) {
            return [c.custom_id.replace(/^p_/, ""), c];
          }
          // We don't really need to load data for link buttons.
          // This is pretty much just to reduce residue.
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
  ) as Record<string, APIMessageActionRowComponent>;

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

export default function Index() {
  const { t } = useTranslation();
  const { user, memberships, discordApplicationId, debug } =
    useLoaderData<typeof loader>();
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
    const loadInitialTargets = async (targets: { url: string }[]) => {
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
  const [confirm, setConfirm] = useConfirmModal();

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  const ua = new UAParser(navigator.userAgent).getResult();

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
        setBackupId={setBackupId}
        user={user}
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
        hasAuthentication={!!user}
        setOpen={setAddingTarget}
        updateTargets={updateTargets}
        memberships={memberships}
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
            "p-4 h-full overflow-y-scroll",
            settings.forceDualPane
              ? "w-1/2"
              : twJoin("md:w-1/2", tab === "editor" ? "" : "hidden md:block"),
          )}
        >
          {error}
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
                                messages: [{ data: {} }],
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
                  setEditingMessageFlags={setEditingMessageFlags}
                  setJsonEditor={setJsonEditor}
                  setCodeGenerator={setCodeGenerator}
                  webhooks={Object.values(targets)}
                  setEditingComponent={setEditingComponent}
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
            <div className="flex">
              <PostChannelIcon className="h-5 w-5 my-auto ltr:mr-1 rtl:ml-1" />
              <span className="my-auto">{t("addMessage")}</span>
            </div>
          </Button>
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
                {ua.browser.name} {ua.browser.version} ({ua.engine.name}){"\n"}
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
                  API Docs
                </a>
                {location.hostname === "discohook.app" && (
                  <span>Email: "hello" at {location.hostname}</span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div
          className={twMerge(
            "border-l-gray-400 dark:border-l-[#1E1F22] h-full flex-col",
            settings.forceDualPane
              ? "flex w-1/2 border-l-2"
              : twJoin(
                  "md:w-1/2 md:border-l-2",
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
        </div>
      </div>
    </div>
  );
}
