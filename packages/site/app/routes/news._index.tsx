import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Header } from "~/components/Header";
import { PreviewActionRow } from "~/components/preview/ActionRow";
import { linkClassName } from "~/components/preview/Markdown";
import { Prose } from "~/components/Prose";
import { getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import type { GuideFileMeta } from "./news.$slug";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);

  const indexResponse = await context.env.ASSETS.fetch(
    "http://localhost/news-index.json",
    { method: "GET" },
  );
  let index: Record<string, GuideFileMeta[]> = {};
  if (indexResponse.ok) {
    index = await indexResponse.json();
  }

  return {
    user,
    posts: index._index.sort((a, b) => {
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      return bd - ad;
    }),
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Discohook News" },
    {
      property: "og:title",
      content: "News",
    },
    {
      property: "og:site_name",
      content: "Discohook",
    },
    {
      name: "theme-color",
      content: "#58b9ff",
    },
  ];
};

export default () => {
  const { t } = useTranslation();
  const { user, posts } = useLoaderData<typeof loader>();
  const origin = useMemo(() => {
    try {
      return window.origin;
    } catch {
      return "http://localhost";
    }
  }, []);

  return (
    <div>
      <Header user={user} />
      <Prose>
        <p className="text-2xl font-bold">{t("discohookNews")}</p>
        <p>
          <Trans
            t={t}
            i18nKey="newsSubtitle"
            components={{
              anchor: <Link to="/discord" className={linkClassName} />,
            }}
          />
        </p>
        <div className="mt-1">
          <PreviewActionRow
            component={{
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  emoji: {
                    id: "1502729599551799347",
                    name: "bsky",
                  },
                  label: "Bluesky",
                  url: "https://bsky.app/profile/discohook.app",
                },
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  emoji: {
                    id: "1502729574080053328",
                    name: "rss",
                  },
                  label: "RSS",
                  url: `${origin}/news.rss`,
                },
              ],
            }}
          />
        </div>
        <hr className="my-4 border border-gray-100/10 rounded" />
        <div className="space-y-1.5">
          {posts.map((file) => (
            <Link
              key={`file-${file.file}`}
              className={twJoin(
                "block rounded-lg px-4 py-2 border transition-all",
                "bg-gray-50 dark:bg-gray-800 border-[#DFDFE1] dark:border-[#424349] hover:border-[#D2D2D5] dark:hover:border-[#626369]",
                "hover:bg-white hover:dark:bg-gray-700",
              )}
              to={`/news/${file.file}`}
            >
              <p className="font-semibold text-lg">
                {file.title}
                <span className="font-medium">: {file.description}</span>
              </p>
              <p>
                <span className="text-muted dark:text-muted-dark">
                  {new Date(file.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="ms-1">by {file.author}</span>
                {/* <span className="ms-2 text-sm">#changelogs</span> */}
              </p>
            </Link>
          ))}
        </div>
      </Prose>
    </div>
  );
};
