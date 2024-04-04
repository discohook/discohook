import { MetaFunction, SerializeFrom, json } from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { Snowflake } from "@theinternetfolks/snowflake";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { desc, eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { Prose } from "~/components/Prose";
import { TextInput } from "~/components/TextInput";
import { Twemoji } from "~/components/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { BackupEditModal } from "~/modals/BackupEditModal";
import { BackupExportModal } from "~/modals/BackupExportModal";
import { BackupImportModal } from "~/modals/BackupImportModal";
import { getUser, getUserId } from "~/session.server";
import { DiscohookBackup } from "~/types/discohook";
import { cdn } from "~/util/discord";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { relativeTime } from "~/util/time";
import { getUserAvatar, getUserTag, userIsPremium } from "~/util/users";
import {
  jsonAsString,
  snowflakeAsString,
  zxParseForm,
  zxParseQuery,
} from "~/util/zod";
import {
  QueryDataVersion,
  backups as dBackups,
  linkBackups as dLinkBackups,
  shareLinks as dShareLinks,
  discordMembers,
  getDb,
  getId,
} from "../store.server";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { settings: importedSettings } = zxParseQuery(request, {
    settings: jsonAsString(
      z.object({
        theme: z.enum(["light", "dark"]).optional(),
        display: z.enum(["cozy", "compact"]).optional(),
        fontSize: z.onumber(),
        confirmExit: z.oboolean(),
        expandSections: z.oboolean(),
      }),
    ).optional(),
  });
  const user = await getUser(request, context, true);
  const db = getDb(context.env.DATABASE_URL);

  const backups = await db.query.backups.findMany({
    where: eq(dBackups.ownerId, user.id),
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
    orderBy: desc(dBackups.name),
    limit: 50,
  });

  const linkBackups = await db.query.linkBackups.findMany({
    where: eq(dBackups.ownerId, user.id),
    columns: {
      id: true,
      name: true,
      code: true,
      previewImageUrl: true,
    },
    orderBy: desc(dBackups.name),
    limit: 50,
  });

  const links = await db.query.shareLinks.findMany({
    where: eq(dShareLinks.userId, user.id),
    orderBy: desc(dShareLinks.expiresAt),
    limit: 50,
  });

  const memberships = user.discordId
    ? await db.query.discordMembers.findMany({
        where: eq(discordMembers.userId, user.discordId),
        columns: { permissions: true },
        with: { guild: true },
      })
    : [];

  return { user, backups, linkBackups, links, memberships, importedSettings };
};

export type LoadedBackup = SerializeFrom<typeof loader>["backups"][number];

export const action = async ({ request, context }: ActionArgs) => {
  const data = await zxParseForm(
    request,
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("DELETE_SHARE_LINK"),
        linkId: snowflakeAsString(),
      }),
      z.object({
        action: z.literal("DELETE_BACKUP"),
        backupId: snowflakeAsString(),
      }),
      z.object({
        action: z.literal("DELETE_LINK_BACKUP"),
        backupId: snowflakeAsString(),
      }),
      z.object({
        action: z.literal("IMPORT_BACKUPS"),
        backups: jsonAsString<z.ZodType<DiscohookBackup[]>>(),
      }),
    ]),
  );
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.DATABASE_URL);
  switch (data.action) {
    case "DELETE_SHARE_LINK": {
      const link = await db.query.shareLinks.findFirst({
        where: eq(dShareLinks.id, data.linkId),
      });
      if (!link) {
        throw json({ message: "No link with that ID." }, 404);
      } else if (link.userId !== userId) {
        throw json({ message: "You do not own this share link." }, 403);
      }
      const key = `share-${link.shareId}`;
      await context.env.KV.delete(key);
      await db.delete(dShareLinks).where(eq(dShareLinks.id, data.linkId));
      return new Response(null, { status: 204 });
    }
    case "DELETE_BACKUP": {
      const backup = await db.query.backups.findFirst({
        where: eq(dBackups.id, data.backupId),
      });
      if (!backup) {
        throw json({ message: "No backup with that ID." }, 404);
      } else if (backup.ownerId !== userId) {
        throw json({ message: "You do not own this backup." }, 403);
      }
      await db.delete(dBackups).where(eq(dBackups.id, data.backupId));
      return new Response(null, { status: 204 });
    }
    case "DELETE_LINK_BACKUP": {
      const backup = await db.query.linkBackups.findFirst({
        where: eq(dBackups.id, data.backupId),
      });
      if (!backup) {
        throw json({ message: "No backup with that ID." }, 404);
      } else if (backup.ownerId !== userId) {
        throw json({ message: "You do not own this backup." }, 403);
      }
      await db.delete(dLinkBackups).where(eq(dBackups.id, data.backupId));
      return new Response(null, { status: 204 });
    }
    case "IMPORT_BACKUPS": {
      await db.insert(dBackups).values(
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
      );
      return new Response(null, { status: 201 });
    }
    default:
      break;
  }

  return null;
};

export const meta: MetaFunction = () => [{ title: "Your Data - Discohook" }];

const EPOCH = Date.UTC(2024, 1, 1).valueOf();

const tabValues = [
  "profile",
  "backups",
  "linkEmbeds",
  "shareLinks",
  "servers",
] as const;

export default function Me() {
  const { t } = useTranslation();
  const { user, backups, linkBackups, links, memberships, importedSettings } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const now = new Date();

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

  const defaultTab = searchParams.get("t") as (typeof tabValues)[number] | null;
  const [tab, setTab] = useState<(typeof tabValues)[number]>(
    defaultTab && tabValues.includes(defaultTab) ? defaultTab : tabValues[0],
  );

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
      />
      <Header user={user} />
      <Prose>
        <TabsWindow
          tab={tab}
          setTab={setTab as (v: string) => void}
          data={[
            {
              label: t("profile"),
              value: "profile",
            },
            {
              label: t("server_other"),
              value: "servers",
            },
            {
              label: t("backups"),
              value: "backups",
            },
            {
              label: (
                <>
                  <p className="text-xs font-semibold uppercase text-brand-pink">
                    {t("deluxe")}
                  </p>
                  {t("linkEmbeds")}
                </>
              ),
              value: "linkEmbeds",
            },
            {
              label: t("shareLinks"),
              value: "shareLinks",
            },
          ]}
        >
          {tab === "profile" ? (
            <div>
              <TabHeader>{t(tab)}</TabHeader>
              <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-900 shadow-md p-4">
                <div className="flex">
                  <img
                    className="rounded-full mr-4 h-[4.5rem] w-[4.5rem]"
                    src={getUserAvatar(user, { size: 128 })}
                    alt={user.name}
                  />
                  <div className="grow my-auto">
                    <p className="text-2xl font-semibold leading-none dark:text-gray-100">
                      {user.name}
                    </p>
                    <span className="text-base font-medium dark:text-gray-400">
                      {getUserTag(user)}
                    </span>
                  </div>
                  <Link to="/auth/logout" className="block mb-auto ml-auto">
                    <Button discordstyle={ButtonStyle.Secondary}>
                      {t("logOut")}
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4 mt-4 rounded-lg p-4 bg-gray-400 dark:bg-gray-800">
                  <div>
                    <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
                      {t("subscribedSince")}
                    </p>
                    <p className="text-base font-normal">
                      {user.subscribedSince
                        ? new Date(user.subscribedSince).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : t("notSubscribed")}
                      {user.lifetime ? ` (${t("lifetime")}!)` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
                      {t("firstSubscribed")}
                    </p>
                    <p className="text-base font-normal">
                      {user.firstSubscribed
                        ? new Date(user.firstSubscribed).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : t("never")}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
                      {t("joinedDiscohook")}
                    </p>
                    <p className="text-base font-normal">
                      {new Date(
                        Snowflake.parse(String(user.id), EPOCH).timestamp,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "servers" ? (
            <div>
              <div className="mb-4 flex">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t("server_other")}
                </p>
                <Link to="/bot" className="ml-auto my-auto">
                  <Button discordstyle={ButtonStyle.Link}>
                    {t("inviteBot")}
                  </Button>
                </Link>
              </div>
              {memberships.length > 0 ? (
                <div className="space-y-1">
                  {memberships
                    .filter((m) => {
                      const perm = new PermissionsBitField(
                        BigInt(m.permissions ?? "0"),
                      );
                      return (
                        perm.has(PermissionFlags.ManageMessages) ||
                        perm.has(PermissionFlags.ManageWebhooks)
                      );
                    })
                    .sort((a, b) => {
                      // const perm = new PermissionsBitField(
                      //   BigInt(m.permissions ?? "0"),
                      // );
                      // if (perm.has(PermissionFlags.Administrator)) {
                      //   return -20;
                      // }
                      // return 0;
                      return a.guild.name > b.guild.name ? 1 : -1;
                    })
                    .map(({ guild }) => {
                      return (
                        <div
                          key={`guild-${guild.id}`}
                          className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex"
                        >
                          <div
                            style={{
                              backgroundImage: `url(${
                                guild.icon
                                  ? cdn.icon(String(guild.id), guild.icon, {
                                      size: 64,
                                    })
                                  : cdn.defaultAvatar(5)
                              })`,
                            }}
                            className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square mr-2 hidden sm:block"
                          />
                          <div className="truncate my-auto">
                            <div className="flex max-w-full">
                              <p className="font-medium truncate">
                                {guild.name}
                              </p>
                            </div>
                          </div>
                          <div className="ml-auto pl-2 my-auto flex gap-2">
                            <Link to={`/s/${guild.id}`}>
                              <Button discordstyle={ButtonStyle.Secondary}>
                                <CoolIcon icon="Chevron_Right" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-500">{t("noServers")}</p>
              )}
            </div>
          ) : tab === "backups" ? (
            <div>
              <div className="mb-4 flex">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t(tab)}
                </p>
                <Button
                  className="ml-auto my-auto"
                  onClick={() => setImportModalOpen(true)}
                >
                  {t("import")}
                </Button>
                <Button
                  className="ml-2 my-auto"
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
                            <p className="font-medium truncate">
                              {backup.name}
                            </p>
                            <button
                              type="button"
                              className="ml-2 my-auto"
                              onClick={() => setEditingBackup(backup)}
                            >
                              <CoolIcon icon="Edit_Pencil_01" />
                            </button>
                          </div>
                          <p className="text-gray-600 dark:text-gray-500 text-sm">
                            {backup.nextRunAt ? (
                              <>
                                <Twemoji emoji="🕑" className="grayscale" />{" "}
                                Next run{" "}
                                {relativeTime(new Date(backup.nextRunAt), t)} (
                                {new Date(backup.nextRunAt).toLocaleString(
                                  undefined,
                                  {
                                    month: "numeric",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  },
                                )}
                                )
                              </>
                            ) : backup.importedFromOrg ? (
                              <>
                                <Twemoji emoji="✨" className="grayscale" />{" "}
                                Imported from discohook.org on{" "}
                                {createdAt.toLocaleDateString()}
                              </>
                            ) : (
                              t("createdAt", {
                                replace: {
                                  createdAt: createdAt.toLocaleDateString(),
                                },
                              })
                            )}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          <Link to={`/?backup=${backup.id}`} target="_blank">
                            <Button discordstyle={ButtonStyle.Secondary}>
                              <CoolIcon icon="External_Link" />
                            </Button>
                          </Link>
                          <Button
                            discordstyle={ButtonStyle.Danger}
                            onClick={() => {
                              submit(
                                {
                                  action: "DELETE_BACKUP",
                                  backupId: String(backup.id),
                                },
                                {
                                  method: "POST",
                                  replace: true,
                                },
                              );
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
          ) : tab === "linkEmbeds" ? (
            <div>
              <div className="mb-4 flex">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t(tab)}
                </p>
                {/* <Button
                  className="ml-auto my-auto"
                  onClick={() => setImportModalOpen(true)}
                >
                  {t("import")}
                </Button> */}
              </div>
              {!userIsPremium(user) && (
                <InfoBox icon="Handbag" severity="pink">
                  <Trans
                    t={t}
                    i18nKey="linkEmbedsPremiumNote"
                    components={[
                      <Link
                        to="/link"
                        className={twJoin(linkClassName, "dark:brightness-90")}
                      />,
                    ]}
                  />
                </InfoBox>
              )}
              {linkBackups.length > 0 ? (
                <div className="space-y-1">
                  {linkBackups.map((backup) => {
                    return (
                      <div
                        key={`link-backup-${backup.id}`}
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
                            <p className="font-medium truncate">
                              {backup.name}
                            </p>
                            <Link
                              to={`/link?backup=${backup.id}`}
                              className="ml-2 my-auto"
                            >
                              <CoolIcon icon="Edit_Pencil_01" />
                            </Link>
                          </div>
                          <p className="text-gray-600 dark:text-gray-500 text-sm">
                            {t("id", { replace: { id: backup.code } })}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          <Link to={`/link/${backup.code}`} target="_blank">
                            <Button discordstyle={ButtonStyle.Secondary}>
                              <CoolIcon icon="External_Link" />
                            </Button>
                          </Link>
                          <Button
                            discordstyle={ButtonStyle.Danger}
                            onClick={() => {
                              submit(
                                {
                                  action: "DELETE_LINK_BACKUP",
                                  backupId: String(backup.id),
                                },
                                {
                                  method: "POST",
                                  replace: true,
                                },
                              );
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
          ) : tab === "shareLinks" ? (
            <div className="w-full h-fit">
              <p className="text-xl font-semibold dark:text-gray-100">
                {t(tab)}
              </p>
              <p className="mb-4">
                <Trans
                  t={t}
                  i18nKey="noShareLinkData"
                  components={{
                    backups: (
                      <button
                        type="button"
                        className="underline hover:no-underline"
                        onClick={() => setTab("backups")}
                      />
                    ),
                  }}
                />
              </p>
              {links.length > 0 ? (
                <div className="space-y-1">
                  {links.map((link) => {
                    const created = new Date(getId(link).timestamp);
                    const expires = new Date(link.expiresAt);
                    return (
                      <div
                        key={`share-link-${link.id}`}
                        className="rounded p-4 bg-gray-100 dark:bg-gray-900 flex"
                      >
                        <div className="truncate shrink-0">
                          <p className="font-medium">
                            {created.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year:
                                now.getFullYear() === created.getFullYear()
                                  ? undefined
                                  : "numeric",
                            })}
                            <span
                              className={`ml-1 ${
                                expires < now
                                  ? "text-rose-400"
                                  : expires.getTime() - now.getTime() <=
                                      86400000
                                    ? "text-yellow-500 dark:text-yellow-400"
                                    : "text-gray-600 dark:text-gray-500"
                              }`}
                            >
                              -{" "}
                              {expires.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year:
                                  now.getFullYear() === expires.getFullYear()
                                    ? undefined
                                    : "numeric",
                              })}
                            </span>
                          </p>
                          <p className="text-gray-600 dark:text-gray-500 text-sm">
                            {t("id", { replace: { id: link.shareId } })}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          {expires > now && (
                            <Link
                              to={`/?share=${link.shareId}`}
                              target="_blank"
                            >
                              <Button discordstyle={ButtonStyle.Secondary}>
                                <CoolIcon icon="External_Link" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            discordstyle={ButtonStyle.Danger}
                            onClick={() => {
                              submit(
                                {
                                  action: "DELETE_SHARE_LINK",
                                  linkId: String(link.id),
                                },
                                {
                                  method: "POST",
                                  replace: true,
                                },
                              );
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
                <p className="text-gray-500">{t("noLinks")}</p>
              )}
            </div>
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
}
