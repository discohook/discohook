import { Feed } from "feed";
import z from "zod/v3";
import type { LoaderArgs } from "~/util/loader";
import { zxParseQuery } from "~/util/zod";
import type { GuideFileMeta } from "./news.$";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { format } = zxParseQuery(request, {
    format: z
      .union([z.literal("rss"), z.literal("json"), z.literal("atom")])
      .default("rss"),
  });
  const { origin } = new URL(request.url);

  const indexResponse = await context.env.ASSETS.fetch(
    "http://localhost/news-index.json",
    { method: "GET" },
  );
  let index: Record<string, GuideFileMeta[]> = {};
  if (indexResponse.ok) {
    index = await indexResponse.json();
  }

  const posts = index._index.sort((a, b) => {
    const ad = new Date(a.date).getTime();
    const bd = new Date(b.date).getTime();
    return bd - ad;
  });
  const feed = new Feed({
    title: "Discohook News",
    link: `${origin}/news`,
    language: "en",
    image: `${origin}/logos/discohook_512w.png`,
    favicon: `${origin}/favicon.ico`,
    updated: posts.length ? new Date(posts[0].date) : undefined,
    feedLinks: {
      rss: `${origin}/news.rss`,
      json: `${origin}/news.rss?format=json`,
      atom: `${origin}/news.rss?format=atom`,
    },
  });
  for (const post of posts) {
    feed.addItem({
      id: post.file,
      title: post.title,
      link: `${origin}/news/${post.file}`,
      description: post.description,
      author: [{ name: post.author }],
      date: new Date(post.date),
      image: post.thumbnail,
    });
  }

  switch (format) {
    case "rss":
      return new Response(feed.rss2(), {
        headers: { "Content-Type": "application/xml" },
      });
    case "json":
      // already stringified, don't bother parsing just to re-stringify
      return new Response(feed.json1(), {
        headers: { "Content-Type": "application/json" },
      });
    case "atom":
      return new Response(feed.atom1(), {
        headers: { "Content-Type": "application/xml" },
      });
    default:
      break;
  }
  throw Response.json({ message: "Unsupported format" }, { status: 400 });
};
