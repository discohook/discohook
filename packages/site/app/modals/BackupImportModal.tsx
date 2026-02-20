import { Await, Link, useSubmit } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/Button";
import { FileInput } from "~/components/FileInput";
import { InfoBox } from "~/components/InfoBox";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import type {
  DiscohookBackup,
  DiscohookBackupExportData,
  MessageData,
} from "~/types/discohook";
import type { QueryData } from "~/types/QueryData";
import { base64UrlEncode, toSnakeCase } from "~/util/text";
import { Modal, ModalFooter, type ModalProps, PlainModalHeader } from "./Modal";

export const backupDataAsNewest = (
  data: DiscohookBackupExportData,
): DiscohookBackup[] => {
  switch (data.version) {
    case 1:
      return [
        {
          name: data.name,
          messages: [{ data: toSnakeCase(data.message) as MessageData }],
          targets: [],
        },
      ];
    case 2:
      return [
        {
          name: data.name,
          messages: [{ data: data.message }],
          targets: [],
        },
      ];
    case 3:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: [{ data: backup.message }],
        targets: backup.webhookUrl ? [{ url: backup.webhookUrl }] : [],
      }));
    case 4:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: backup.messages.map((message) => ({ data: message })),
        targets: backup.webhookUrl ? [{ url: backup.webhookUrl }] : [],
      }));
    case 5:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: backup.messages.map((message) => ({
          data: message,
          reference: backup.target.message,
        })),
        targets: backup.target.url ? [{ url: backup.target.url }] : [],
      }));
    case 6:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: backup.messages,
        targets: backup.target.url ? [{ url: backup.target.url }] : [],
      }));
    case 7:
    case 8:
      return data.backups;
    default:
      break;
  }
  return [];
};

export const BackupImportModal = (
  props: ModalProps & { backups: { name: string }[] },
) => {
  const { t } = useTranslation();
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [data, setData] = useState<DiscohookBackupExportData>();
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);
  const submit = useSubmit();

  useEffect(() => {
    if (!props.open) {
      setFileErrors([]);
      setData(undefined);
      setSelectedBackups([]);
    }
  }, [props.open]);

  const backups = data ? backupDataAsNewest(data) : undefined;

  return (
    <Modal {...props}>
      <PlainModalHeader>{t("importBackups")}</PlainModalHeader>
      <InfoBox icon="Info">
        <Trans
          t={t}
          i18nKey="importOrgPrompt"
          components={[
            <Link
              key="0"
              className={twMerge(linkClassName, "dark:text-blurple")}
              to="/me/import-org-backups"
            />,
          ]}
        />
      </InfoBox>
      <FileInput
        t={t}
        label={t("backupsFile")}
        accept=".json"
        errors={fileErrors}
        onInput={(e) => {
          const files = e.currentTarget.files;
          const file = files ? files[0] : undefined;
          if (file) {
            setData(undefined);
            setFileErrors([]);
            setSelectedBackups([]);

            if (file.type !== "application/json") {
              setFileErrors([t("badJsonFile")]);
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              try {
                const parsed = JSON.parse(reader.result as string);
                const result = parsed;
                setData(result);
                if ("backups" in result) {
                  setSelectedBackups(
                    result.backups.map((b: { name: string }) => b.name),
                  );
                }
              } catch {
                setFileErrors([t("failedBackupParse")]);
              }
            };
            reader.readAsText(file);
          }
        }}
      />
      {backups ? (
        <div className="my-2 space-y-1 overflow-y-auto max-h-96">
          {backups.map((backup, i) => {
            return (
              <div className="flex" key={`import-backup-${backup.name}-${i}`}>
                <button
                  type="button"
                  className="rounded px-4 bg-gray-300 dark:bg-gray-800 flex grow min-h-[2.5rem]"
                  onClick={() => {
                    if (selectedBackups.includes(backup.name)) {
                      setSelectedBackups(
                        selectedBackups.filter((b) => b !== backup.name),
                      );
                    } else {
                      setSelectedBackups([...selectedBackups, backup.name]);
                    }
                  }}
                >
                  <div className="my-auto truncate mr-2 text-left py-2">
                    <p className="font-semibold truncate">{backup.name}</p>
                    <Suspense>
                      <Await resolve={props.backups}>
                        {(pBackups) =>
                          pBackups.map((b) => b.name).includes(backup.name) && (
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                              <Trans
                                t={t}
                                i18nKey="backupNameDuplicate"
                                components={[
                                  <CoolIcon key="0" icon="Circle_Warning" />,
                                ]}
                              />
                            </p>
                          )
                        }
                      </Await>
                    </Suspense>
                  </div>
                  <div className="my-auto ml-auto">
                    <CoolIcon
                      icon={
                        selectedBackups.includes(backup.name)
                          ? "Checkbox_Check"
                          : "Checkbox_Unchecked"
                      }
                      className="text-blurple-400 text-xl"
                    />
                  </div>
                </button>
                <Link
                  to={`/?data=${base64UrlEncode(
                    JSON.stringify({
                      version: "d2",
                      messages: backup.messages,
                      targets: backup.targets,
                    } as QueryData),
                  )}`}
                  className="flex text-xl ml-1 shrink-0 rounded bg-gray-300 dark:bg-gray-800 w-10 min-h-[2.5rem]"
                  title={t("viewBackupName", {
                    replace: { name: backup.name },
                  })}
                  target="_blank"
                >
                  <CoolIcon
                    icon="External_Link"
                    className="text-blurple-400 m-auto"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
      <ModalFooter className="flex">
        <Button
          onClick={() => {
            submit(
              {
                backups: JSON.stringify(
                  backups?.filter((b) => selectedBackups.includes(b.name)) ??
                    [],
                ),
              },
              {
                method: "POST",
                replace: true,
              },
            );
            props.setOpen(false);
          }}
          className="ltr:ml-auto rtl:mr-auto"
          disabled={selectedBackups.length === 0}
        >
          {t("importCount", { count: selectedBackups.length })}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
