import { SerializeFrom, json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { BackupEditModal } from "~/modals/BackupEditModal";
import { BackupExportModal } from "~/modals/BackupExportModal";
import { BackupImportModal } from "~/modals/BackupImportModal";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { getUserId } from "~/session.server";
import {
  QueryDataVersion,
  backups as dBackups,
  getDb,
  inArray,
} from "~/store.server";
import { ZodDiscohookBackup } from "~/types/discohook";
import { getId } from "~/util/id";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { relativeTime } from "~/util/time";
import {
  jsonAsString,
  snowflakeAsString,
  zxParseForm,
  zxParseQuery,
} from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const userId = await getUserId(request, context, true);
  const { page, settings: importedSettings } = zxParseQuery(request, {
    settings: jsonAsString(
      z.object({
        theme: z.enum(["light", "dark"]).optional(),
        display: z.enum(["cozy", "compact"]).optional(),
        fontSize: z.onumber(),
        confirmExit: z.oboolean(),
        expandSections: z.oboolean(),
      }),
    ).optional(),
    page: z
      .number()
      .min(1)
      .default(1)
      .transform((i) => i - 1),
  });

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const backups = await db.query.backups.findMany({
    where: (backups, { eq }) => eq(backups.ownerId, userId),
    columns: {
      id: true,
      name: true,
      previewImageUrl: true,
      importedFromOrg: true,
      scheduled: true,
      nextRunAt: true,
      cron: true,
      timezone: true,
    },
    orderBy: (backups, { desc }) => desc(backups.name),
    limit: 50,
    offset: page * 50,
  });

  return { backups, importedSettings };
};

export const action = async ({ request, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  switch (request.method) {
    case "POST": {
      const data = await zxParseForm(request, {
        backups: ZodDiscohookBackup.array(),
      });
      const created = await db
        .insert(dBackups)
        .values(
          data.backups.map((backup) => ({
            name: backup.name,
            dataVersion: "d2" as QueryDataVersion,
            data: {
              version: "d2" as QueryDataVersion,
              messages: backup.messages,
              targets: backup.targets,
            },
            ownerId: userId,
          })),
        )
        .returning({ id: dBackups.id, name: dBackups.name });
      return json(created, 201);
    }
    case "DELETE": {
      const { ids } = await zxParseForm(request, {
        ids: jsonAsString(snowflakeAsString().array().min(1).max(50)),
      });

      const backups = await db.query.backups.findMany({
        where: (backups, { inArray }) => inArray(backups.id, ids),
        columns: { id: true, ownerId: true },
      });
      const ownIds = backups.filter((b) => b.ownerId === userId);

      if (ownIds.length > 0) {
        await db.delete(dBackups).where(
          inArray(
            dBackups.id,
            ownIds.map((b) => b.id),
          ),
        );
      }
      return json({ deleted: ownIds.length });
    }
  }

  throw new Response(undefined, { status: 405 });
};

export type LoadedBackup = Awaited<
  SerializeFrom<typeof loader>["backups"]
>[number];

export default () => {
  const { t } = useTranslation();
  const { backups, importedSettings } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [settings, updateSettings] = useLocalStorage();
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (importedSettings) {
      updateSettings({
        theme: importedSettings.theme ?? settings.theme,
        messageDisplay: importedSettings.display ?? settings.messageDisplay,
      });
    }
  }, []);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingBackup, setEditingBackup] = useState<LoadedBackup>();
  const [confirm, setConfirm] = useConfirmModal();

  return (
    <div>
      <BackupImportModal
        open={importModalOpen}
        setOpen={setImportModalOpen}
        backups={backups}
      />
      <BackupExportModal
        open={exportModalOpen}
        setOpen={setExportModalOpen}
        backups={backups}
      />
      <BackupEditModal
        open={!!editingBackup}
        setOpen={() => setEditingBackup(undefined)}
        backup={editingBackup}
        onSave={() => {
          submit(null, { method: "GET" });
          setEditingBackup(undefined);
        }}
      />
      {confirm}
      <div className="mb-4 flex">
        <p className="text-xl font-semibold dark:text-gray-100 my-auto">
          {t("backups")}
        </p>
        <Button
          className="ltr:ml-auto rtl:mr-auto my-auto"
          onClick={() => setImportModalOpen(true)}
        >
          {t("import")}
        </Button>
        <Button
          className="ltr:ml-2 rtl:mr-2 my-auto"
          onClick={() => setExportModalOpen(true)}
        >
          {t("export")}
        </Button>
      </div>
      {backups.length > 0 ? (
        <div className="space-y-1">
          {backups.map((backup) => {
            const createdAt = new Date(getId(backup).timestamp);
            return (
              <div
                key={`backup-${backup.id}`}
                className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex"
              >
                {backup.previewImageUrl && (
                  <div
                    style={{
                      backgroundImage: `url(${backup.previewImageUrl})`,
                    }}
                    className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square mr-2 hidden sm:block"
                  />
                )}
                <div className="truncate my-auto">
                  <div className="flex max-w-full">
                    <p className="font-medium truncate">{backup.name}</p>
                    <button
                      type="button"
                      className="ltr:ml-2 rtl:mr-2 my-auto"
                      onClick={() => setEditingBackup(backup)}
                    >
                      <CoolIcon icon="Edit_Pencil_01" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-500 text-sm">
                    {backup.nextRunAt ? (
                      <Trans
                        t={t}
                        i18nKey={
                          backup.cron ? "nextRunAtRepeat" : "nextRunAtOnce"
                        }
                        components={[
                          <Twemoji
                            emoji="🕑"
                            className="grayscale ltr:mr-1 rtl:ml-1"
                          />,
                        ]}
                        values={{
                          relative: relativeTime(new Date(backup.nextRunAt), t),
                          date: new Date(backup.nextRunAt),
                        }}
                      />
                    ) : backup.importedFromOrg ? (
                      <>
                        <Twemoji emoji="✨" className="grayscale" />{" "}
                        {t("importedFromOrgAt", {
                          replace: { date: createdAt },
                        })}
                      </>
                    ) : (
                      t("createdAt", { replace: { createdAt } })
                    )}
                  </p>
                </div>
                <div className="ltr:ml-auto rtl:mr-auto ltr:pl-2 rtl:pr-2 my-auto flex gap-2">
                  <Link to={`/?backup=${backup.id}`} target="_blank">
                    <Button discordstyle={ButtonStyle.Secondary}>
                      <CoolIcon icon="External_Link" />
                    </Button>
                  </Link>
                  <Button
                    discordstyle={ButtonStyle.Danger}
                    onClick={(e) => {
                      const callback = () =>
                        submit(
                          { ids: JSON.stringify([backup.id]) },
                          { method: "DELETE", replace: true },
                        );

                      if (e.shiftKey) {
                        callback();
                        return;
                      }

                      setConfirm({
                        title: t("deleteBackup"),
                        children: (
                          <>
                            <p>{t("deleteBackupConfirm")}</p>
                            <div className="rounded-lg p-4 flex bg-gray-100 dark:bg-gray-900/60 shadow my-2">
                              {backup.previewImageUrl && (
                                <div
                                  style={{
                                    backgroundImage: `url(${backup.previewImageUrl})`,
                                  }}
                                  className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square mr-2 hidden sm:block"
                                />
                              )}
                              <div className="truncate my-auto">
                                <p className="font-medium truncate">
                                  {backup.name}
                                </p>
                                <p className="text-gray-600 dark:text-gray-500 text-sm">
                                  {t("createdAt", {
                                    replace: { createdAt },
                                  })}
                                </p>
                              </div>
                            </div>
                            <p className="text-muted dark:text-muted-dark text-sm font-medium">
                              {t("shiftSkipTip")}
                            </p>
                            <Button
                              className="mt-4"
                              discordstyle={ButtonStyle.Danger}
                              onClick={() => {
                                callback();
                                setConfirm(undefined);
                              }}
                            >
                              {t("delete")}
                            </Button>
                          </>
                        ),
                      });
                    }}
                  >
                    <CoolIcon icon="Trash_Full" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">{t("noBackups")}</p>
      )}
    </div>
  );
};
