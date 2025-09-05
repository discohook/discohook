import { REST } from "@discordjs/rest";
import { defer, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  type APIApplication,
  type APIGuild,
  type APIGuildMember,
  ButtonStyle,
  type RESTGetAPIOAuth2CurrentApplicationResult,
  type RESTGetAPIOAuth2CurrentAuthorizationResult,
  RESTJSONErrorCodes,
  type RESTPostOAuth2AccessTokenResult,
  Routes,
  TeamMemberRole,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { isNotNull, type SQL } from "drizzle-orm";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { z } from "zod";
import {
  AsyncGuildSelect,
  type OptionGuild,
} from "~/components/AsyncGuildSelect";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { Prose } from "~/components/Prose";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { TextInput } from "~/components/TextInput";
import { BotDeleteConfirmModal } from "~/modals/BotDeleteConfirmModal";
import { getUser } from "~/session.server";
import {
  customBots,
  discordGuilds,
  discordMembers,
  eq,
  getDb,
  makeSnowflake,
  sql,
} from "~/store.server";
import type { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import {
  botAppAvatar,
  DISCORD_BOT_TOKEN_RE,
  isDiscordError,
} from "~/util/discord";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import { base64Encode, cycleCopyText } from "~/util/text";
import { getUserTag } from "~/util/users";
import { snowflakeAsString, zxParseForm, zxParseParams } from "~/util/zod";
import type { KVCustomBot } from "./me.bots";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const user = await getUser(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  const bot = (
    await db
      .select({
        id: customBots.id,
        name: customBots.name,
        applicationId: customBots.applicationId,
        applicationUserId: customBots.applicationUserId,
        icon: customBots.icon,
        avatar: customBots.avatar,
        discriminator: customBots.discriminator,
        guildId: customBots.guildId,
        ownerId: customBots.ownerId,
        hasToken: isNotNull(customBots.token) as SQL<boolean>,
        hasSecret: isNotNull(customBots.clientSecret) as SQL<boolean>,
        // This is a little wasteful insofar as saving a few transit bytes by
        // constructing on the client instead, but this is a lot more convenient
        url: context.env.BOTS_ORIGIN
          ? sql<string>`${context.env.BOTS_ORIGIN}::text || '/custom/' || ${customBots.id}::text`
          : sql<null>`NULL`,
      })
      .from(customBots)
      .where(eq(customBots.id, id))
      .limit(1)
  )[0];
  if (!bot || String(bot.ownerId) !== String(user.id)) {
    throw json({ message: "Unknown Bot" }, 404);
  }

  const memberships = (async () =>
    user.discordId
      ? await db.query.discordMembers.findMany({
          where: eq(discordMembers.userId, user.discordId),
          columns: { owner: true, permissions: true, favorite: true },
          with: { guild: { columns: { id: true, name: true, icon: true } } },
        })
      : [])();

  return defer({ user, bot, memberships });
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id: botId } = zxParseParams(params, { id: snowflakeAsString() });
  const user = await getUser(request, context, true);
  const db = getDb(context.env.HYPERDRIVE);

  if (request.method === "PATCH") {
    const {
      guildId,
      token,
      secret: clientSecret,
    } = await zxParseForm(request, {
      guildId: z
        .ostring()
        .refine(
          (v) =>
            v && v !== "null" ? snowflakeAsString().safeParse(v).success : true,
          "Invalid guild ID",
        )
        .transform((v) => (v === "" ? undefined : v === "null" ? null : v)),
      token: z
        .ostring()
        .refine(
          (v) => (v && v !== "null" ? DISCORD_BOT_TOKEN_RE.test(v) : true),
          "Invalid token",
        )
        .transform((v) => (v === "" ? undefined : v === "null" ? null : v)),
      secret: z
        .ostring()
        .transform((v) => (v === "" ? undefined : v === "null" ? null : v)),
    });

    const bot = await db.query.customBots.findFirst({
      where: (customBots, { eq }) => eq(customBots.id, botId),
      columns: {
        applicationId: true,
        ownerId: true,
      },
    });
    if (!bot || bot.ownerId !== BigInt(user.id)) {
      throw json({ message: "Unknown Bot" }, 404);
    }

    const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
    let application: Pick<
      APIApplication,
      "id" | "name" | "icon" | "verify_key"
    >;
    let appUser: RESTGetAPIOAuth2CurrentApplicationResult["bot"] | undefined;
    try {
      if (token) {
        const app = (await rest.get(Routes.currentApplication(), {
          auth: false,
          headers: {
            Authorization: `Bot ${token}`,
          },
        })) as RESTGetAPIOAuth2CurrentApplicationResult;
        application = app;
        appUser = app.bot;
        if (
          user.discordId &&
          !(
            // User is the sole app owner
            (
              (app.owner && app.owner.id === String(user.discordId)) ||
              // or
              (app.team &&
                // User owns the team, or
                (app.team.owner_user_id === String(user.discordId) ||
                  // User is a developer-or-higher team member
                  app.team.members
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
                      `- Token: ${token}\n`,
                      `- Username: ${
                        user.discordUser ? getUserTag(user) : "unknown"
                      }`,
                    ].join(" "),
                  },
                },
                public: true,
              }),
              headers: {
                Authorization: `Bearer ${context.env.GIST_TOKEN}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "Discohook",
              },
            });
            if (!response.ok) {
              console.error(await response.text());
            }
            reset = response.ok;
          }
          throw json(
            {
              message: reset
                ? "You do not own this token. It has been reset and the owner has been notified"
                : "Invalid token",
            },
            reset ? 403 : 400,
          );
        }
        if (application.id !== String(bot.applicationId)) {
          throw json({ message: "Token does not match application" }, 400);
        }
      } else if (clientSecret) {
        const grantData = (await rest.post(Routes.oauth2TokenExchange(), {
          body: new URLSearchParams({
            grant_type: "client_credentials",
            scope: "identify applications.commands.update",
          }),
          passThroughBody: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${base64Encode(
              `${bot.applicationId}:${clientSecret}`,
            )}`,
          },
          auth: false,
        })) as RESTPostOAuth2AccessTokenResult;
        // TODO: store oauth2 data, discard secret?
        // This endpoint also includes a convenient absolute `expires` value
        const authInfo = (await rest.get(Routes.oauth2CurrentAuthorization(), {
          headers: {
            Authorization: `Bearer ${grantData.access_token}`,
          },
          auth: false,
        })) as RESTGetAPIOAuth2CurrentAuthorizationResult;
        // It's typed as Partial<APIApplication> but we know we have the required data
        application = authInfo.application as typeof application;
      } else {
        // We avoid this endpoint because it's not documented and may stop working
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

    if (guildId) {
      // I would rather use app.guild_id (from Discord) but I think it is
      // only available for verified (app discovery) applications
      let guild: APIGuild;
      try {
        guild = (await rest.get(Routes.guild(String(guildId)), {
          auth: false,
          headers: {
            Authorization: `Bot ${token ?? context.env.DISCORD_BOT_TOKEN}`,
          },
        })) as APIGuild;
      } catch (e) {
        if (isDiscordError(e)) {
          throw json(e.rawError);
        }
        throw json({ message: String(e) });
      }
      let me: APIGuildMember | undefined;
      let botIsNotMember = false;
      try {
        me = (await rest.get(
          Routes.userGuildMember(guild.id),
        )) as APIGuildMember;
      } catch (e) {
        if (
          isDiscordError(e) &&
          (e.code === RESTJSONErrorCodes.UnknownGuild ||
            e.code === RESTJSONErrorCodes.UnknownMember)
        ) {
          botIsNotMember = true;
        }
      }

      await db
        .insert(discordGuilds)
        .values({
          id: makeSnowflake(guild.id),
          name: guild.name,
          icon: guild.icon,
          ownerDiscordId: makeSnowflake(guild.owner_id),
          botJoinedAt: me?.joined_at ? new Date(me.joined_at) : undefined,
        })
        .onConflictDoUpdate({
          target: [discordGuilds.id],
          set: {
            name: guild.name,
            icon: guild.icon,
            ownerDiscordId: makeSnowflake(guild.owner_id),
            botJoinedAt: me?.joined_at
              ? new Date(me.joined_at)
              : botIsNotMember
                ? // We have left the server or were never in it
                  null
                : // Something else went wrong fetching our member
                  undefined,
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
          token,
          clientSecret,
          guildId: guildId
            ? makeSnowflake(guildId)
            : guildId === null
              ? null
              : undefined,
        })
        .where(eq(customBots.id, botId))
        .returning({
          id: customBots.id,
          token: customBots.token,
        })
    )[0];
    await context.env.KV.put(
      `custom-bot-${botId}`,
      JSON.stringify({
        applicationId: application.id,
        publicKey: application.verify_key,
        token: updated.token,
      } satisfies KVCustomBot),
    );

    return { id: updated.id };
  } else if (request.method === "DELETE") {
    const bot = await db.query.customBots.findFirst({
      where: (customBots, { eq }) => eq(customBots.id, botId),
      columns: {
        applicationId: true,
        ownerId: true,
      },
    });
    if (!bot || bot.ownerId !== BigInt(user.id)) {
      throw json({ message: "Unknown Bot" }, 404);
    }
    try {
      await context.env.KV.delete(`custom-bot-${botId}`);
    } catch {}
    await db.delete(customBots).where(eq(customBots.id, botId));
    throw redirect("/me/bots");
  }

  throw new Response("Method Not Allowed", { status: 405 });
};

const tabValues = ["information"] as const;

export default function CustomBot() {
  const { user, bot, memberships } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [tab, setTab] = useState<(typeof tabValues)[number]>("information");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useError();
  const [guild, setGuild] = useState<OptionGuild>();

  useEffect(() => {
    if (bot.guildId) {
      memberships.then((ships) => {
        const g = ships.find(
          (m) => String(m.guild.id) === String(bot.guildId),
        )?.guild;
        if (g) {
          setGuild(g);
        }
      });
    }
  }, [bot.guildId, memberships]);

  return (
    <div>
      <BotDeleteConfirmModal open={deleting} setOpen={setDeleting} bot={bot} />
      <Header user={user} />
      <Prose>
        <TabsWindow
          tab={tab}
          setTab={setTab as (v: string) => void}
          data={[
            {
              label: (
                <>
                  <CoolIcon icon="Arrow_Left_MD" rtl="Arrow_Right_MD" />{" "}
                  {t("backToBots")}
                </>
              ),
              value: "back",
              onClick: () => navigate("/me/bots"),
            },
            {
              label: t("information"),
              value: "information",
            },
            {
              label: t("commands"),
              value: "commands",
            },
          ]}
        >
          {tab === "information" ? (
            <div>
              <TabHeader>{t(tab)}</TabHeader>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  if (
                    form.get("token") &&
                    !DISCORD_BOT_TOKEN_RE.test(
                      form.get("token")?.toString() ?? "",
                    )
                  ) {
                    setError({ message: "Invalid token" });
                    return;
                  }
                  if (!form.get("guildId")) {
                    form.set("guildId", "null");
                  }
                  submit(form, {
                    method: "PATCH",
                    navigate: false,
                  });
                }}
              >
                {error}
                <div className="mb-4 rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex">
                  <img
                    className="rounded-full my-auto w-8 h-8 ltr:mr-3 rtl:ml-3"
                    src={botAppAvatar(bot, { size: 64 })}
                    alt={bot.name}
                  />
                  <div className="truncate my-auto">
                    <div className="flex max-w-full">
                      <p className="font-semibold truncate dark:text-primary-230 text-base">
                        {bot.name}
                      </p>
                    </div>
                  </div>
                  <a
                    className="block ltr:ml-auto rtl:mr-auto my-auto"
                    href={`https://discord.com/developers/applications/${bot.applicationId}/information`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button discordstyle={ButtonStyle.Link} className="text-sm">
                      {t("portal")}
                    </Button>
                  </a>
                  <Button
                    discordstyle={ButtonStyle.Danger}
                    className="ltr:ml-1 rtl:mr-1"
                    onClick={() => setDeleting(true)}
                  >
                    <CoolIcon icon="Trash_Full" />
                  </Button>
                </div>
                <input name="botId" value={String(bot.id)} readOnly hidden />
                <div>
                  {bot.hasToken ? (
                    <div>
                      <p className="text-sm font-medium">
                        <Trans
                          t={t}
                          i18nKey="botTokenCheck"
                          components={[
                            <CoolIcon
                              key="0"
                              icon="Check_Big"
                              className="text-green-300"
                            />,
                          ]}
                        />
                      </p>
                      <p>{t("botTokenHiddenNote")}</p>
                      <Button
                        className="mt-1 text-sm"
                        onClick={() => {
                          submit(
                            {
                              token: "null",
                            },
                            {
                              method: "PATCH",
                              navigate: false,
                            },
                          );
                          // setBot({ ...bot, hasToken: false });
                        }}
                      >
                        {t("botClearToken")}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <TextInput
                        name="token"
                        label={
                          <Trans
                            t={t}
                            i18nKey="botTokenCheck"
                            components={[
                              <CoolIcon
                                key="0"
                                icon="Close_MD"
                                className="text-red-400"
                              />,
                            ]}
                          />
                        }
                        className="w-full"
                        // pattern={escapeRegex(DISCORD_BOT_TOKEN_RE)}
                        type="password"
                        onBlur={(e) => {
                          e.currentTarget.type = "password";
                        }}
                        onFocus={(e) => {
                          e.currentTarget.type = "text";
                        }}
                      />
                      <p className="mt-1 text-sm">
                        {t("botNoTokenNote")}{" "}
                        {t("botTokenOwnerWarning", {
                          replace: { username: getUserTag(user) },
                        })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  {bot.hasSecret ? (
                    <div>
                      <p className="text-sm font-medium">
                        <Trans
                          t={t}
                          i18nKey="appSecretCheck"
                          components={[
                            <CoolIcon
                              key="0"
                              icon="Check_Big"
                              className="text-green-300"
                            />,
                          ]}
                        />
                      </p>
                      <p>{t("appSecretHiddenNote")}</p>
                      <Button
                        className="mt-1 text-sm"
                        onClick={() => {
                          submit(
                            {
                              secret: "null",
                            },
                            {
                              method: "PATCH",
                              navigate: false,
                            },
                          );
                        }}
                      >
                        {t("appClearSecret")}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <TextInput
                        name="secret"
                        label={
                          <Trans
                            t={t}
                            i18nKey="appSecretCheck"
                            components={[
                              <CoolIcon
                                key="0"
                                icon="Close_MD"
                                className="text-red-400"
                              />,
                            ]}
                          />
                        }
                        className="w-full"
                        type="password"
                        onBlur={(e) => {
                          e.currentTarget.type = "password";
                        }}
                        onFocus={(e) => {
                          e.currentTarget.type = "text";
                        }}
                      />
                      <p className="mt-1 text-sm">{t("appSecretUsageNote")}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">{t("server_one")}</p>
                  <div className="flex">
                    <div className="grow">
                      <AsyncGuildSelect
                        name="guildId"
                        isClearable
                        guilds={(async () =>
                          (await memberships)
                            .filter(
                              (m) =>
                                m.owner ||
                                new PermissionsBitField(
                                  BigInt(m.permissions),
                                ).has(PermissionFlags.ManageGuild),
                            )
                            .map(({ guild, favorite }) => ({
                              ...guild,
                              favorite,
                            })))()}
                        value={guild ?? null}
                        onChange={(g) => setGuild(g ?? undefined)}
                      />
                    </div>
                    <a
                      href={
                        !guild || !bot
                          ? ""
                          : `https://discord.com/oauth2/authorize/?${new URLSearchParams(
                              {
                                client_id: bot.applicationId.toString(),
                                guild_id: guild.id.toString(),
                                scope: "bot",
                              },
                            )}`
                      }
                      className="block ml-1 my-auto"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button discordstyle={ButtonStyle.Link} disabled={!guild}>
                        {t("addToServer")}
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="flex w-full mt-4">
                  <Button
                    type="submit"
                    disabled={!bot}
                    discordstyle={ButtonStyle.Success}
                  >
                    {t("save")}
                  </Button>
                </div>
              </Form>
            </div>
          ) : tab === "commands" ? (
            <div>
              <TabHeader>{t(tab)}</TabHeader>
              {error}
              <input name="botId" value={String(bot.id)} readOnly hidden />
              <div>
                <div className="flex">
                  <div className="grow">
                    <TextInput
                      label={t("botInteractionUrl")}
                      className="w-full"
                      value={bot.url ?? "Not available"}
                      readOnly
                    />
                  </div>
                  <Button
                    onClick={(e) => {
                      if (bot.url) cycleCopyText(bot.url, t, e.currentTarget);
                    }}
                    className="ml-2 mt-auto"
                  >
                    {t("copy")}
                  </Button>
                </div>
                <p className="mt-1 text-sm">
                  <Trans
                    t={t}
                    i18nKey="botInteractionUrlNote"
                    components={[
                      // biome-ignore lint/a11y/useAnchorContent: Filled by i18next
                      <a
                        key="0"
                        className={linkClassName}
                        href={`https://discord.com/developers/applications/${bot.applicationId}/information`}
                        target="_blank"
                        rel="noreferrer"
                      />,
                    ]}
                  />
                </p>
              </div>
              {/* <div className="flex w-full mt-4">
                <Button disabled={!bot} discordstyle={ButtonStyle.Success}>
                  {t("save")}
                </Button>
              </div> */}
            </div>
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
}
