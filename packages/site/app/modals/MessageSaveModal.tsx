import { Link, useFetcher } from "@remix-run/react";
import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { User } from "~/session.server";
import { QueryData } from "~/types/QueryData";
import { copyText } from "~/util/text";
import { relativeTime } from "~/util/time";
import { action as backupCreateAction } from "../api/v1/backups";
import { action as shareCreateAction } from "../api/v1/share";
import { Modal, ModalProps } from "./Modal";

export const MessageSaveModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    data: QueryData;
    setData: React.Dispatch<QueryData>;
    user?: User | null;
  },
) => {
  const { t } = useTranslation();
  const { targets, data, setData, user } = props;

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

  const shareFetcher = useFetcher<typeof shareCreateAction>();
  const backupFetcher = useFetcher<typeof backupCreateAction>();

  const generateShareData = useCallback(
    (options?: { includeTargets_?: boolean }) => {
      const { includeTargets_ } = options ?? {};
      shareFetcher.submit(
        {
          data: JSON.stringify(
            includeTargets_ ?? includeTargets ? dataWithTargets() : data,
          ),
        },
        { method: "POST", action: apiUrl(BRoutes.share()) },
      );
    },
    [includeTargets, data, shareFetcher.submit],
  );

  const [backup, setBackup] = useState<typeof backupFetcher.data>();
  useEffect(() => setBackup(backupFetcher.data), [backupFetcher.data]);
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (props.open && user && data.backup_id !== undefined && !backup) {
      backupFetcher.load(apiUrl(BRoutes.backups(data.backup_id)));
    }
    if (props.open && backup && typeof data.backup_id !== "number") {
      setData({ ...data, backup_id: backup.id });
    }
  }, [props.open, data.backup_id, backup]);

  return (
    <Modal title={t("saveMessageTitle")} {...props}>
      <div className="flex">
        <div className="grow">
          <TextInput
            label={t("temporaryShareUrl")}
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
      </div>
      {shareFetcher.data && (
        <p className="mt-1">
          <Trans
            t={t}
            i18nKey="linkExpiresAt"
            values={{
              time: new Date(shareFetcher.data.expires).toLocaleString(),
              relativeTime: relativeTime(
                new Date(shareFetcher.data.expires),
                t,
              ),
            }}
          />
        </p>
      )}
      <p className="text-sm font-medium mt-1">{t("options")}</p>
      <Checkbox
        label={t("includeWebhookUrls")}
        checked={includeTargets}
        onChange={(e) => {
          setIncludeTargets(e.currentTarget.checked);
          if (shareFetcher.data) {
            generateShareData({ includeTargets_: e.currentTarget.checked });
          }
        }}
      />
      <hr className="border border-gray-400 dark:border-gray-600 my-4" />
      <p className="text-lg font-medium">Backup</p>
      {user ? (
        <div>
          <Link
            to="/me"
            target="_blank"
            className="text-[#006ce7] dark:text-[#00a8fc] hover:underline"
          >
            {t("manageBackups")}
          </Link>
          {backupFetcher.state !== "idle" || backup ? (
            <div className="rounded bg-gray-200 dark:bg-gray-700 p-2 flex">
              <CoolIcon
                icon="File_Document"
                className="ml-2 mr-4 text-4xl my-auto"
              />
              <div className="my-auto grow">
                {backup ? (
                  <p className="font-semibold">{backup.name}</p>
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
                      {
                        data: JSON.stringify(dataWithTargets()),
                      },
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
                onClick={() =>
                  backupFetcher.submit(
                    {
                      name: new Date().toLocaleDateString(),
                      data: JSON.stringify(dataWithTargets()),
                    },
                    {
                      action: apiUrl(BRoutes.backups()),
                      method: "POST",
                    },
                  )
                }
              >
                {t("saveBackup")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/auth/discord"
          target="_blank"
          className="text-[#006ce7] dark:text-[#00a8fc] hover:underline"
        >
          {t("logInToSaveBackups")}
        </Link>
      )}
    </Modal>
  );
};
