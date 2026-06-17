import {
  json,
  type MetaDescriptor,
  type MetaFunction,
  type SerializeFrom,
} from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import matter from "front-matter";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod/v3";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Markdown } from "~/components/preview/Markdown";
import { getUser } from "~/session.server";
import { useCache } from "~/util/cache/CacheManager";
import type { LoaderArgs } from "~/util/loader";
import { relativeTime } from "~/util/time";
import { zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { "*": path } = zxParseParams(params, {
    "*": z.string().regex(/^[\w/-]+$/),
  });

  const fileResponse = await context.env.ASSETS.fetch(
    `http://localhost/news-files/${path}.md`,
    { method: "GET" },
  );
  if (!fileResponse.ok) {
    throw json({ message: fileResponse.statusText }, fileResponse.status);
  }

  const raw = await fileResponse.text();
  const parsed = matter(raw);
  const zparsed = await z
    .object({
      title: z.string(),
      description: z.ostring(),
      color: z.onumber(),
      thumbnail: z.ostring(),
      category: z.ostring(),
      date: z.date(),
      author: z.string(),
    })
    .safeParseAsync(parsed.attributes);
  if (!zparsed.success) {
    throw json(
      { message: "Invalid article", issues: zparsed.error.format() },
      500,
    );
  }

  const slug = path.replace(/^.+\//, "");
  const file: GuideFile = {
    content: parsed.body,
    meta: { ...zparsed.data, file: slug, path },
  };

  const indexResponse = await context.env.ASSETS.fetch(
    "http://localhost/news-index.json",
    { method: "GET" },
  );
  let index: Record<string, GuideFileMeta[]> = {};
  if (indexResponse.ok) {
    index = await indexResponse.json();
  }
  const pathDirectories = path.split("/").slice(0, -1);
  const siblings =
    pathDirectories.length === 0
      ? index._index
      : (index[pathDirectories[0]] ?? []);

  const posts = siblings.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const thisIndex = posts.findIndex((p) => p.file === slug);

  const user = await getUser(request, context);
  return {
    user,
    file,
    previousPost: posts[thisIndex - 1],
    nextPost: posts[thisIndex + 1],
  };
};

interface GuideFile {
  content: string;
  meta: {
    file: string;
    path: string;
    title: string;
    date: Date;
    author: string;
    description?: string | undefined;
    color?: number | undefined;
    thumbnail?: string | undefined;
    category?: string | undefined;
  };
}

export type GuideFileMeta = GuideFile["meta"];

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const {
      file: { meta },
    } = data as SerializeFrom<typeof loader>;
    const tags: MetaDescriptor[] = [
      {
        title: `${meta.title} - Discohook`,
      },
      {
        property: "og:title",
        content: meta.title,
      },
      {
        property: "og:site_name",
        content: meta.category ?? "Discohook",
      },
      {
        name: "theme-color",
        content: meta.color ? `#${meta.color.toString(16)}` : "#58b9ff",
      },
    ];
    if (meta.description) {
      tags.push({
        property: "og:description",
        content: meta.description,
      });
    }
    if (meta.thumbnail) {
      tags.push({
        property: "og:image",
        content: meta.thumbnail,
      });
    }
    return tags;
  }
  return [];
};

// I'm aware of MDX but I didn't think it really fit my needs
export default function NewsPostPage() {
  const { t } = useTranslation();
  const { user, file, previousPost, nextPost } = useLoaderData<typeof loader>();
  const cache = useCache(!user);

  return (
    <div>
      <Header user={user} />
      <Prose>
        <div
          className="contents font-medium text-primary-600 dark:text-primary-230 dark:font-normal leading-[1.375] whitespace-pre-line"
          // @ts-expect-error
          style={{ "--font-size": "1rem" }}
        >
          <div>
            <Link
              to="/news"
              className={twJoin(
                "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                "rounded-lg border border-border-normal dark:border-border-normal-dark",
                "me-2 size-8 inline-flex align-bottom group transition-colors",
              )}
            >
              <CoolIcon
                icon="Folder"
                className="text-xl m-auto inline group-hover:hidden"
              />
              <CoolIcon
                icon="Folder_Open"
                className="text-xl m-auto hidden group-hover:inline"
              />
            </Link>
            <p className="text-2xl font-semibold inline">{file.meta.title}</p>
          </div>
          {file.meta.description ? <p>{file.meta.description}</p> : null}
          <div className="flex gap-x-2 mt-1.5 text-muted dark:text-muted-dark text-sm items-center">
            <div className="flex items-center gap-1.5">
              <div className="rounded-full size-3 bg-teal-400" />
              <p>{file.meta.author}</p>
            </div>
            <div className="w-px h-6 bg-border-normal dark:bg-border-normal-dark" />
            <p title={new Date(file.meta.date).toLocaleDateString()}>
              {relativeTime(new Date(file.meta.date), t)}
            </p>
          </div>
          <hr className="mt-2 mb-4 border-border-normal dark:border-border-normal-dark" />
          <Markdown
            content={file.content}
            features={{ extend: "full", maskedImageLinks: true }}
            cache={cache}
          />
          <hr className="my-4 border-border-normal dark:border-border-normal-dark" />
          <div className="flex items-center">
            {previousPost ? (
              <Link to={`/news/${previousPost.file}`} className="contents">
                <Button
                  className="me-auto"
                  discordstyle={ButtonStyle.Secondary}
                  contentContainerClassName="flex items-center"
                >
                  <CoolIcon
                    icon="Chevron_Left"
                    rtl="Chevron_Right"
                    className="me-1.5"
                  />
                  <div className="truncate max-w-40">
                    <p className="truncate">{previousPost.title}</p>
                  </div>
                </Button>
              </Link>
            ) : null}
            {nextPost ? (
              <Link to={`/news/${nextPost.file}`} className="contents">
                <Button
                  className="ms-auto"
                  discordstyle={ButtonStyle.Secondary}
                  contentContainerClassName="flex items-center"
                >
                  <div className="truncate max-w-40">
                    <p className="truncate">{nextPost.title}</p>
                  </div>
                  <CoolIcon
                    icon="Chevron_Right"
                    rtl="Chevron_Left"
                    className="ms-1.5"
                  />
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Prose>
    </div>
  );
}
