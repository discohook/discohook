import { REST } from "@discordjs/rest";
import {
  MetaFunction,
  SerializeFrom,
  defer,
  json,
} from "@remix-run/cloudflare";
import {
  Await,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { desc, eq } from "drizzle-orm";
import { Suspense, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { Prose } from "~/components/Prose";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { BackupEditModal } from "~/modals/BackupEditModal";
import { BackupExportModal } from "~/modals/BackupExportModal";
import { BackupImportModal } from "~/modals/BackupImportModal";
import { BotCreateModal } from "~/modals/BotCreateModal";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { getUser, getUserId } from "~/session.server";
import { DiscohookBackup } from "~/types/discohook";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import {
  botAppAvatar,
  cdn,
  cdnImgAttributes,
  isDiscordError,
} from "~/util/discord";
import { DeconstructedSnowflake, getId } from "~/util/id";
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
  customBots,
  backups as dBackups,
  linkBackups as dLinkBackups,
  shareLinks as dShareLinks,
  getDb,
  makeSnowflake,
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
  const db = getDb(context.env.HYPERDRIVE.connectionString);

  const backups = (async () =>
    await db.query.backups.findMany({
      where: (backups, { eq }) => eq(backups.ownerId, user.id),
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
    }))();

  const linkBackups = (async () =>
    await db.query.linkBackups.findMany({
      where: (backups, { eq }) => eq(backups.ownerId, user.id),
      columns: {
        id: true,
        name: true,
        code: true,
        previewImageUrl: true,
      },
      orderBy: desc(dBackups.name),
      limit: 50,
    }))();

  const links = (async () =>
    await db.query.shareLinks.findMany({
      where: (shareLinks, { eq }) => eq(shareLinks.userId, user.id),
      orderBy: desc(dShareLinks.expiresAt),
      limit: 50,
    }))();

  const memberships = (async () =>
    user.discordId
      ? await db.query.discordMembers.findMany({
          where: (discordMembers, { eq }) =>
            // biome-ignore lint/style/noNonNullAssertion: Checked above
            eq(discordMembers.userId, user.discordId!),
          columns: { permissions: true },
          with: { guild: { columns: { id: true, name: true, icon: true } } },
        })
      : [])();

  const bots = (async () =>
    user.discordId
      ? await db
          .select({
            id: customBots.id,
            name: customBots.name,
            applicationId: customBots.applicationId,
            applicationUserId: customBots.applicationUserId,
            icon: customBots.icon,
            avatar: customBots.avatar,
            discriminator: customBots.discriminator,
          })
          .from(customBots)
          .orderBy(desc(customBots.name))
          .limit(50)
      : [])();

  return defer({
    user,
    backups,
    linkBackups,
    links,
    memberships,
    importedSettings,
    bots,
  });
};

export type LoadedBackup = Awaited<
  SerializeFrom<typeof loader>["backups"]
>[number];

export type LoadedBot = Awaited<SerializeFrom<typeof loader>["bots"]>[number];

export type MeLoadedMembership = Awaited<
  SerializeFrom<typeof loader>["memberships"]
>[number];

export interface KVCustomBot {
  applicationId: string;
  publicKey: string;
  token: string | null;
}

export const action = async ({ request, context }: ActionArgs) => {
  const data = await zxParseForm(
    request,
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("DELETE_SHARE_LINK"),
        linkId: snowflakeAsString(),
      }),
      z.object({
        action: z.literal("REFRESH_SHARE_LINK"),
        linkId: snowflakeAsString(),
        ttl: zx.IntAsString.optional()
          .default("604800000")
          .refine((val) => val >= 300000 && val <= 2419200000),
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
      z.object({
        action: z.literal("CREATE_BOT"),
        applicationId: snowflakeAsString(),
      }),
    ]),
  );
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  switch (data.action) {
    case "DELETE_SHARE_LINK": {
      const link = await db.query.shareLinks.findFirst({
        where: (shareLinks, { eq }) => eq(shareLinks.id, data.linkId),
      });
      if (!link) {
        throw json({ message: "No link with that ID." }, 404);
      } else if (link.userId !== userId) {
        throw json({ message: "You do not own this share link." }, 403);
      }
      const key = `share-${link.shareId}`;
      await context.env.KV.delete(key);
      await db.delete(dShareLinks).where(eq(dShareLinks.id, data.linkId));
      break;
    }
    case "REFRESH_SHARE_LINK": {
      const user = await getUser(request, context);
      if (!user || !userIsPremium(user)) {
        throw json(
          { message: "Must be a Deluxe member to perform this action" },
          403,
        );
      }

      const db = getDb(context.env.HYPERDRIVE.connectionString);
      const share = await db.query.shareLinks.findFirst({
        where: (shareLinks, { eq }) => eq(shareLinks.id, data.linkId),
        columns: {
          shareId: true,
          userId: true,
        },
      });
      if (!share || share.userId !== userId) {
        throw json({ message: "Unknown Share Link" }, 404);
      }

      const key = `share-${share.shareId}`;
      const current = await context.env.KV.get(key);
      if (!current) {
        throw json({ message: "Share link is already expired" }, 400);
      }

      const expires = new Date(new Date().getTime() + data.ttl);
      await context.env.KV.put(key, current, {
        expirationTtl: data.ttl / 1000,
        metadata: {
          expiresAt: expires.toISOString(),
        },
      });
      await db
        .update(dShareLinks)
        .set({ expiresAt: expires })
        .where(eq(dShareLinks.id, data.linkId));

      return {
        id: share.shareId,
        url: `${new URL(request.url).origin}/?share=${share.shareId}`,
        expires,
      };
    }
    case "DELETE_BACKUP": {
      const backup = await db.query.backups.findFirst({
        where: (backups, { eq }) => eq(backups.id, data.backupId),
      });
      if (!backup) {
        throw json({ message: "No backup with that ID." }, 404);
      } else if (backup.ownerId !== userId) {
        throw json({ message: "You do not own this backup." }, 403);
      }
      await db.delete(dBackups).where(eq(dBackups.id, data.backupId));
      break;
    }
    case "DELETE_LINK_BACKUP": {
      const backup = await db.query.linkBackups.findFirst({
        where: (linkBackups, { eq }) => eq(linkBackups.id, data.backupId),
      });
      if (!backup) {
        throw json({ message: "No backup with that ID." }, 404);
      } else if (backup.ownerId !== userId) {
        throw json({ message: "You do not own this backup." }, 403);
      }
      await db.delete(dLinkBackups).where(eq(dLinkBackups.id, data.backupId));
      break;
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
      return json({ action: data.action }, 201);
    }
    case "CREATE_BOT": {
      if (String(data.applicationId) === context.env.DISCORD_CLIENT_ID) {
        throw json(
          { message: "Cannot create a bot with a blacklisted ID" },
          400,
        );
      }
      const user = await getUser(request, context);
      if (!user || !userIsPremium(user)) {
        throw json(
          { message: "Must be a Deluxe member to perform this action" },
          403,
        );
      }

      const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
      let application: RESTGetAPIApplicationRpcResult;
      try {
        application = (await rest.get(
          `/applications/${data.applicationId}/rpc`,
        )) as RESTGetAPIApplicationRpcResult;
      } catch (e) {
        if (isDiscordError(e)) {
          throw json(e.rawError, e.status);
        }
        throw e;
      }
      let inserted: { id: bigint };
      try {
        // How do we verify ownership? Require token?
        inserted = (
          await db
            .insert(customBots)
            .values({
              applicationId: makeSnowflake(application.id),
              icon: application.icon,
              name: application.name,
              publicKey: application.verify_key,
              ownerId: userId,
            })
            // .onConflictDoUpdate({
            //   target: [customBots.applicationId],
            //   set: {
            //     icon: application.icon,
            //     name: application.name,
            //     // Check if the app has already been linked to our endpoint?
            //     // ownerId: sql``,
            //     // Shouldn't change but we update just in case
            //     publicKey: application.verify_key,
            //   },
            // })
            .returning({
              id: customBots.id,
            })
        )[0];
      } catch {
        throw json(
          {
            message:
              "Failed to create the bot. It may already exist. If this is the case, contact support to have it transferred to your account.",
          },
          400,
        );
      }
      await context.env.KV.put(
        `custom-bot-${inserted.id}`,
        JSON.stringify({
          applicationId: application.id,
          publicKey: application.verify_key,
          token: null,
        } satisfies KVCustomBot),
      );

      return json({ action: data.action, id: inserted.id }, 201);
    }
    default:
      break;
  }

  return json({ action: data.action }, 200);
};

export const meta: MetaFunction = () => [{ title: "Your Data - Discohook" }];

const tabValues = [
  "profile",
  "backups",
  "linkEmbeds",
  "shareLinks",
  "servers",
  "bots",
  "developer",
] as const;

export default function Me() {
  const { t } = useTranslation();
  const {
    user,
    backups,
    linkBackups,
    links,
    memberships,
    bots,
    importedSettings,
  } = useLoaderData<typeof loader>();
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
  const [createBotOpen, setCreateBotOpen] = useState(false);
  const [confirm, setConfirm] = useConfirmModal();

  const defaultTab = searchParams.get("t") as (typeof tabValues)[number] | null;
  const [tab, setTab] = useState<(typeof tabValues)[number]>(
    defaultTab && tabValues.includes(defaultTab) ? defaultTab : tabValues[0],
  );

  const [snowflake, setSnowflake] = useState<string>();
  let snowflakeDecoded: DeconstructedSnowflake | undefined;
  try {
    if (snowflake) {
      snowflakeDecoded = getId({ id: snowflake });
    }
  } catch {}

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
      <BotCreateModal open={createBotOpen} setOpen={setCreateBotOpen} />
      {confirm}
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
              label: t("shareLinks"),
              value: "shareLinks",
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
            // {
            //   label: (
            //     <>
            //       <p className="text-xs font-semibold uppercase text-brand-pink">
            //         {t("deluxe")}
            //       </p>
            //       {t("bots")}
            //     </>
            //   ),
            //   value: "bots",
            // },
            // {
            //   label: t("developer"),
            //   value: "developer",
            // },
          ]}
        >
          {tab === "profile" ? (
            <div>
              <TabHeader>{t(tab)}</TabHeader>
              <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-900 shadow-md p-4">
                <div className="flex">
                  <img
                    className="rounded-full ltr:mr-4 rtl:ml-4 h-[4.5rem] w-[4.5rem]"
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
                      {user.subscribedSince ? (
                        t("timestamp.date_verbose", {
                          replace: { date: new Date(user.subscribedSince) },
                        })
                      ) : (
                        <Link
                          to="/donate"
                          className={twMerge(
                            linkClassName,
                            "text-brand-pink dark:text-brand-pink",
                          )}
                        >
                          {t("notSubscribed")}
                        </Link>
                      )}
                      {user.lifetime ? ` (${t("lifetime")}!)` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
                      {t("firstSubscribed")}
                    </p>
                    <p className="text-base font-normal">
                      {user.firstSubscribed
                        ? t("timestamp.date_verbose", {
                            replace: { date: new Date(user.firstSubscribed) },
                          })
                        : t("never")}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
                      {t("joinedDiscohook")}
                    </p>
                    <p className="text-base font-normal">
                      {t("timestamp.date_verbose", {
                        replace: { date: new Date(getId(user).timestamp) },
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
                <Link to="/bot" className="ltr:ml-auto rtl:mr-auto my-auto">
                  <Button discordstyle={ButtonStyle.Link}>
                    {t("inviteBot")}
                  </Button>
                </Link>
              </div>
              <Suspense>
                <Await resolve={memberships}>
                  {(memberships) =>
                    memberships.length > 0 ? (
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
                                <img
                                  {...cdnImgAttributes(64, (size) =>
                                    guild.icon
                                      ? cdn.icon(String(guild.id), guild.icon, {
                                          size,
                                        })
                                      : cdn.defaultAvatar(5),
                                  )}
                                  className="w-10 my-auto rounded-lg aspect-square ltr:mr-2 rtl:ml-2 hidden sm:block"
                                  alt={guild.name}
                                />
                                <div className="truncate my-auto">
                                  <div className="flex max-w-full">
                                    <p className="font-medium truncate">
                                      {guild.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="ltr:ml-auto rtl:mr-auto pl-2 my-auto flex gap-2">
                                  <Link to={`/s/${guild.id}`}>
                                    <Button
                                      discordstyle={ButtonStyle.Secondary}
                                    >
                                      <CoolIcon
                                        icon="Chevron_Right"
                                        rtl="Chevron_Left"
                                      />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-gray-500">{t("noServers")}</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          ) : tab === "backups" ? (
            <div>
              <div className="mb-4 flex">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t(tab)}
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
              <Suspense>
                <Await resolve={backups}>
                  {(backups) =>
                    backups.length > 0 ? (
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
                                        backup.cron
                                          ? "nextRunAtRepeat"
                                          : "nextRunAtOnce"
                                      }
                                      components={[
                                        <Twemoji
                                          emoji="🕑"
                                          className="grayscale ltr:mr-1 rtl:ml-1"
                                        />,
                                      ]}
                                      values={{
                                        relative: relativeTime(
                                          new Date(backup.nextRunAt),
                                          t,
                                        ),
                                        date: new Date(backup.nextRunAt),
                                      }}
                                    />
                                  ) : backup.importedFromOrg ? (
                                    <>
                                      <Twemoji
                                        emoji="✨"
                                        className="grayscale"
                                      />{" "}
                                      Imported from discohook.org on{" "}
                                      {createdAt.toLocaleDateString()}
                                    </>
                                  ) : (
                                    t("createdAt", { replace: { createdAt } })
                                  )}
                                </p>
                              </div>
                              <div className="ml-auto pl-2 my-auto flex gap-2">
                                <Link
                                  to={`/?backup=${backup.id}`}
                                  target="_blank"
                                >
                                  <Button discordstyle={ButtonStyle.Secondary}>
                                    <CoolIcon icon="External_Link" />
                                  </Button>
                                </Link>
                                <Button
                                  discordstyle={ButtonStyle.Danger}
                                  onClick={(e) => {
                                    const callback = () =>
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
                    )
                  }
                </Await>
              </Suspense>
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
              <Suspense>
                <Await resolve={linkBackups}>
                  {(linkBackups) =>
                    linkBackups.length > 0 ? (
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
                                  className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square ltr:mr-2 rtl:ml-2 hidden sm:block"
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
                              <div className="ltr:ml-auto rtl:mr-auto pl-2 my-auto flex gap-2">
                                <Link
                                  to={`/link/${backup.code}`}
                                  target="_blank"
                                >
                                  <Button discordstyle={ButtonStyle.Secondary}>
                                    <CoolIcon icon="External_Link" />
                                  </Button>
                                </Link>
                                <Button
                                  discordstyle={ButtonStyle.Danger}
                                  onClick={(e) => {
                                    const callback = () =>
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

                                    if (e.shiftKey) {
                                      callback();
                                      return;
                                    }

                                    setConfirm({
                                      title: t("deleteLinkBackup"),
                                      children: (
                                        <>
                                          <p>{t("deleteLinkBackupConfirm")}</p>
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
                                                {t("id", {
                                                  replace: { id: backup.code },
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
                    )
                  }
                </Await>
              </Suspense>
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
              <Suspense>
                <Await resolve={links}>
                  {(links) =>
                    links.length > 0 ? (
                      <div className="space-y-1.5">
                        {links.map((link) => {
                          const created = new Date(getId(link).timestamp);
                          const expires = new Date(link.expiresAt);
                          return (
                            <div
                              key={`share-link-${link.id}`}
                              className="rounded py-2 px-3 bg-gray-100 dark:bg-gray-900 flex flex-wrap sm:flex-nowrap"
                            >
                              <div className="truncate shrink-0 w-full sm:w-fit">
                                <p className="font-medium">
                                  <span className="text-gray-600 dark:text-gray-500">
                                    {
                                      // TODO this should be i18n'd so that the flow of time makes sense in RTL
                                      created.toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year:
                                          now.getFullYear() ===
                                          created.getFullYear()
                                            ? undefined
                                            : "numeric",
                                      })
                                    }{" "}
                                    -
                                  </span>
                                  <span
                                    className={twJoin(
                                      "ml-1",
                                      expires < now
                                        ? "text-rose-400"
                                        : expires.getTime() - now.getTime() <=
                                            86400000
                                          ? "text-yellow-500 dark:text-yellow-400"
                                          : undefined,
                                    )}
                                  >
                                    {expires.toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year:
                                        now.getFullYear() ===
                                        expires.getFullYear()
                                          ? undefined
                                          : "numeric",
                                    })}
                                  </span>
                                </p>
                                <p className="text-gray-600 dark:text-gray-500 text-sm">
                                  {expires < now
                                    ? t("id", { replace: { id: link.shareId } })
                                    : t("expiresIn", {
                                        replace: [
                                          relativeTime(
                                            new Date(link.expiresAt),
                                            t,
                                          ),
                                        ],
                                      })}
                                </p>
                              </div>
                              <hr className="sm:hidden my-1" />
                              <div className="ltr:ml-auto rtl:mr-auto ltr:pl-2 rtl:pr-2 my-auto flex gap-2">
                                {expires > now && (
                                  <>
                                    <Link
                                      to={`/?share=${link.shareId}`}
                                      target="_blank"
                                    >
                                      <Button
                                        discordstyle={ButtonStyle.Secondary}
                                      >
                                        <CoolIcon icon="External_Link" />
                                      </Button>
                                    </Link>
                                    <Button
                                      discordstyle={ButtonStyle.Primary}
                                      disabled={!userIsPremium(user)}
                                      title={t("refreshShareLink")}
                                      onClick={() => {
                                        submit(
                                          {
                                            action: "REFRESH_SHARE_LINK",
                                            linkId: String(link.id),
                                          },
                                          {
                                            method: "POST",
                                            replace: true,
                                          },
                                        );
                                      }}
                                    >
                                      <CoolIcon icon="Redo" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  discordstyle={ButtonStyle.Danger}
                                  onClick={(e) => {
                                    const callback = () =>
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

                                    if (e.shiftKey) {
                                      callback();
                                      return;
                                    }

                                    setConfirm({
                                      title: t("deleteShareLink"),
                                      children: (
                                        <>
                                          <p>{t("deleteShareLinkConfirm")}</p>
                                          <div className="rounded-lg py-2 px-3 flex bg-gray-100 dark:bg-gray-900/60 shadow my-2">
                                            <div className="truncate my-auto">
                                              <p className="font-medium">
                                                {
                                                  // TODO this should be i18n'd so that the flow of time makes sense in RTL
                                                  created.toLocaleDateString(
                                                    undefined,
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                      year:
                                                        now.getFullYear() ===
                                                        created.getFullYear()
                                                          ? undefined
                                                          : "numeric",
                                                    },
                                                  )
                                                }{" "}
                                                -{" "}
                                                {expires.toLocaleDateString(
                                                  undefined,
                                                  {
                                                    month: "short",
                                                    day: "numeric",
                                                    year:
                                                      now.getFullYear() ===
                                                      expires.getFullYear()
                                                        ? undefined
                                                        : "numeric",
                                                  },
                                                )}
                                              </p>
                                              <p className="text-gray-600 dark:text-gray-500 text-sm">
                                                {t("expiresIn", {
                                                  replace: [
                                                    relativeTime(
                                                      new Date(link.expiresAt),
                                                      t,
                                                    ),
                                                  ],
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
                      <p className="text-gray-500">{t("noLinks")}</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          ) : tab === "bots" ? (
            <div className="w-full h-fit">
              <div className="flex mb-2">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t(tab)}
                </p>
                <Button
                  onClick={() => setCreateBotOpen(true)}
                  className="mb-auto ltr:ml-auto rtl:mr-auto"
                  disabled={!userIsPremium(user)}
                >
                  {t("newBot")}
                </Button>
              </div>
              {!userIsPremium(user) && (
                <InfoBox icon="Handbag" severity="pink">
                  <Trans
                    t={t}
                    i18nKey="botsPremiumNote"
                    components={[
                      <Link
                        to="/donate"
                        className={twJoin(linkClassName, "dark:brightness-90")}
                      />,
                    ]}
                  />
                </InfoBox>
              )}
              <Suspense
                fallback={
                  <div className="animate-pulse flex flex-wrap gap-2">
                    {Array(10)
                      .fill(undefined)
                      .map((_, i) => (
                        <div
                          key={`bot-skeleton-${i}`}
                          className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-background-secondary-dark dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                        >
                          <div className="rounded-lg h-24 w-24 bg-gray-500/50" />
                          <div className="w-full flex mt-1">
                            <div className="rounded-full h-4 w-24 bg-gray-500/50 mx-auto" />
                          </div>
                        </div>
                      ))}
                  </div>
                }
              >
                <Await resolve={bots}>
                  {(bots) => {
                    return (
                      <div className="flex flex-wrap gap-2">
                        {bots.map((bot) => {
                          return (
                            <Link
                              key={`bot-${bot.id}`}
                              className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-background-secondary-dark dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg"
                              to={`/me/bots/${bot.id}`}
                            >
                              <img
                                src={botAppAvatar(bot, { size: 128 })}
                                alt={bot.name}
                                className="rounded-lg h-24 w-24"
                              />
                              <p className="text-center font-medium truncate text-sm mt-1">
                                {bot.name}
                              </p>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }}
                </Await>
              </Suspense>
            </div>
          ) : tab === "developer" ? (
            <div>
              <TabHeader>{t(tab)}</TabHeader>
              <p>Your ID: {String(user.id)}</p>
              <div className="mt-2">
                <TextInput
                  label="Snowflake Decoder"
                  value={snowflake ?? ""}
                  onChange={(e) => {
                    setSnowflake(e.currentTarget.value);
                  }}
                />
                {snowflakeDecoded && (
                  <p>
                    Timestamp:{" "}
                    {new Date(snowflakeDecoded.timestamp).toLocaleString()} (
                    {snowflakeDecoded.timestamp} sec.)
                    <br />
                    Sequence: {snowflakeDecoded.sequence}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
}
