import { MetaFunction, SerializeFrom, json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { desc, eq } from "drizzle-orm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { BackupEditModal } from "~/modals/BackupEditModal";
import { BackupImportModal } from "~/modals/BackupImportModal";
import { getUser } from "~/session.server";
import { DiscohookBackup } from "~/types/discohook";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { getUserAvatar, getUserTag } from "~/util/users";
import { jsonAsString } from "~/util/zod";
import {
  QueryDataVersion,
  backups as dBackups,
  shareLinks as dShareLinks,
  getDb,
} from "../store.server";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);

  const db = getDb(context.env.DATABASE_URL);

  const backups = await db.query.backups.findMany({
    where: eq(dBackups.ownerId, user.id),
    columns: {
      id: true,
      name: true,
      dataVersion: true,
      createdAt: true,
    },
    orderBy: desc(dBackups.name),
    limit: 50,
  });

  const links = await db.query.shareLinks.findMany({
    where: eq(dShareLinks.userId, user.id),
    orderBy: desc(dShareLinks.expiresAt),
    limit: 50,
  });

  return { user, backups, links };
};

export type LoadedBackup = SerializeFrom<typeof loader>["backups"][number];

export const action = async ({ request, context }: ActionArgs) => {
  const user = await getUser(request, context, true);
  const data = await zx.parseForm(
    request,
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("DELETE_SHARE_LINK"),
        linkId: zx.NumAsString,
      }),
      z.object({
        action: z.literal("DELETE_BACKUP"),
        backupId: zx.NumAsString,
      }),
      z.object({
        action: z.literal("IMPORT_BACKUPS"),
        backups: jsonAsString<z.ZodType<DiscohookBackup[]>>(),
      }),
    ]),
  );

  const db = getDb(context.env.DATABASE_URL);
  switch (data.action) {
    case "DELETE_SHARE_LINK": {
      const link = await db.query.shareLinks.findFirst({
        where: eq(dShareLinks.id, data.linkId),
      });
      if (!link) {
        throw json({ message: "No link with that ID." }, 404);
      } else if (link.userId !== user.id) {
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
      } else if (backup.ownerId !== user.id) {
        throw json({ message: "You do not own this backup." }, 403);
      }
      await db.delete(dBackups).where(eq(dBackups.id, data.backupId));
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
          ownerId: user.id,
        })),
      );
      return new Response(null, { status: 201 });
    }
    default:
      break;
  }

  return null;
};

export const meta: MetaFunction = () => [{ title: "Your Data - Boogiehook" }];

export default function Me() {
  const { t } = useTranslation();
  const { user, backups, links } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const now = new Date();

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingBackup, setEditingBackup] = useState<LoadedBackup>();

  return (
    <div>
      <BackupImportModal
        open={importModalOpen}
        setOpen={setImportModalOpen}
        backups={backups}
      />
      <BackupEditModal
        open={!!editingBackup}
        setOpen={() => setEditingBackup(undefined)}
        backup={editingBackup}
      />
      <Header user={user} />
      <Prose>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-700 shadow-md p-2 h-fit">
            <div className="flex">
              <img
                className="rounded-full mr-4 h-16 w-16"
                src={getUserAvatar(user)}
                alt={user.name}
              />
              <div className="grow my-auto">
                <p className="text-2xl font-semibold dark:text-gray-100">
                  {user.name}
                </p>
                <p className="leading-none">{getUserTag(user)}</p>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-2 mt-4">
              <div>
                <p className="uppercase font-bold text-xs leading-4 dark:text-gray-100">
                  {t("subscribedSince")}
                </p>
                <p className="text-sm font-normal">
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
                </p>
              </div>
              <div>
                <p className="uppercase font-bold text-xs leading-4 dark:text-gray-100">
                  {t("firstSubscribed")}
                </p>
                <p className="text-sm font-normal">
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
            </div>
            <div className="w-full flex mt-4">
              <Link to="/auth/logout" className="ml-auto">
                <Button discordstyle={ButtonStyle.Secondary}>
                  {t("logOut")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full h-fit">
            <p className="text-xl font-semibold dark:text-gray-100">
              {t("yourBackups")}
            </p>
            {backups.length > 0 ? (
              <div className="space-y-1 mt-1 overflow-y-auto max-h-96">
                {backups.map((backup) => {
                  return (
                    <div
                      key={`backup-${backup.id}`}
                      className="w-full rounded p-2 bg-gray-100 dark:bg-gray-700 flex"
                    >
                      <div className="truncate">
                        <div className="flex max-w-full">
                          <p className="font-medium truncate">{backup.name}</p>
                          <button
                            type="button"
                            className="ml-2 my-auto"
                            onClick={() => setEditingBackup(backup)}
                          >
                            <CoolIcon icon="Edit_Pencil_01" />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-500 text-sm">
                          {t("version", {
                            replace: { version: backup.dataVersion },
                          })}
                        </p>
                      </div>
                      <div className="ml-auto pl-2 my-auto flex flex-col">
                        <Link to={`/?backup=${backup.id}`} target="_blank">
                          <CoolIcon icon="External_Link" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            submit(
                              {
                                action: "DELETE_BACKUP",
                                backupId: backup.id,
                              },
                              {
                                method: "POST",
                                replace: true,
                              },
                            );
                          }}
                        >
                          <CoolIcon
                            icon="Trash_Full"
                            className="text-rose-600"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">{t("noBackups")}</p>
            )}
            <Button className="mt-1" onClick={() => setImportModalOpen(true)}>
              {t("import")}
            </Button>
          </div>
          <div className="w-full h-fit">
            <p className="text-xl font-semibold dark:text-gray-100">
              {t("yourLinks")}
            </p>
            <p>{t("noShareLinkData")}</p>
            {links.length > 0 ? (
              <div className="space-y-1 mt-1 overflow-y-auto max-h-96">
                {links.map((link) => {
                  const created = new Date(link.createdAt);
                  const expires = new Date(link.expiresAt);
                  return (
                    <div
                      key={`link-${link.id}`}
                      className="w-full rounded p-2 bg-gray-100 dark:bg-gray-700 flex"
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
                                : expires.getTime() - now.getTime() <= 86400000
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
                      <div className="ml-auto pl-2 my-auto flex flex-col">
                        {expires > now && (
                          <Link to={`/?share=${link.shareId}`} target="_blank">
                            <CoolIcon icon="External_Link" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            submit(
                              {
                                action: "DELETE_SHARE_LINK",
                                linkId: link.id,
                              },
                              {
                                method: "POST",
                                replace: true,
                              },
                            );
                          }}
                        >
                          <CoolIcon
                            icon="Trash_Full"
                            className="text-rose-600"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">{t("noLinks")}</p>
            )}
          </div>
        </div>
      </Prose>
    </div>
  );
}
