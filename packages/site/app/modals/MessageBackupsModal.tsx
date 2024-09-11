import { Link } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import type {
  LoadedBackup,
  loader as MeBackupsLoader,
} from "~/routes/me.backups";
import { User } from "~/session.server";
import { QueryData } from "~/types/QueryData";
import { useSafeFetcher } from "~/util/loader";
import { action as ApiPostBackups } from "../api/v1/backups";
import { loader as ApiGetBackup } from "../api/v1/backups.$id";
import { BackupEditModal } from "./BackupEditModal";
import { Modal, ModalProps, PlainModalHeader } from "./Modal";

export const MessageBackupsModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    data: QueryData;
    setBackupId: React.Dispatch<React.SetStateAction<bigint | undefined>>;
    setData: React.Dispatch<QueryData>;
    user?: User | null;
  },
) => {
  const { t } = useTranslation();
  const { targets, data, setData, setBackupId, user } = props;
  const [error, setError] = useError(t);

  const dataWithTargets = useMemo(
    () => ({
      ...data,
      targets: Object.values(targets).map((t) => ({
        url: `https://discord.com/api/webhooks/${t.id}/${t.token}`,
      })),
    }),
    [data, targets],
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

  // biome-ignore lint/correctness/useExhaustiveDependencies:
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
          {!!backups && (
            <div className="space-y-2 mt-2 overflow-y-auto max-h-72">
              {backups.map((b) => (
                <div
                  key={`backup-${b.id}`}
                  className={twJoin(
                    "rounded bg-gray-200 dark:bg-gray-700 p-2 flex transition",
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
                        className="m-auto text-lg"
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
              ))}
            </div>
          )}
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          {backup || backupFetcher.state !== "idle" ? (
            <div className="rounded bg-gray-200 dark:bg-gray-700 p-2 flex">
              {backup?.previewImageUrl ? (
                <div
                  style={{ backgroundImage: `url(${backup.previewImageUrl})` }}
                  className="bg-cover bg-center w-9 my-auto rounded aspect-square ltr:ml-2 rtl:mr-2 ltr:mr-4 rtl:ml-4"
                />
              ) : (
                <div className="w-9 h-9 my-auto ltr:ml-2 rtl:mr-2 ltr:mr-4 rtl:ml-4 flex rounded bg-blurple">
                  <CoolIcon icon="File_Document" className="m-auto text-2xl" />
                </div>
              )}
              <div className="my-auto grow">
                {backup ? (
                  <div className="flex max-w-full">
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
                <p className="text-sm">{t("savedAutomatically")}</p>
              </div>
              <Button
                disabled={!backup || backupFetcher.state !== "idle"}
                className="my-auto ml-auto"
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
                />
              </div>
              <Button
                className="mt-auto ltr:ml-2 rtl:mr-2"
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
