import { REST } from "@discordjs/rest";
import { MetaFunction, SerializeFrom, json } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import {
  BitFlagResolvable,
  PermissionFlags,
  PermissionsBitField,
} from "discord-bitflag";
import { getDate } from "discord-snowflake";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { TabHeader, TabsWindow } from "~/components/tabs";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
} from "~/session.server";
import { cdn } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";
import { loader as ApiGetAuditLogGuild } from "../api/v1/audit-log.$guildId";
import { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import { Cell } from "./donate";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: z.string().refine((v) => !Number.isNaN(Number(v))),
  });
  const [token, respond] = await authorizeRequest(request, context);
  let { owner, permissions, guild } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!guild) {
    guild = await getGuild(
      guildId,
      new REST().setToken(context.env.DISCORD_BOT_TOKEN),
      context.env,
    );
  }

  return respond(
    json({
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
      },
      user: token.user,
      member: {
        owner,
        permissions: permissions.value.toString(),
      },
    }),
  );
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
  const { guild, user, member } = useLoaderData<typeof loader>();
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
          auditLogFetcher.load(`/api/v1/audit-log/${guild.id}`);
        }
        break;
      }
      case "webhooks": {
        if (!webhooksFetcher.data && webhooksFetcher.state === "idle") {
          webhooksFetcher.load(`/api/v1/guilds/${guild.id}/webhooks`);
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
