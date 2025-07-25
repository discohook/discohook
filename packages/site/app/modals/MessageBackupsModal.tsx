import { Link } from "@remix-run/react";
import { type APIWebhook, ButtonStyle } from "discord-api-types/v10";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { TextInput } from "~/components/TextInput";
import type {
  LoadedBackup,
  loader as MeBackupsLoader,
} from "~/routes/me.backups";
import type { User } from "~/session.server";
import type { QueryData, QueryDataTarget } from "~/types/QueryData";
import { TargetType } from "~/types/QueryData-raw";
import type { CacheManager } from "~/util/cache/CacheManager";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { getWebhook } from "~/util/discord";
import { useSafeFetcher } from "~/util/loader";
import type { action as ApiPostBackups } from "../api/v1/backups";
import type { loader as ApiGetBackup } from "../api/v1/backups.$id";
import { BackupEditModal } from "./BackupEditModal";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

export const MessageBackupsModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    data: QueryData;
    setBackupId: React.Dispatch<React.SetStateAction<bigint | undefined>>;
    updateTargets: React.Dispatch<Partial<Record<string, APIWebhook>>>;
    setData: React.Dispatch<QueryData>;
    user?: User | null;
    cache?: CacheManager;
  },
) => {
  const { t } = useTranslation();
  const { targets, data, setData, updateTargets, setBackupId, user, cache } =
    props;
  const [error, setError] = useError(t);

  const dataWithTargets = useMemo(
    () =>
      ({
        ...data,
        targets: Object.values(targets).map((t) => ({
          type: TargetType.Webhook,
          url: `https://discord.com/api/webhooks/${t.id}/${t.token}`,
        })),
      }) satisfies QueryData,
    [data, targets],
  );

  // Reset existing targets and add from the backup (if any)
  const setTargets = useCallback(
    async (newTargets: QueryDataTarget[] | undefined) => {
      const keys = Object.keys(targets);
      for (const key of keys) {
        delete targets[key];
      }
      if (!newTargets || newTargets.length === 0) {
        // state update
        updateTargets({});
        return;
      }

      const cachingGuildIds: string[] = [];
      for (const target of newTargets) {
        if (target.type && target.type !== TargetType.Webhook) continue;
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
    },
    [targets, updateTargets, cache],
  );

  const [backups, setBackups] = useState<LoadedBackup[]>();
  const meBackupsFetcher = useSafeFetcher<typeof MeBackupsLoader>({
    onError: setError,
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when loader changes
  useEffect(() => {
    if (meBackupsFetcher.data && meBackupsFetcher.state === "idle") {
      const current = [...(backups ?? [])];
      const currentIds = current.map((b) => b.id);
      current.push(
        ...meBackupsFetcher.data.backups.filter(
          (b) => !currentIds.includes(b.id),
        ),
      );
      if (current.length !== backups?.length) {
        setBackups(current);
      }

      if (meBackupsFetcher.data.backups.length === 50) {
        // assume there are more pages (50 is max per page)
        meBackupsFetcher.load(
          `/me/backups?${new URLSearchParams({
            _data: "routes/me.backups",
            page: String(meBackupsFetcher.data.page + 1),
          })}`,
        );
      }
    }
  }, [meBackupsFetcher]);

  const [draftName, setDraftName] = useState<string>();
  const backupFetcher = useSafeFetcher<
    typeof ApiPostBackups | typeof ApiGetBackup
  >({
    onError: setError,
  });

  const backup = useMemo(() => {
    if (backupFetcher.data) {
      return backupFetcher.data;
    }
    if (backups) {
      return backups.find((b) => b.id.toString() === data.backup_id);
    }
  }, [backups, data.backup_id, backupFetcher]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only update on open change
  useEffect(() => {
    if (props.open && user && !backups && meBackupsFetcher.state === "idle") {
      meBackupsFetcher.load("/me/backups?_data=routes/me.backups");
    }
  }, [props.open]);

  const [editingBackup, setEditingBackup] = useState(false);
  return (
    <Modal {...props}>
      <PlainModalHeader>{t("backups")}</PlainModalHeader>
      <BackupEditModal
        open={editingBackup}
        setOpen={setEditingBackup}
        backup={backup}
      />
      {error}
      {user ? (
        <div>
          <Link to="/me/backups" target="_blank" className={linkClassName}>
            {t("manageBackups")}
          </Link>
          <div
            className={twJoin(
              "space-y-2 mt-2 overflow-y-auto max-h-72",
              backups ? undefined : "animate-pulse",
            )}
          >
            {backups
              ? backups.map((b) => (
                  <div
                    key={`backup-${b.id}`}
                    className={twJoin(
                      "rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 p-2 flex transition",
                      b.id.toString() === data.backup_id
                        ? "opacity-60 pointer-events-none"
                        : undefined,
                    )}
                  >
                    {b.previewImageUrl ? (
                      <div
                        style={{ backgroundImage: `url(${b.previewImageUrl})` }}
                        className="bg-cover bg-center w-7 my-auto rounded aspect-square ltr:mr-2 rtl:ml-2"
                      />
                    ) : (
                      <div className="w-7 h-7 my-auto ltr:mr-2 rtl:ml-2 flex rounded bg-blurple">
                        <CoolIcon
                          icon="File_Document"
                          className="m-auto text-lg text-gray-50"
                        />
                      </div>
                    )}
                    <p className="truncate my-auto">{b.name}</p>
                    <div className="ltr:ml-auto rtl:mr-auto flex space-x-1.5 rtl:space-x-reverse text-xl my-auto">
                      <button
                        type="button"
                        title={t("openBackupLoad")}
                        onClick={async () => {
                          if (backup) {
                            await backupFetcher.submitAsync(
                              { data: dataWithTargets },
                              {
                                action: apiUrl(BRoutes.backups(backup.id)),
                                method: "PATCH",
                              },
                            );
                          }
                          const loadedBackup = await backupFetcher.loadAsync(
                            `${apiUrl(BRoutes.backups(b.id))}?data=true`,
                          );
                          // Always true, this is just a type guard
                          if ("data" in loadedBackup && loadedBackup.data) {
                            document.title = `${b.name} - Discohook`;
                            setData({
                              ...loadedBackup.data,
                              // Just in case
                              backup_id: b.id.toString(),
                            });
                            setTargets(loadedBackup.data.targets);
                            setBackupId(b.id);
                          }
                        }}
                      >
                        <CoolIcon icon="File_Edit" />
                      </button>
                      <button
                        type="button"
                        title={t("openBackupClone")}
                        onClick={async () => {
                          if (backup) {
                            await backupFetcher.submitAsync(
                              { data: dataWithTargets },
                              {
                                action: apiUrl(BRoutes.backups(backup.id)),
                                method: "PATCH",
                              },
                            );
                          }
                          const loadedBackup = await backupFetcher.loadAsync(
                            `${apiUrl(BRoutes.backups(b.id))}?data=true`,
                          );
                          // Always true, this is just a type guard
                          if ("data" in loadedBackup && loadedBackup.data) {
                            const created = await backupFetcher.submitAsync(
                              {
                                name: `Copy of ${b.name}`.slice(0, 100),
                                data: loadedBackup.data,
                              },
                              {
                                action: apiUrl(BRoutes.backups()),
                                method: "POST",
                              },
                            );
                            document.title = `${created.name} - Discohook`;
                            setData({
                              ...loadedBackup.data,
                              backup_id: created.id.toString(),
                            });
                            // This isn't totally necessary for a duplicated backup
                            setTargets(loadedBackup.data.targets);
                            setBackupId(created.id);
                          }
                        }}
                      >
                        <CoolIcon icon="Copy" />
                      </button>
                      <Link
                        to={`/?backup=${b.id}`}
                        title={t("openBackupNewTab")}
                        target="_blank"
                      >
                        <CoolIcon icon="External_Link" />
                      </Link>
                    </div>
                  </div>
                ))
              : Array(10)
                  .fill(undefined)
                  .map((_, i) => (
                    <div
                      key={`backup-skeleton-${i}`}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 p-2 flex transition gap-2"
                    >
                      <div className="w-7 h-7 my-auto flex rounded bg-blurple">
                        <CoolIcon
                          icon="File_Document"
                          className="m-auto text-lg text-gray-50"
                        />
                      </div>
                      <div className="my-auto rounded-full h-4 w-36 bg-gray-300 dark:bg-gray-600" />
                    </div>
                  ))}
          </div>
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          {backup || backupFetcher.state !== "idle" ? (
            <div className="rounded-lg border border-gray-300 dark:border-gray-700 shadow bg-gray-200 dark:bg-gray-800 py-2 px-4 flex gap-x-4">
              {backup?.previewImageUrl ? (
                <div
                  style={{ backgroundImage: `url(${backup.previewImageUrl})` }}
                  className="bg-cover bg-center w-9 my-auto rounded aspect-square shrink-0"
                />
              ) : (
                <div className="w-9 h-9 my-auto flex rounded bg-blurple shrink-0">
                  <CoolIcon icon="File_Document" className="m-auto text-2xl" />
                </div>
              )}
              <div className="my-auto grow">
                {backup ? (
                  <div className="flex max-w-full truncate">
                    <p className="font-semibold truncate">{backup.name}</p>
                    <button
                      type="button"
                      className="ltr:ml-2 rtl:mr-2 my-auto"
                      onClick={() => setEditingBackup(true)}
                    >
                      <CoolIcon icon="Edit_Pencil_01" />
                    </button>
                  </div>
                ) : (
                  <div className="h-5 rounded-full bg-gray-400 dark:bg-gray-600 w-1/5 mt-px" />
                )}
                <p className="text-sm text-muted dark:text-muted-dark leading-none">
                  {t("savedAutomatically")}
                </p>
              </div>
              <div className="my-auto ltr:ml-auto rtl:mr-auto flex flex-col sm:flex-row-reverse gap-1">
                <Button
                  disabled={!backup || backupFetcher.state !== "idle"}
                  discordstyle={ButtonStyle.Success}
                  onClick={() => {
                    if (backup) {
                      backupFetcher.submit(
                        { data: dataWithTargets },
                        {
                          action: apiUrl(BRoutes.backups(backup.id)),
                          method: "PATCH",
                        },
                      );
                    }
                  }}
                >
                  {t("save")}
                </Button>
                <Button
                  disabled={!backup}
                  discordstyle={ButtonStyle.Secondary}
                  onClick={() => {
                    if (backup) {
                      setData({ ...data, backup_id: undefined });
                      setBackupId(undefined);
                      backupFetcher.reset();
                    }
                  }}
                >
                  {t("unlink")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex">
              <div className="grow">
                <TextInput
                  label={t("name")}
                  className="w-full"
                  maxLength={100}
                  value={draftName ?? ""}
                  onChange={(e) => setDraftName(e.currentTarget.value)}
                  required
                />
              </div>
              <Button
                className="mt-auto ltr:ml-2 rtl:mr-2 h-9"
                disabled={!draftName?.trim()}
                onClick={async () => {
                  const created = await backupFetcher.submitAsync(
                    {
                      name:
                        draftName?.trim() || new Date().toLocaleDateString(),
                      data: dataWithTargets,
                    },
                    {
                      action: apiUrl(BRoutes.backups()),
                      method: "POST",
                    },
                  );
                  document.title = `${created.name} - Discohook`;
                  setData({ ...data, backup_id: String(created.id) });
                  setBackupId(BigInt(created.id));

                  if (!backups) {
                    setBackups([created]);
                  } else if (!backups.find((b) => b.id === created.id)) {
                    setBackups([...backups, created]);
                  }
                }}
              >
                {t("createBackup")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/auth/discord" target="_blank" className={linkClassName}>
          {t("logInToSaveBackups")}
        </Link>
      )}
    </Modal>
  );
};
