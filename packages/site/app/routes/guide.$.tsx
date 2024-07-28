import { useLoaderData, useNavigate } from "@remix-run/react";
import matter from "front-matter";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { Markdown } from "~/components/preview/Markdown";
import { TabsWindow } from "~/components/tabs";
import { FullscreenThrobber } from "~/root";
import { getUser } from "~/session.server";
import { useCache } from "~/util/cache/CacheManager";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";
import { meta as indexMeta } from "./guide._index";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { "*": path } = zxParseParams(params, {
    "*": z.string().regex(/^[\w\/-]+$/),
  });

  const user = await getUser(request, context);
  return { user, path };
};

// We've had to temporarily move this to the client (Jul 28 2024)
// https://github.com/cloudflare/workerd/issues/787
const readGuideFile = async (path: string, origin?: string) => {
  const file = path.replace(/^.+\//, "");
  const response = await fetch(`${origin ?? ""}/guide-files/${path}.md`, {
    method: "GET",
  });
  if (!response.ok) {
    throw Error(response.statusText);
  }

  const raw = await response.text();
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
    console.error(zparsed.error);
    throw Error(`Invalid file:\n${zparsed.error.format()}`);
  }

  return { content: parsed.body, meta: { ...zparsed.data, file, path } };
};

export type GuideFileMeta = Awaited<ReturnType<typeof readGuideFile>>["meta"];

export const meta = indexMeta;

// export const meta: MetaFunction = ({ data }) => {
//   if (data) {
//     const { meta } = data as SerializeFrom<typeof loader>;
//     const tags: MetaDescriptor[] = [
//       {
//         title: `${meta.title} - Discohook Guides`,
//       },
//       {
//         property: "og:title",
//         content: meta.title,
//       },
//       {
//         property: "og:site_name",
//         content: meta.category ?? "Discohook Guides",
//       },
//       {
//         name: "theme-color",
//         content: meta.color ? `#${meta.color.toString(16)}` : "#58b9ff",
//       },
//     ];
//     if (meta.description) {
//       tags.push({
//         property: "og:description",
//         content: meta.description,
//       });
//     }
//     if (meta.thumbnail) {
//       tags.push({
//         property: "og:image",
//         content: meta.thumbnail,
//       });
//     }
//     return tags;
//   }
//   return [];
// };

// I'm aware of MDX but I didn't think it really fit my needs
export default function GuidePage() {
  const { user, path } = useLoaderData<typeof loader>();
  const cache = useCache(!user);
  const [error, setError] = useError();

  const [indexData, setIndexData] = useState<Record<string, GuideFileMeta[]>>();
  const [response, setResponse] =
    useState<Awaited<ReturnType<typeof readGuideFile>>>();
  const navigate = useNavigate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only path. Avoid loop.
  useEffect(() => {
    readGuideFile(path)
      .then(setResponse)
      .catch((e) => setError({ message: String(e) }));
  }, [path]);

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
      {error}
      {response ? (
        <Prose>
          <TabsWindow
            data={Object.entries(indexData ?? {})
              .filter(([path]) => response.meta.path.startsWith(path))
              .flatMap(([path, files]) => {
                return files.map((file) => ({
                  label: file.title,
                  value: `${path}/${file.file}`,
                }));
              })}
            tab={response.meta.path}
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
                content={response.content}
                features={{ extend: "full", maskedImageLinks: true }}
                cache={cache}
              />
            </div>
          </TabsWindow>
        </Prose>
      ) : (
        <FullscreenThrobber />
      )}
    </div>
  );
}
