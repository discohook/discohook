import { defer, json } from "@remix-run/cloudflare";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { type SQL, isNotNull } from "drizzle-orm";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { AsyncGuildSelect, OptionGuild } from "~/components/AsyncGuildSelect";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { BotDeleteConfirmModal } from "~/modals/BotDeleteConfirmModal";
import { getUser } from "~/session.server";
import { customBots, discordMembers, eq, getDb, sql } from "~/store.server";
import { DISCORD_BOT_TOKEN_RE, botAppAvatar } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { copyText } from "~/util/text";
import { getUserTag } from "~/util/users";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const user = await getUser(request, context, true);

  const db = getDb(context.env.DATABASE_URL);
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
          columns: { permissions: true },
          with: { guild: true },
        })
      : [])();

  return defer({ user, bot, memberships });
};

const tabValues = ["information"] as const;

export default function CustomBot() {
  const { user, bot, memberships } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const submit = useSubmit();

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
              label: t("information"),
              value: "information",
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
                    action: "/me",
                    navigate: false,
                  });
                }}
              >
                {error}
                <div className="mb-4 rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex">
                  {bot ? (
                    <>
                      <img
                        className="rounded-full my-auto w-8 h-8 mr-3"
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
                        className="block ml-auto my-auto"
                        href={`https://discord.com/developers/applications/${bot.applicationId}/information`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          discordstyle={ButtonStyle.Link}
                          className="text-sm"
                        >
                          {t("portal")}
                        </Button>
                      </a>
                      <Button
                        discordstyle={ButtonStyle.Danger}
                        className="text-sm ml-1"
                        onClick={() => setDeleting(true)}
                        emoji={{ name: "🗑️" }}
                      />
                    </>
                  ) : (
                    <>
                      <div className="rounded-full my-auto w-8 h-8 mr-3 bg-gray-400 dark:bg-gray-600" />
                      <div className="my-auto">
                        <div className="rounded-full truncate bg-gray-400 dark:bg-gray-600 w-36 h-4" />
                      </div>
                    </>
                  )}
                </div>
                <input name="action" value="UPDATE_BOT" readOnly hidden />
                {bot && (
                  <>
                    <input
                      name="botId"
                      value={String(bot.id)}
                      readOnly
                      hidden
                    />
                    <div>
                      {bot.hasToken ? (
                        <div>
                          <p className="text-sm font-medium">
                            <Trans
                              t={t}
                              i18nKey="botTokenCheck"
                              components={[
                                <CoolIcon
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
                                  action: "UPDATE_BOT",
                                  botId: String(bot.id),
                                  token: "null",
                                },
                                {
                                  method: "PATCH",
                                  action: "/me",
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
                      <p className="text-sm font-medium">{t("server_one")}</p>
                      <div className="flex">
                        <div className="grow">
                          <AsyncGuildSelect
                            name="guildId"
                            isClearable
                            guilds={(async () =>
                              (await memberships)
                                .filter((m) =>
                                  new PermissionsBitField(
                                    BigInt(m.permissions),
                                  ).has(PermissionFlags.ManageGuild),
                                )
                                .map((m) => m.guild))()}
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
                          <Button
                            discordstyle={ButtonStyle.Link}
                            disabled={!guild}
                          >
                            {t("addToServer")}
                          </Button>
                        </a>
                      </div>
                    </div>
                    {bot.url && (
                      <div className="mt-2 flex">
                        <div className="grow">
                          <TextInput
                            label={t("botInteractionUrl")}
                            className="w-full"
                            value={bot.url}
                            readOnly
                          />
                        </div>
                        <Button
                          onClick={() => {
                            if (bot.url) copyText(bot.url);
                          }}
                          className="ml-2 mt-auto"
                        >
                          {t("copy")}
                        </Button>
                      </div>
                    )}
                  </>
                )}
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
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
}
