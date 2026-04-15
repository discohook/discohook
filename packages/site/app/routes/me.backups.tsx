import { json, type SerializeFrom } from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useEffect, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { z } from "zod/v3";
import { zx } from "zodix";
import { apiUrl, BRoutes } from "~/api/routing";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { TextInput, textInputStyles } from "~/components/TextInput";
import { BackupEditModal } from "~/modals/BackupEditModal";
import { BackupExportModal } from "~/modals/BackupExportModal";
import { BackupImportModal } from "~/modals/BackupImportModal";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { getUser, getUserId } from "~/session.server";
import {
  count,
  backups as dBackups,
  eq,
  getDb,
  inArray,
  type QueryDataVersion,
  scheduled_posts,
} from "~/store.server";
import { ZodDiscohookBackup } from "~/types/discohook";
import { getId } from "~/util/id";
import {
  type ActionArgs,
  type LoaderArgs,
  useSafeFetcher,
} from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { relativeTime } from "~/util/time";
import {
  jsonAsString,
  snowflakeAsString,
  zxParseForm,
  zxParseQuery,
} from "~/util/zod";
import type { action as ApiPostBackupsImportDiscoscheduler } from "../api/v1/backups.import.discoscheduler";

const sortableColumns = ["name", "nextRunAt", "updatedAt"] as const;
const sortDirections = ["a", "d"] as const;
const sortEnum = sortableColumns.flatMap((col) =>
  sortDirections.map((dir) => `${col}.${dir}`),
) as `${(typeof sortableColumns)[number]}.${(typeof sortDirections)[number]}`[];

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  const {
    page,
    settings: importedSettings,
    query: searchQuery,
    sort: sortOrder,
  } = zxParseQuery(request, {
    settings: jsonAsString(
      z.object({
        theme: z.enum(["light", "dark"]).optional(),
        display: z.enum(["cozy", "compact"]).optional(),
        fontSize: z.onumber(),
        confirmExit: z.oboolean(),
        expandSections: z.oboolean(),
      }),
    ).optional(),
    page: zx.IntAsString.default("1")
      .refine((i) => i > 0)
      .transform((i) => i - 1),
    query: z
      .string()
      .max(100)
      .default("")
      .transform((s) => s.trim().replace(/%/g, "\%")),
    sort: z
      // @ts-expect-error zod doesn't like the non-const
      .enum(sortEnum)
      .default("name.a")
      .transform(
        (s) =>
          s.split(".") as [
            (typeof sortableColumns)[number],
            (typeof sortDirections)[number],
          ],
      ),
  });

  const db = getDb(context.env.HYPERDRIVE);
  const backups = await db.query.backups.findMany({
    where: (backups, { eq, and, ilike }) =>
      searchQuery
        ? and(
            eq(backups.ownerId, user.id),
            ilike(backups.name, `%${searchQuery}%`),
          )
        : eq(backups.ownerId, user.id),
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
    orderBy: (backups, { asc, desc }) => {
      const func = sortOrder[1] === "a" ? asc : desc;
      return func(backups[sortOrder[0]]);
    },
    limit: 50,
    offset: page * 50,
  });

  const legacyPosts = user.discordId
    ? await db
        .select({ count: count(scheduled_posts.messageData) })
        .from(scheduled_posts)
        .where(eq(scheduled_posts.userId, BigInt(user.discordId)))
    : [{ count: 0 }];

  return {
    backups,
    importedSettings,
    page: page + 1,
    legacyPostsCount: legacyPosts[0]?.count ?? 0,
    query: searchQuery || undefined,
    sort: `${sortOrder[0]}.${sortOrder[1]}`,
  };
};

export const action = async ({ request, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  switch (request.method) {
    case "POST": {
      const data = await zxParseForm(request, {
        backups: jsonAsString(ZodDiscohookBackup.array()),
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

interface SearchQuery {
  query: string;
  sort: string;
  updated: number | null;
}

export default () => {
  const { t } = useTranslation();
  const { backups, importedSettings, legacyPostsCount, page, query, sort } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();

  const [searchQuery, setSearchQuery] = useReducer(
    (prev: SearchQuery, newQuery: string | Partial<SearchQuery>) => {
      const newData =
        typeof newQuery === "string" ? { query: newQuery } : newQuery;
      return { ...prev, updated: Date.now(), ...newData };
    },
    { query: query ?? "", sort, updated: null },
  );
  useEffect(
    () => setSearchQuery({ query: query ?? "", sort, updated: null }),
    [query, sort],
  );
  const isSearching = nav.state === "loading" && Boolean(searchQuery.query);

  // Delay to avoid spamming searches while typing
  // biome-ignore lint/correctness/useExhaustiveDependencies: not necessary
  useEffect(() => {
    // default state, don't loop
    if (searchQuery.updated === null) return;
    const timeout = setTimeout(() => {
      submit({ query: searchQuery.query });
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const [settings, updateSettings] = useLocalStorage();
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once
  useEffect(() => {
    if (importedSettings) {
      updateSettings({
        theme: importedSettings.theme ?? settings.theme,
        messageDisplay: importedSettings.display ?? settings.messageDisplay,
      });
    }
  }, []);

  const [error, setError] = useError(t);
  const legacyImportFetcher = useSafeFetcher<
    typeof ApiPostBackupsImportDiscoscheduler
  >({ onError: setError });

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
      <div className="mb-2 flex">
        {error}
        <p className="text-xl font-semibold dark:text-gray-100 my-auto">
          {t("backups")}
        </p>
        <Button
          className="ms-auto my-auto"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setImportModalOpen(true)}
          disabled={legacyImportFetcher.state !== "idle"}
        >
          {t("import")}
        </Button>
        {legacyPostsCount !== 0 && (
          <Button
            className="ms-2 my-auto"
            discordstyle={ButtonStyle.Secondary}
            onClick={async () => {
              await legacyImportFetcher.submitAsync(null, {
                method: "POST",
                action: apiUrl(BRoutes.importDiscoschedulerPosts()),
              });
              submit(null, { method: "GET" });
            }}
            disabled={legacyImportFetcher.state !== "idle"}
          >
            {t("importDiscoscheduler", { count: legacyPostsCount })}
          </Button>
        )}
        <Button
          className="ms-2 my-auto"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setExportModalOpen(true)}
          disabled={legacyImportFetcher.state !== "idle"}
        >
          {t("export")}
        </Button>
      </div>
      <div className="mb-2">
        <TextInput
          placeholder={t("searchBackups")}
          className={twJoin("w-full", query ? "rounded-b-none" : undefined)}
          value={searchQuery.query}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        {query ? (
          <div
            className={twMerge(
              textInputStyles.input,
              "rounded-t-none border-t-0 min-h-0 h-auto py-1 text-xs",
            )}
          >
            {isSearching ? (
              <p>{t("searching")}</p>
            ) : (
              <Trans
                t={t}
                i18nKey="nResults"
                count={backups.length}
                components={{
                  reset: (
                    <button
                      type="button"
                      className={twMerge(linkClassName, "font-semibold")}
                      // bypass timeout by using submit directly
                      onClick={() => submit({})}
                    />
                  ),
                }}
              />
            )}
          </div>
        ) : null}
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
                {backup.previewImageUrl ? (
                  <div
                    style={{
                      backgroundImage: `url(${backup.previewImageUrl})`,
                    }}
                    className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square ltr:mr-2 rtl:ml-2 hidden sm:block"
                  />
                ) : (
                  <div className="w-10 h-10 my-auto ltr:mr-2 rtl:ml-2 rounded-lg bg-blurple hidden sm:flex">
                    <CoolIcon
                      icon="File_Document"
                      className="m-auto text-2xl text-gray-50"
                    />
                  </div>
                )}
                <div className="truncate my-auto">
                  <div className="flex max-w-full">
                    <p className="font-medium truncate">{backup.name}</p>
                    <button
                      type="button"
                      className="ms-2 my-auto"
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
                            key="0"
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
        <p>
          <Trans
            t={t}
            i18nKey="noBackups"
            components={[<Link key="0" to="/" className={linkClassName} />]}
          />
        </p>
      )}
      <div className="flex mt-2">
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={() => submit({ page: page - 1 })}
          disabled={page === 1}
        >
          <Trans
            t={t}
            i18nKey="previousPage"
            components={[
              <CoolIcon key="0" icon="Chevron_Left" rtl="Chevron_Right" />,
            ]}
          />
        </Button>
        <Button
          className="ltr:ml-auto rtl:mr-auto"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => submit({ page: page + 1 })}
          disabled={backups.length < 50}
        >
          <Trans
            t={t}
            i18nKey="nextPage"
            components={[
              <CoolIcon key="0" icon="Chevron_Right" rtl="Chevron_Left" />,
            ]}
          />
        </Button>
      </div>
    </div>
  );
};
