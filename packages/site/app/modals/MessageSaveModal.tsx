import { Link } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { LoadedBackup } from "~/routes/me";
import { User } from "~/session.server";
import { QueryData } from "~/types/QueryData";
import { useSafeFetcher } from "~/util/loader";
import { copyText } from "~/util/text";
import { action as ApiPostBackups } from "../api/v1/backups";
import { action as ApiGetBackup } from "../api/v1/backups.$id";
import { action as ApiPostShare } from "../api/v1/share";
import { BackupEditModal } from "./BackupEditModal";
import { Modal, ModalProps } from "./Modal";

export const MessageSaveModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    data: QueryData;
    setBackupId: React.Dispatch<React.SetStateAction<bigint | undefined>>;
    user?: User | null;
  },
) => {
  const { t } = useTranslation();
  const { targets, data, setBackupId, user } = props;
  const [error, setError] = useError(t);

  const [includeTargets, setIncludeTargets] = useState(false);
  const dataWithTargets = useCallback(
    () => ({
      ...data,
      targets: Object.values(targets).map((t) => ({
        url: `https://discord.com/api/webhooks/${t.id}/${t.token}`,
      })),
    }),
    [data, targets],
  );

  const shareFetcher = useSafeFetcher<typeof ApiPostShare>({
    onError: setError,
  });
  const backupFetcher = useSafeFetcher<
    typeof ApiPostBackups | typeof ApiGetBackup
  >({
    onError: setError,
  });

  const generateShareData = useCallback(
    (options?: { includeTargets_?: boolean }) => {
      const { includeTargets_ } = options ?? {};
      shareFetcher.submit(
        { data: includeTargets_ ?? includeTargets ? dataWithTargets() : data },
        { method: "POST", action: apiUrl(BRoutes.share()) },
      );
    },
    [includeTargets, data, shareFetcher.submit],
  );

  const backup = backupFetcher.data as LoadedBackup | undefined;
  const [editingBackup, setEditingBackup] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (props.open && user && data.backup_id !== undefined && !backup) {
      backupFetcher.load(apiUrl(BRoutes.backups(data.backup_id)));
    }
  }, [props.open, data.backup_id, backup]);

  return (
    <Modal title={t("saveMessageTitle")} {...props}>
      <BackupEditModal
        open={editingBackup}
        setOpen={setEditingBackup}
        backup={backup}
      />
      {error}
      <div className="flex">
        <div className="grow">
          <TextInput
            label={
              <Trans
                t={t}
                i18nKey={
                  shareFetcher.data
                    ? "temporaryShareUrlExpires"
                    : "temporaryShareUrl"
                }
                components={[
                  <span
                    className="text-blurple dark:text-blurple-300"
                    title={
                      shareFetcher.data
                        ? t("timestamp.full", {
                            replace: {
                              date: new Date(shareFetcher.data.expires),
                            },
                          })
                        : ""
                    }
                  />,
                ]}
                count={
                  shareFetcher.data
                    ? Math.floor(
                        (new Date(shareFetcher.data.expires).getTime() -
                          new Date().getTime()) /
                          86_400_000,
                      )
                    : undefined
                }
              />
            }
            className="w-full"
            value={shareFetcher.data ? shareFetcher.data.url : ""}
            placeholder={t("clickGenerate")}
            readOnly
          />
        </div>
        <Button
          disabled={shareFetcher.state !== "idle"}
          onClick={() => {
            if (shareFetcher.data) {
              copyText(shareFetcher.data.url);
            } else {
              generateShareData();
            }
          }}
          className="ml-2 mt-auto"
        >
          {t(shareFetcher.data ? "copy" : "generate")}
        </Button>
        <Button
          disabled={shareFetcher.state !== "idle" || !shareFetcher.data}
          onClick={shareFetcher.reset}
          className="ml-2 mt-auto"
          discordstyle={ButtonStyle.Secondary}
        >
          {t("clear")}
        </Button>
      </div>
      <p className="text-sm font-medium mt-1">{t("options")}</p>
      <Checkbox
        label={t("includeWebhookUrls")}
        checked={includeTargets}
        disabled={Object.keys(targets).length === 0}
        onChange={(e) => {
          setIncludeTargets(e.currentTarget.checked);
          if (shareFetcher.data) {
            generateShareData({ includeTargets_: e.currentTarget.checked });
          }
        }}
      />
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <p className="text-lg font-medium">{t("backup")}</p>
      {user ? (
        <div>
          <Link to="/me?t=backups" target="_blank" className={linkClassName}>
            {t("manageBackups")}
          </Link>
          {backupFetcher.state !== "idle" || backup ? (
            <div className="rounded bg-gray-200 dark:bg-gray-700 p-2 flex">
              <CoolIcon
                icon="File_Document"
                className="ltr:ml-2 rtl:mr-2 ltr:mr-4 rtl:ml-4 text-4xl my-auto"
              />
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
                disabled={!backup}
                className="my-auto ml-auto"
                discordstyle={ButtonStyle.Success}
                onClick={() => {
                  if (backup) {
                    backupFetcher.submit(
                      { data: dataWithTargets() },
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
            <div className="mt-1">
              <Button
                onClick={async () => {
                  const created = await backupFetcher.submitAsync(
                    {
                      name: new Date().toLocaleDateString(),
                      data: dataWithTargets(),
                    },
                    {
                      action: apiUrl(BRoutes.backups()),
                      method: "POST",
                    },
                  );
                  setBackupId(BigInt(created.id));
                }}
              >
                {t("saveBackup")}
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
