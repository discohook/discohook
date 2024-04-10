import { REST } from "@discordjs/rest";
import {
  MetaFunction,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  APIGuild,
  APIGuildMember,
  ButtonStyle,
  RESTGetAPIGuildMemberResult,
  Routes,
} from "discord-api-types/v10";
import {
  BitFlagResolvable,
  PermissionFlags,
  PermissionsBitField,
} from "discord-bitflag";
import { getDate } from "discord-snowflake";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { refreshDiscordOAuth } from "~/auth-discord.server";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { getUser, getUserId } from "~/session.server";
import { getDb, oauthInfo } from "~/store.server";
import { cdn } from "~/util/discord";
import { Context, LoaderArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { zxParseParams, zxParseQuery } from "~/util/zod";
import { loader as ApiGetAuditLogGuild } from "../api/v1/audit-log.$guildId";
import { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import { Cell } from "./donate";

export const authenticateGuildMember = async (
  guildId: string,
  request: Request,
  context: Context,
  dataOnly = true,
) => {
  const user = await getUser(request, context, dataOnly ? false : undefined);
  if (!user) {
    throw json({ message: "Must be logged in" }, 401);
  }
  if (!user.discordUser) {
    throw json(
      { message: "A Discord account must be linked to perform this action" },
      401,
    );
  }

  const db = getDb(context.env.DATABASE_URL);
  let oauth = await db.query.oauthInfo.findFirst({
    where: eq(oauthInfo.discordId, user.discordUser.id),
  });
  if (oauth) oauth = await refreshDiscordOAuth(db, context.env, oauth);
  if (!oauth) {
    if (dataOnly) {
      throw json(
        { message: "No OAuth information is available, please log in again" },
        401,
      );
    } else {
      throw redirect(`/auth/discord?redirect=/s/${guildId}`);
    }
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let guild: APIGuild;
  try {
    guild = (await rest.get(Routes.guild(guildId))) as APIGuild;
    await context.env.KV.put(
      `cache-guild-${guildId}`,
      JSON.stringify({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
      }),
      { expirationTtl: 10800 }, // 3 hours
    );
  } catch {
    if (dataOnly) {
      throw json(
        { message: "Server does not exist or Discohook Utils is not a member of it" },
        404,
      );
    } else {
      throw redirect(`/bot?guildId=${guildId}`);
    }
  }
  let member: APIGuildMember;
  try {
    member = (await rest.get(Routes.userGuildMember(guildId), {
      headers: { Authorization: `Bearer ${oauth.accessToken}` },
      auth: false,
    })) as RESTGetAPIGuildMemberResult;
  } catch (e) {
    console.log(e);
    throw json(
      { message: "Server does not exist or you are not a member of it" },
      404,
    );
  }

  const permissions = new PermissionsBitField(
    member.roles
      .map((roleId) => {
        const role = guild.roles.find((r) => r.id === roleId);
        return role?.permissions ?? "0";
      })
      .reduce((prev, cur) => BigInt(cur) | prev, BigInt(0)),
  );

  return {
    guild,
    user,
    member,
    permissions,
  };
};

export interface AuthTokenData {
  userId: string;
  guildId: string;
  owner: boolean;
  permissions: string;
  accessed: number;
}

// It takes several seconds to fetch all the data that we need to verify
// permissions for a user, so instead we cache what we actually need and
// let clients authorize subrequests with just a token
export const verifyAuthToken = async (request: Request, context: Context) => {
  const userId = await getUserId(request, context);
  if (!userId) {
    throw json({ message: "Must be logged in" }, 401);
  }
  const { token } = zxParseQuery(request, { token: z.string() });
  const key = `auth-token-${token}`;
  const data = await context.env.KV.get<AuthTokenData>(key, "json");
  if (!data || data.userId !== String(userId)) {
    throw json({ message: "Invalid auth token" }, 401);
  }

  // We have a time limit of 1 hour per token, which shrinks (or is renewed
  // for a fraction of an hour) whenever the token is used, and it is never
  // renewed after it's been used 20 times. After the token expires, users
  // must get a new one by refreshing the page.
  data.accessed += 1;
  if (data.accessed <= 20) {
    await context.env.KV.put(key, JSON.stringify(data), {
      expirationTtl: Math.max(Math.ceil(3600 / data.accessed), 60),
    });
  }

  return data;
};

export const refreshAuthToken = async (
  guildId: string,
  request: Request,
  context: Context,
  dataOnly?: boolean,
) => {
  const data = await authenticateGuildMember(
    guildId,
    request,
    context,
    dataOnly,
  );
  const auth = {
    userId: data.user.id.toString(),
    guildId: data.guild.id,
    owner: data.guild.owner_id === data.member.user?.id,
    permissions: String(data.permissions.value),
    accessed: 1,
  } as AuthTokenData;

  const token = randomString(100);
  await context.env.KV.put(`auth-token-${token}`, JSON.stringify(auth), {
    expirationTtl: 3600,
  });

  return { ...data, auth, token };
};

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: z.string().refine((v) => !Number.isNaN(Number(v))),
  });
  const { guild, user, member, permissions, token } = await refreshAuthToken(
    guildId,
    request,
    context,
    false,
  );

  return {
    guild: {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    },
    user,
    member: {
      owner: member.user?.id === guild.owner_id,
      permissions: String(permissions.value),
    },
    token,
  };
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { guild } = data as SerializeFrom<typeof loader>;
    return [
      { title: `${guild.name} - Discohook` },
      guild.icon
        ? {
            tagName: "link",
            rel: "icon",
            type: guild.icon.startsWith("a_") ? "image/gif" : "image/webp",
            href: cdn.icon(guild.id, guild.icon, {
              size: 16,
              extension: guild.icon.startsWith("a_") ? "gif" : "webp",
            }),
          }
        : {},
    ];
  }
  return [];
};

const tabValues = ["home", "auditLog", "webhooks"] as const;

export default () => {
  const { guild, user, member, token } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const permissions = new PermissionsBitField(BigInt(member.permissions));
  const has = (...flags: BitFlagResolvable[]) =>
    member.owner ? true : permissions.has(...flags);

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("t") as (typeof tabValues)[number] | null;
  const [tab, setTab] = useState<(typeof tabValues)[number]>(
    defaultTab && tabValues.includes(defaultTab) ? defaultTab : tabValues[0],
  );

  const auditLogFetcher = useFetcher<typeof ApiGetAuditLogGuild>();
  const webhooksFetcher = useFetcher<typeof ApiGetGuildWebhooks>();
  // biome-ignore lint/correctness/useExhaustiveDependencies: A wizard specifies precisely the dependencies he means to.
  useEffect(() => {
    switch (tab) {
      case "auditLog": {
        if (!auditLogFetcher.data && auditLogFetcher.state === "idle") {
          auditLogFetcher.load(`/api/v1/audit-log/${guild.id}?token=${token}`);
        }
        break;
      }
      case "webhooks": {
        if (!webhooksFetcher.data && webhooksFetcher.state === "idle") {
          webhooksFetcher.load(
            `/api/v1/guilds/${guild.id}/webhooks?token=${token}`,
          );
        }
        break;
      }
      default:
        break;
    }
  }, [tab, auditLogFetcher.data, auditLogFetcher.state]);

  return (
    <div>
      <Header user={user} />
      <Prose>
        <TabsWindow
          tab={tab}
          setTab={setTab as (v: string) => void}
          data={[
            {
              label: "Home",
              value: "home",
            },
            ...(has(PermissionFlags.ManageWebhooks)
              ? [
                  {
                    label: "Webhooks",
                    value: "webhooks",
                  },
                ]
              : []),
            ...(has(PermissionFlags.ViewAuditLog, PermissionFlags.ManageGuild)
              ? [
                  {
                    label: "Audit Log",
                    value: "auditLog",
                  },
                ]
              : []),
          ]}
        >
          {tab === "home" ? (
            <div>
              <TabHeader>Home</TabHeader>
              <div className="space-y-2">
                <div className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex">
                  <img
                    className="rounded-lg h-12 w-12 mr-4"
                    src={
                      guild.icon
                        ? cdn.icon(guild.id, guild.icon, { size: 64 })
                        : cdn.defaultAvatar(0)
                    }
                    alt={guild.name}
                  />
                  <div className="-mt-2">
                    <p className="text-xl font-semibold">{guild.name}</p>
                    <p>
                      Welcome to the homepage. Depending on your permissions in
                      this server, you will be able to access various tabs in
                      the <span className="inline sm:hidden">top bar</span>
                      <span className="hidden sm:inline">sidebar</span>.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-gray-700 border border-black/10 dark:border-gray-50/10 table w-full">
                  <div className="table-header-group">
                    <div className="table-row">
                      <Cell className="font-semibold rounded-tl-lg">Tab</Cell>
                      <Cell className="font-semibold rounded-tr-lg">
                        Permissions
                      </Cell>
                    </div>
                  </div>
                  <div className="table-row-group">
                    <div className="table-row">
                      <Cell>Home</Cell>
                      <Cell>Just be a member</Cell>
                    </div>
                    <div className="table-row">
                      <Cell>Webhooks</Cell>
                      <Cell>Manage Webhooks</Cell>
                    </div>
                    <div className="table-row">
                      <Cell>Audit Log</Cell>
                      <Cell>View Audit Logs, Manage Server</Cell>
                    </div>
                    {/* <div className="table-row">
                      <Cell className="rounded-bl-lg">Components</Cell>
                      <Cell className="rounded-br-lg">
                        Manage Messages, Manage Webhooks
                      </Cell>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "webhooks" ? (
            <div>
              <TabHeader>Webhooks</TabHeader>
              <div className="space-y-2">
                {webhooksFetcher.data ? (
                  webhooksFetcher.data.map((webhook) => {
                    const createdAt = getDate(webhook.id as `${bigint}`);
                    return (
                      <div
                        key={`webhook-${webhook.id}`}
                        className="rounded-lg p-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                      >
                        <img
                          className="rounded-full my-auto w-10 h-10 mr-4"
                          src={
                            webhook.avatar
                              ? cdn.avatar(webhook.id, webhook.avatar, {
                                  size: 64,
                                })
                              : cdn.defaultAvatar(5)
                          }
                          alt={webhook.name}
                        />
                        <div className="truncate my-auto">
                          <div className="flex max-w-full">
                            <p className="font-semibold truncate dark:text-primary-230 text-lg">
                              {webhook.name}
                            </p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-500 text-xs">
                            {t("createdAtBy", {
                              replace: {
                                createdAt: new Date(
                                  createdAt,
                                ).toLocaleDateString(),
                                username: webhook.user?.name ?? "unknown",
                              },
                            })}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          <CoolIcon icon="Chevron_Right" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          ) : tab === "auditLog" ? (
            <div>
              <TabHeader
                subtitle={
                  <p>
                    Below is a list of actions that have been taken through
                    Discohook for{" "}
                    <span className="font-semibold">{guild.name}</span>. Some
                    expected entries may not be present--for example if a
                    webhook URL was leaked, it's not likely that the attacker
                    would use Discohook.
                    <br />
                    <br />
                    If you don't recognize a user, you may want to delete the
                    webhook.
                  </p>
                }
              >
                Audit Log
              </TabHeader>
              <div className="space-y-2">
                {auditLogFetcher.data ? (
                  auditLogFetcher.data.entries.map((entry) => {
                    const createdAt = getDate(entry.messageId as `${bigint}`);
                    const webhook = auditLogFetcher.data?.webhooks.find(
                      (w) => w.id === entry.webhookId,
                    );
                    const verbed =
                      entry.type === "send"
                        ? "sent"
                        : entry.type === "edit"
                          ? "edited"
                          : entry.type === "delete"
                            ? "deleted"
                            : "?";
                    return (
                      <div
                        key={`message-entry-${entry.messageId}`}
                        className="rounded-lg py-3 px-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                      >
                        {/* {entry.type && (
                          <CoolIcon
                            className="text-lg my-auto mr-2"
                            icon={
                              entry.type === "send"
                                ? "Add_Row"
                                : entry.type === "edit"
                                  ? "Edit_Pencil_01"
                                  : "Delete_Row"
                            }
                          />
                        )} */}
                        <img
                          className="rounded-full my-auto w-10 h-10 mr-2 hidden sm:block"
                          src={
                            webhook
                              ? webhook.avatar
                                ? cdn.avatar(webhook.id, webhook.avatar, {
                                    size: 64,
                                  })
                                : cdn.defaultAvatar(5)
                              : cdn.defaultAvatar(5)
                          }
                          alt="Instigator"
                        />
                        <div className="truncate my-auto">
                          <div className="flex max-w-full">
                            <p className="font-medium truncate dark:text-[#f9f9f9] text-base">
                              {entry.user?.name ? (
                                <span className="dark:text-primary-230">
                                  {entry.user.name}
                                </span>
                              ) : (
                                "Anonymous"
                              )}{" "}
                              {verbed} a message
                              {webhook ? ` with ${webhook.name}` : ""}
                            </p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-500 text-xs">
                            {new Date(createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          <a
                            href={`https://discord.com/channels/${guild.id}/${
                              entry.threadId ?? entry.channelId
                            }/${entry.messageId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button discordstyle={ButtonStyle.Secondary}>
                              <CoolIcon icon="External_Link" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading...</p>
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
};
