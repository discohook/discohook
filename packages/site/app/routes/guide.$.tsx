import {
  type MetaDescriptor,
  type MetaFunction,
  type SerializeFrom,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import matter from "front-matter";
import { z } from "zod";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { Markdown } from "~/components/preview/Markdown";
import { TabsWindow } from "~/components/tabs";
import { getUser } from "~/session.server";
import { useCache } from "~/util/cache/CacheManager";
import type { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { "*": path } = zxParseParams(params, {
    "*": z.string().regex(/^[\w\/-]+$/),
  });

  const fileResponse = await context.env.ASSETS.fetch(
    `http://localhost/guide-files/${path}.md`,
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
    })
    .safeParseAsync(parsed.attributes);
  if (!zparsed.success) {
    throw json(
      { message: "Invalid file", issues: zparsed.error.format() },
      500,
    );
  }

  const file: GuideFile = {
    content: parsed.body,
    meta: { ...zparsed.data, file: path.replace(/^.+\//, ""), path },
  };

  const indexResponse = await context.env.ASSETS.fetch(
    "http://localhost/guide-index.json",
    { method: "GET" },
  );
  let index: Record<string, GuideFileMeta[]> = {};
  if (indexResponse.ok) {
    index = await indexResponse.json();
  }

  const user = await getUser(request, context);
  const pathDirectories = path.split("/").slice(0, -1);
  return {
    user,
    path: pathDirectories.join("/"),
    file,
    siblings:
      pathDirectories.length === 0 ? index._index : index[pathDirectories[0]],
  };
};

interface GuideFile {
  content: string;
  meta: {
    file: string;
    path: string;
    title: string;
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
        title: `${meta.title} - Discohook Guides`,
      },
      {
        property: "og:title",
        content: meta.title,
      },
      {
        property: "og:site_name",
        content: meta.category ?? "Discohook Guides",
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
export default function GuidePage() {
  const { user, path, file, siblings } = useLoaderData<typeof loader>();
  const cache = useCache(!user);
  const navigate = useNavigate();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <TabsWindow
          data={siblings.map((file) => ({
            label: file.title,
            value: `${path}/${file.file}`,
          }))}
          tab={file.meta.path}
          setTab={(tab) => navigate(`/guide/${tab}`)}
        >
          <div
            className="contents font-medium text-primary-600 dark:text-primary-230 dark:font-normal leading-[1.375] whitespace-pre-line"
            style={{
              // @ts-expect-error
              "--font-size": "1rem",
            }}
          >
            <Markdown
              content={file.content}
              features={{ extend: "full", maskedImageLinks: true }}
              cache={cache}
            />
          </div>
        </TabsWindow>
      </Prose>
    </div>
  );
}
