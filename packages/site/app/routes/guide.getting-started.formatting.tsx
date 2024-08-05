import { MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { TFunction } from "i18next";
import React, { useEffect, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { codeStyle } from "~/components/preview/Markdown";
import { Message } from "~/components/preview/Message.client";
import { TabsWindow } from "~/components/tabs";
import { getUser } from "~/session.server";
import { useCache } from "~/util/cache/CacheManager";
import {
  cdn,
  characterAvatars,
  getCharacterAvatarUrl,
  getSnowflakeDate,
  time,
} from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import { getUserAvatar, getUserTag } from "~/util/users";
import { GuideFileMeta } from "./guide.$";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return { user };
};

export const meta: MetaFunction = () => [
  { title: "How to format your messages - Discohook Guides" },
  {
    name: "og:site_name",
    content: "Discohook",
  },
  {
    name: "og:title",
    content: "How to format your messages",
  },
  {
    name: "og:description",
    content:
      "How to format your messages with dynamic template options and custom variables",
  },
];

const FormatCategoryHeader: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <summary className="group-open:mb-2 transition-[margin] marker:content-none marker-none cursor-pointer">
    <div className="flex rounded-lg bg-gray-200 dark:bg-primary-700 p-3 shadow-md group-open:shadow transition-shadow text-2xl">
      {children}
      <CoolIcon
        icon="Chevron_Right"
        rtl="Chevron_Left"
        className="ltr:ml-auto rtl:mr-auto my-auto ltr:group-open:rotate-90 rtl:group-open:-rotate-90 transition-transform"
      />
    </div>
  </summary>
);

const FormatCategoryBody: React.FC<{
  t: TFunction;
  paths: string[];
  setPreviewPath: React.Dispatch<string>;
}> = ({ t, paths, setPreviewPath }) => (
  <table className="w-full">
    <thead>
      <tr className="font-medium">
        <td>{t("option")}</td>
        <td>{t("description")}</td>
      </tr>
    </thead>
    <tbody>
      {paths.map((path) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: we just want this to work on mobile devices too
        <tr
          key={`format-path-${path}`}
          className="rounded hover:bg-blurple/20 p-px transition"
          onMouseOver={() => setPreviewPath(path)}
          onFocus={() => setPreviewPath(path)}
          onClick={() => setPreviewPath(path)}
        >
          <td>
            <span className={codeStyle}>{`{${path}}`}</span>
          </td>
          <td>{t(`formatOptionDescription.${path}`)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function FormattingPage() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const cache = useCache(!user);
  const [settings] = useLocalStorage();

  const now = new Date();
  const placeholders: Record<string, string | number> = {
    ...(user?.discordUser
      ? {
          "member.id": user.discordUser.id.toString(),
          "member.name": user.discordUser.name,
          "member.discriminator": user.discordUser.discriminator ?? "0",
          "member.display_name":
            user.discordUser.globalName ?? user.discordUser.name,
          "member.tag": getUserTag(user),
          "member.mention": `<@${user.discordUser.id}>`,
          "member.avatar_url": getUserAvatar(user, { size: 2048 }),
          "member.default_avatar_url": getUserAvatar({
            discordUser: { ...user.discordUser, avatar: null },
          }),
          "member.bot": "False",
          "member.created": time(
            getSnowflakeDate(String(user.discordUser.id)),
            "d",
          ),
          "member.created_relative": time(
            getSnowflakeDate(String(user.discordUser.id)),
            "R",
          ),
          "member.created_long": time(
            getSnowflakeDate(String(user.discordUser.id)),
            "F",
          ),
        }
      : {
          "member.id": "792842038332358656",
          "member.name": "Discohook Utils",
          "member.discriminator": "4333",
          "member.display_name": "Discohook Utils",
          "member.tag": "Discohook Utils#4333",
          "member.mention": "<@792842038332358656>",
          "member.avatar_url": "/discord-avatars/discohook-bot.webp",
          "member.default_avatar_url": cdn.defaultAvatar(4333 % 5),
          "member.bot": "True",
          "member.created": time(getSnowflakeDate("792842038332358656"), "d"),
          "member.created_relative": time(
            getSnowflakeDate("792842038332358656"),
            "R",
          ),
          "member.created_long": time(
            getSnowflakeDate("792842038332358656"),
            "F",
          ),
        }),
    "server.id": "668218342779256857",
    "server.name": "Discohook",
    "server.icon_url": "/discord-avatars/discohook.webp",
    "server.members": 17377,
    "server.roles": 34,
    "server.boosts": 2,
    "server.emoji_limit": 100,
    "server.sticker_limit": 15,
    "server.created": time(getSnowflakeDate("668218342779256857"), "d"),
    "server.created_relative": time(
      getSnowflakeDate("668218342779256857"),
      "R",
    ),
    "server.created_long": time(getSnowflakeDate("668218342779256857"), "F"),
    now: time(now, "d"),
    now_relative: time(now, "R"),
    now_long: time(now, "F"),
  };

  const [previewValue, setPreviewPath] = useReducer(
    (_: string, path: string) => {
      return placeholders[path].toString();
    },
    "",
  );

  const [indexData, setIndexData] = useState<Record<string, GuideFileMeta[]>>();
  const navigate = useNavigate();
  useEffect(() => {
    if (!indexData) {
      fetch("/guide-index.json", { method: "GET" }).then((response) => {
        if (response.ok)
          response
            .json()
            .then((data) => setIndexData(data as typeof indexData));
      });
    }
  }, [indexData]);

  return (
    <div>
      <Header user={user} />
      <Prose className="relative">
        <TabsWindow
          data={
            indexData
              ? Object.values(indexData["getting-started"]).map((file) => ({
                  label: file.title,
                  value: `getting-started/${file.file}`,
                }))
              : []
          }
          tab="getting-started/formatting"
          setTab={(tab) => navigate(`/guide/${tab}`)}
        >
          <p className="font-bold text-2xl mt-2">{t("howToFormat")}</p>
          <p>
            <Trans
              t={t}
              i18nKey="formatDescription"
              components={[<span className={codeStyle} />]}
            />
          </p>
          <details className="group mt-4">
            <FormatCategoryHeader>
              <img
                className="rounded-full my-auto h-6 w-6 ml-1 border border-gray-200 dark:border-primary-700"
                src={getCharacterAvatarUrl(characterAvatars[1])}
                alt=""
              />
              <img
                className="rounded-full my-auto h-6 w-6 -ml-2 border border-gray-200 dark:border-primary-700"
                src={getCharacterAvatarUrl(characterAvatars[6])}
                alt=""
              />
              <img
                className="rounded-full my-auto h-6 w-6 -ml-2 border border-gray-200 dark:border-primary-700"
                src={getCharacterAvatarUrl(characterAvatars[4])}
                alt=""
              />
              <p className="font-bold ltr:ml-2 rtl:mr-2">{t("members")}</p>
            </FormatCategoryHeader>
            <p>
              {t("formatMemberDescription")} {user && t("formatMemberYou")}
            </p>
            <hr className="border-gray-200/20 my-4" />
            <FormatCategoryBody
              t={t}
              paths={Object.keys(placeholders).filter((path) =>
                path.startsWith("member."),
              )}
              setPreviewPath={setPreviewPath}
            />
          </details>
          <details className="group mt-4">
            <FormatCategoryHeader>
              <img
                className="rounded-full my-auto h-6 w-6 ltr:ml-1 rtl:mr-1 border border-transparent"
                src={placeholders["server.icon_url"] as string}
                alt=""
              />
              <p className="font-bold ltr:ml-2 rtl:mr-2">{t("server_one")}</p>
            </FormatCategoryHeader>
            <p>{t("formatServerDescription")}</p>
            <hr className="border-gray-200/20 my-4" />
            <FormatCategoryBody
              t={t}
              paths={Object.keys(placeholders).filter((path) =>
                path.startsWith("server."),
              )}
              setPreviewPath={setPreviewPath}
            />
          </details>
          <details className="group mt-4">
            <FormatCategoryHeader>
              <p className="font-bold ltr:ml-1 rtl:mr-1">
                {t("miscellaneous")}
              </p>
            </FormatCategoryHeader>
            <FormatCategoryBody
              t={t}
              paths={Object.keys(placeholders).filter(
                (path) => !path.includes("."),
              )}
              setPreviewPath={setPreviewPath}
            />
          </details>
          <div>
            <div className="invisible p-4 mt-8">{previewValue}</div>
            <div className="bg-gray-200 dark:bg-gray-900 shadow rounded-lg p-4 fixed bottom-4 ltr:mr-8 rtl:ml-8">
              <Message
                message={{
                  content: previewValue || t("formatOptionsNone"),
                }}
                cache={cache}
                messageDisplay={settings.messageDisplay}
                compactAvatars={settings.compactAvatars}
              />
            </div>
          </div>
        </TabsWindow>
      </Prose>
    </div>
  );
}
