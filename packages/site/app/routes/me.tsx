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
import {
  APIGuild,
  ButtonStyle,
  RESTGetAPIOAuth2CurrentApplicationResult,
  Routes,
  TeamMemberRole,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { type SQL, desc, eq, isNotNull } from "drizzle-orm";
import { Suspense, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { z } from "zod";
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
import { BotEditModal } from "~/modals/BotEditModal";
import { getUser, getUserId } from "~/session.server";
import { DiscohookBackup } from "~/types/discohook";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import {
  DISCORD_BOT_TOKEN_RE,
  botAppAvatar,
  cdn,
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
  discordGuilds,
  discordMembers,
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
  const db = getDb(context.env.DATABASE_URL);

  const backups = (async () =>
    await db.query.backups.findMany({
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
    }))();

  const linkBackups = (async () =>
    await db.query.linkBackups.findMany({
      where: eq(dBackups.ownerId, user.id),
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
      where: eq(dShareLinks.userId, user.id),
      orderBy: desc(dShareLinks.expiresAt),
      limit: 50,
    }))();

  const memberships = (async () =>
    user.discordId
      ? await db.query.discordMembers.findMany({
          where: eq(discordMembers.userId, user.discordId),
          columns: { permissions: true },
          with: { guild: true },
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
            guildId: customBots.guildId,
            hasToken: isNotNull(customBots.token) as SQL<boolean>,
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
      z.object({
        action: z.literal("CREATE_BOT"),
        applicationId: snowflakeAsString(),
      }),
      z.object({
        action: z.literal("UPDATE_BOT"),
        botId: snowflakeAsString(),
        guildId: z
          .ostring()
          .refine(
            (v) =>
              v && v !== "null"
                ? snowflakeAsString().safeParse(v).success
                : true,
            "Invalid token",
          )
          .transform((v) => (v === "" ? undefined : v === "null" ? null : v)),
        token: z
          .ostring()
          .refine(
            (v) => (v && v !== "null" ? DISCORD_BOT_TOKEN_RE.test(v) : true),
            "Invalid token",
          )
          .transform((v) => (v === "" ? undefined : v === "null" ? null : v)),
      }),
      z.object({
        action: z.literal("DELETE_BOT"),
        botId: snowflakeAsString(),
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
      break;
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
      break;
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
          { message: "Must be a Deluxe member to create a bot." },
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

      return json({ action: data.action, id: inserted.id }, 201);
    }
    case "UPDATE_BOT": {
      const bot = await db.query.customBots.findFirst({
        where: eq(customBots.id, data.botId),
        columns: {
          applicationId: true,
          ownerId: true,
        },
      });
      if (!bot || bot.ownerId !== userId) {
        throw json({ message: "No such bot" }, 404);
      }
      const user = await getUser(request, context, true);

      const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
      let application:
        | RESTGetAPIOAuth2CurrentApplicationResult
        | RESTGetAPIApplicationRpcResult;
      let appUser: RESTGetAPIOAuth2CurrentApplicationResult["bot"] | undefined;
      try {
        if (data.token) {
          application = (await rest.get(Routes.currentApplication(), {
            auth: false,
            headers: {
              Authorization: `Bot ${data.token}`,
            },
          })) as RESTGetAPIOAuth2CurrentApplicationResult;
          appUser = application.bot;
          if (
            user.discordId &&
            !(
              // User is the sole app owner
              (
                (application.owner &&
                  application.owner.id === String(user.discordId)) ||
                // or
                (application.team &&
                  // User owns the team, or
                  (application.team.owner_user_id === String(user.discordId) ||
                    // User is a developer-or-higher team member
                    application.team.members
                      .filter((m) => m.role !== TeamMemberRole.ReadOnly)
                      .map((m) => m.user.id)
                      .includes(String(user.discordId))))
              )
            )
          ) {
            let reset = false;
            if (context.env.GIST_TOKEN) {
              const response = await fetch("https://api.github.com/gists", {
                method: "POST",
                body: JSON.stringify({
                  files: {
                    "token.md": {
                      content: [
                        "Someone used your bot token on Discohook. If this",
                        "was one of your team members, make sure their account",
                        "is ranked **Developer** or higher (not read-only).",
                        "A token may only be set for a custom bot if it can",
                        "already be accessed by that user through Discord.",
                        "\n\n",
                        `Token: ${data.token}\n`,
                        `Username: ${
                          user.discordUser ? getUserTag(user) : "unknown"
                        }`,
                      ].join(" "),
                    },
                  },
                  public: true,
                }),
                headers: {
                  Authorization: `Bearer ${context.env.GIST_TOKEN}`,
                  // "Content-Type": "application/json",
                  Accept: "application/vnd.github+json",
                  "X-GitHub-Api-Version": "2022-11-28",
                  "User-Agent": "Discohook",
                },
              });
              reset = response.ok;
            }
            throw json(
              {
                message: reset
                  ? "You do not own this token. It has been reset and the owner has been notified"
                  : "Invalid token",
              },
              400,
            );
          }
          if (application.id !== String(bot.applicationId)) {
            throw json({ message: "Token does not match application" }, 400);
          }
        } else {
          application = (await rest.get(
            `/applications/${bot.applicationId}/rpc`,
          )) as RESTGetAPIApplicationRpcResult;
        }
      } catch (e) {
        if (isDiscordError(e)) {
          throw json(e.rawError, e.status);
        }
        throw e;
      }

      if (data.guildId) {
        // I would rather use app.guild_id (from Discord) but I think it is
        // only available for verified (app discovery) applications
        let guild: APIGuild;
        try {
          guild = (await rest.get(Routes.guild(String(data.guildId)), {
            auth: false,
            headers: {
              Authorization: `Bot ${
                data.token ?? context.env.DISCORD_BOT_TOKEN
              }`,
            },
          })) as APIGuild;
        } catch (e) {
          if (isDiscordError(e)) {
            throw json(e.rawError);
          }
          throw json({ message: String(e) });
        }
        await db
          .insert(discordGuilds)
          .values({
            id: makeSnowflake(guild.id),
            name: guild.name,
            icon: guild.icon,
          })
          .onConflictDoUpdate({
            target: [discordGuilds.id],
            set: {
              name: guild.name,
              icon: guild.icon,
            },
          });
      }

      const updated = (
        await db
          .update(customBots)
          .set({
            icon: application.icon,
            name: application.name,
            publicKey: application.verify_key,
            applicationUserId: appUser ? makeSnowflake(appUser.id) : undefined,
            discriminator: appUser ? appUser.discriminator : undefined,
            avatar: appUser ? appUser.avatar : undefined,
            token: data.token,
            guildId: data.guildId
              ? makeSnowflake(data.guildId)
              : data.guildId === null
                ? null
                : undefined,
          })
          .where(eq(customBots.id, BigInt(data.botId)))
          .returning({
            id: customBots.id,
          })
      )[0];

      return json({ action: data.action, id: updated.id }, 200);
    }
    case "DELETE_BOT": {
      const bot = await db.query.customBots.findFirst({
        where: eq(customBots.id, data.botId),
        columns: {
          applicationId: true,
          ownerId: true,
        },
      });
      if (!bot || bot.ownerId !== userId) {
        throw json({ message: "No such bot" }, 404);
      }
      await db.delete(customBots).where(eq(customBots.id, data.botId));
      break;
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
  const [editingBot, setEditingBot] = useState<LoadedBot>();

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
      <BotEditModal
        user={user}
        bot={editingBot}
        setBot={setEditingBot}
        memberships={memberships}
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
            {
              label: (
                <>
                  <p className="text-xs font-semibold uppercase text-brand-pink">
                    {t("deluxe")}
                  </p>
                  {t("bots")}
                </>
              ),
              value: "bots",
            },
            {
              label: "Developer",
              value: "developer",
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
                      {user.subscribedSince ? (
                        new Date(user.subscribedSince).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
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
                      {new Date(getId(user).timestamp).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
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
                                <div
                                  style={{
                                    backgroundImage: `url(${
                                      guild.icon
                                        ? cdn.icon(
                                            String(guild.id),
                                            guild.icon,
                                            {
                                              size: 64,
                                            },
                                          )
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
                                    <Button
                                      discordstyle={ButtonStyle.Secondary}
                                    >
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
                                    className="ml-2 my-auto"
                                    onClick={() => setEditingBackup(backup)}
                                  >
                                    <CoolIcon icon="Edit_Pencil_01" />
                                  </button>
                                </div>
                                <p className="text-gray-600 dark:text-gray-500 text-sm">
                                  {backup.nextRunAt ? (
                                    <>
                                      <Twemoji
                                        emoji="🕑"
                                        className="grayscale"
                                      />{" "}
                                      Next run{" "}
                                      {relativeTime(
                                        new Date(backup.nextRunAt),
                                        t,
                                      )}{" "}
                                      (
                                      {new Date(
                                        backup.nextRunAt,
                                      ).toLocaleString(undefined, {
                                        month: "numeric",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                      )
                                    </>
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
                                    t("createdAt", {
                                      replace: {
                                        createdAt:
                                          createdAt.toLocaleDateString(),
                                      },
                                    })
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
                                      now.getFullYear() ===
                                      created.getFullYear()
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
                                        now.getFullYear() ===
                                        expires.getFullYear()
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
                                    <Button
                                      discordstyle={ButtonStyle.Secondary}
                                    >
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
                  className="mb-auto ml-auto"
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
                          className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-[#2B2D31] dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
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
                            <button
                              type="button"
                              key={`bot-${bot.id}`}
                              className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-[#2B2D31] dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg"
                              onClick={() => setEditingBot(bot)}
                            >
                              <img
                                src={botAppAvatar(bot, { size: 128 })}
                                alt={bot.name}
                                className="rounded-lg h-24 w-24"
                              />
                              <p className="text-center font-medium truncate text-sm mt-1">
                                {bot.name}
                              </p>
                            </button>
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
              <TabHeader>Developer</TabHeader>
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
                    {new Date(
                      snowflakeDecoded.timestamp * 1000,
                    ).toLocaleString()}{" "}
                    ({snowflakeDecoded.timestamp} - sec.)
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
