import { MetaFunction, SerializeFrom, json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { desc, eq } from "drizzle-orm";
import { useState } from "react";
import { z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { getDb } from "~/db/index.server";
import { backups as dBackups, shareLinks, users } from "~/db/schema.server";
import { BackupEditModal } from "~/modals/BackupEditModal";
import { BackupImportModal } from "~/modals/BackupImportModal";
import { getUser } from "~/session.server";
import { DiscohookBackup } from "~/types/discohook";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { getUserAvatar, getUserTag } from "~/util/users";
import { jsonAsString } from "~/util/zod";

const strings = {
  yourBackups: "Your Backups",
  noBackups: "You haven't created any backups.",
  import: "Import",
  version: "Version: {0}",
  yourLinks: "Your Links",
  noLinks: "You haven't created any share links.",
  id: "ID: {0}",
  contentUnavailable:
    "Share link data is not kept after expiration. If you need to permanently store a message, use the backups feature instead.",
  logOut: "Log Out",
  subscribedSince: "Subscribed Since",
  notSubscribed: "Not subscribed",
  firstSubscribed: "First Subscribed",
  never: "Never",
};

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);

  const db = getDb(context.env.D1);
  const result = (await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      backups: {
        columns: {
          id: true,
          name: true,
          dataVersion: true,
          createdAt: true,
        },
        orderBy: desc(dBackups.name),
        limit: 50,
      },
      shareLinks: {
        orderBy: desc(shareLinks.expiresAt),
        limit: 50,
      },
    },
  }))!;

  return { user, backups: result.backups, links: result.shareLinks };
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

  const db = getDb(context.env.D1);
  switch (data.action) {
    case "DELETE_SHARE_LINK": {
      const link = await db.query.shareLinks.findFirst({
        where: eq(shareLinks.id, data.linkId),
      });
      if (!link) {
        throw json({ message: "No link with that ID." }, 404);
      } else if (link.userId !== user.id) {
        throw json({ message: "You do not own this share link." }, 403);
      }
      const key = `boogiehook-shorten-${link.shareId}`;
      await context.env.KV.delete(key);
      await db.delete(shareLinks).where(eq(shareLinks.id, data.linkId));
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
          dataVersion: "d2",
          data: {
            version: "d2",
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
                  {strings.subscribedSince}
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
                    : strings.notSubscribed}
                </p>
              </div>
              <div>
                <p className="uppercase font-bold text-xs leading-4 dark:text-gray-100">
                  {strings.firstSubscribed}
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
                    : strings.never}
                </p>
              </div>
            </div>
            <div className="w-full flex mt-4">
              <Link to="/auth/logout" className="ml-auto">
                <Button discordstyle={ButtonStyle.Secondary}>
                  {strings.logOut}
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full h-fit">
            <p className="text-xl font-semibold dark:text-gray-100">
              {strings.yourBackups}
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
                            className="ml-2 my-auto"
                            onClick={() => setEditingBackup(backup)}
                          >
                            <CoolIcon icon="Edit_Pencil_01" />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-500 text-sm">
                          {/*strings.formatString(
                            strings.version,
                            backup.dataVersion
                          )*/}
                        </p>
                      </div>
                      <div className="ml-auto pl-2 my-auto flex flex-col">
                        <Link to={`/?backup=${backup.id}`} target="_blank">
                          <CoolIcon icon="External_Link" />
                        </Link>
                        <button
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
              <p className="text-gray-500">{strings.noBackups}</p>
            )}
            <Button className="mt-1" onClick={() => setImportModalOpen(true)}>
              {strings.import}
            </Button>
          </div>
          <div className="w-full h-fit">
            <p className="text-xl font-semibold dark:text-gray-100">
              {strings.yourLinks}
            </p>
            <p>{strings.contentUnavailable}</p>
            {links.length > 0 ? (
              <div className="space-y-1 mt-1 overflow-y-auto max-h-96">
                {links.map((link) => {
                  const created = new Date(link.createdAt),
                    expires = new Date(link.expiresAt);
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
                          {/*strings.formatString(strings.id, link.shareId)*/}
                        </p>
                      </div>
                      <div className="ml-auto pl-2 my-auto flex flex-col">
                        {expires > now && (
                          <Link to={`/?share=${link.shareId}`} target="_blank">
                            <CoolIcon icon="External_Link" />
                          </Link>
                        )}
                        <button
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
              <p className="text-gray-500">{strings.noLinks}</p>
            )}
          </div>
        </div>
      </Prose>
    </div>
  );
}
