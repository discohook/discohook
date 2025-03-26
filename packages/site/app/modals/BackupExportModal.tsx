import type { SerializeFrom } from "@remix-run/cloudflare";
import { Await, Link } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { loader as ApiGetBackups } from "~/api/.server/v1/backups";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { InfoBox } from "~/components/InfoBox";
import { CoolIcon } from "~/components/icons/CoolIcon";
import type { LoadedBackup } from "~/routes/me.backups";
import type {
  DiscohookBackup,
  DiscohookBackupExportDataWithBackups,
} from "~/types/discohook";
import { Modal, type ModalProps } from "./Modal";

// https://github.com/discohook/site/blob/main/common/dom/downloadBlob.ts
export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  // @ts-expect-error
  document.body.append(anchor);

  anchor.href = url;
  anchor.download = name;

  anchor.click();

  anchor.remove();
  URL.revokeObjectURL(url);
};

export const BackupExportModal = (
  props: ModalProps & { backups: LoadedBackup[] },
) => {
  const { t } = useTranslation();
  const { backups } = props;
  const [selectedBackups, setSelectedBackups] = useState<bigint[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!props.open) {
      setSelectedBackups([]);
      setError(undefined);
    }
  }, [props.open]);

  return (
    <Modal title={t("exportBackups")} {...props}>
      {error && <InfoBox severity="red">{error}</InfoBox>}
      <p>{t("exportBackupsNote")}</p>
      <div className="my-2 space-y-1 overflow-y-auto max-h-96">
        <Suspense>
          <Await resolve={backups}>
            {(backups) =>
              backups.map((backup) => {
                return (
                  <div className="flex" key={`export-backup-${backup.id}`}>
                    <button
                      type="button"
                      className="rounded px-4 bg-gray-300 dark:bg-gray-700 flex grow min-h-[2.5rem]"
                      onClick={() => {
                        if (selectedBackups.includes(backup.id)) {
                          setSelectedBackups(
                            selectedBackups.filter((b) => b !== backup.id),
                          );
                        } else {
                          setSelectedBackups([...selectedBackups, backup.id]);
                        }
                      }}
                    >
                      <div className="my-auto truncate mr-2 text-left py-2">
                        <p className="font-semibold truncate">{backup.name}</p>
                      </div>
                      <div className="my-auto ml-auto">
                        <CoolIcon
                          icon={
                            selectedBackups.includes(backup.id)
                              ? "Checkbox_Check"
                              : "Checkbox_Unchecked"
                          }
                          className="text-blurple-400 text-xl"
                        />
                      </div>
                    </button>
                    <Link
                      to={`/?backup=${backup.id}`}
                      className="flex text-xl ml-1 shrink-0 rounded bg-gray-300 dark:bg-gray-700 w-10 min-h-[2.5rem]"
                      title={`View ${backup.name}`}
                      target="_blank"
                    >
                      <CoolIcon
                        icon="External_Link"
                        className="text-blurple-400 m-auto"
                      />
                    </Link>
                  </div>
                );
              })
            }
          </Await>
        </Suspense>
      </div>
      <div className="flex w-full mt-4">
        <Button
          onClick={async () => {
            if (selectedBackups.length === 0) return;

            const response = await fetch(
              `${apiUrl(BRoutes.backups())}?${new URLSearchParams({
                ids: selectedBackups.join(","),
              })}`,
              { method: "GET" },
            );
            if (!response.ok) {
              const data = (await response.json()) as { message: string };
              setError(data.message);
              return;
            }
            setError(undefined);
            const withData = (await response.json()) as SerializeFrom<
              typeof ApiGetBackups
            >;

            const blob = new Blob(
              [
                JSON.stringify(
                  {
                    version: 8,
                    backups: backups
                      .filter((b) => selectedBackups.includes(b.id))
                      .map((backup) => {
                        const data = withData.find((b) => b.id === backup.id);
                        return {
                          // id: backup.id,
                          name: backup.name,
                          messages: data
                            ? data.data.messages
                            : [
                                {
                                  data: {
                                    content:
                                      "The data for this backup was not found on the Discohook server. This usually shouldn't happen.",
                                  },
                                },
                              ],
                          targets: data ? data.data.targets : [],
                          schedule:
                            data?.scheduled && data?.cron
                              ? {
                                  cron: data.cron,
                                  timezone: data.timezone ?? undefined,
                                }
                              : undefined,
                        } satisfies DiscohookBackup;
                      }),
                  } satisfies DiscohookBackupExportDataWithBackups,
                  undefined,
                  2,
                ),
                "\n",
              ],
              { type: "application/json" },
            );
            downloadBlob(
              blob,
              `backups-${new Date().toISOString().split("T")[0]}.json`,
            );
            props.setOpen(false);
          }}
          className="mx-auto"
          disabled={selectedBackups.length === 0}
        >
          Export {selectedBackups.length}
        </Button>
      </div>
    </Modal>
  );
};
