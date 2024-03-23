import { json } from "@remix-run/cloudflare";
import {
  APIEmbed,
  APIEmbedImage,
  APIEmbedVideo,
  EmbedType,
} from "discord-api-types/v10";
import he from "he";
import { z } from "zod";
import { getYoutubeVideoParameters } from "~/components/preview/Gallery";
import { LoaderArgs } from "~/util/loader";
import Scraper from "~/util/scraper";
import { jsonAsString, zxParseQuery } from "~/util/zod";
import { ZodOEmbedData } from "./oembed";

// Sorry this solution is pretty bad
export const META_HTML_REGEX =
  /<meta\s+((?:(\w+) ?= ?["']([^"']+)["']\s?){1,})\s*\/?>/gim;
export const HTML_ATTRIBUTE_REGEX = /(\w+) ?= ?["']([^"']+)["']/gim;

export const userAgent =
  "Discohook-Crawler/1.0.0 (+https://github.com/shayypy/discohook)";

const decode = (text: string) => {
  return he.decode(text).replace(/<br\/?>/gi, "\n");
};

// This is not a "full featured" meta parser by any means, but
// it covers our needs insofar as what we need to preview
interface MetaTags {
  og: {
    type?: string;
    // url?: string;
    siteName?: string;
    title?: string;
    description?: string;
    image?: APIEmbedImage[];
    video?: APIEmbedVideo;
  };
  twitter: {
    card?: string;
    title?: string;
    description?: string;
    image?: APIEmbedImage[];
    video?: APIEmbedVideo;
  };
  vanilla: {
    title?: string;
    description?: string;
    themeColor?: number;
  };
}

type ImageScope = "og" | "twitter";

// const scrapeMetaTag = async (scraper: Scraper, property: string) => {
//   let prop = await scraper
//     .querySelector(`meta[property="${property}"]`)
//     .getAttribute("content");
//   if (prop) return prop;

//   prop = await scraper
//     .querySelector(`meta[name="${property}"]`)
//     .getAttribute("content");
//   if (prop) return prop;

//   prop = await scraper
//     .querySelector(`meta[property="${property}"]`)
//     .getAttribute("value");
//   if (prop) return prop;

//   prop = await scraper
//     .querySelector(`meta[name="${property}"]`)
//     .getAttribute("value");
//   if (prop) return prop;
// };

const getMetaTags = (html: string) => {
  const matches = html.matchAll(META_HTML_REGEX);
  const tags: {
    property: string;
    content: string;
    extra: Record<string, string>;
  }[] = [];
  for (const wholeMatch of matches) {
    // Space-separated key-value pairs
    const body = wholeMatch[1];
    const bodyMatches = body.matchAll(HTML_ATTRIBUTE_REGEX);

    const pairs: Record<string, string> = {};
    for (const match of bodyMatches) {
      pairs[match[1]] = decode(match[2]);
    }
    if ((pairs.property || pairs.name) && (pairs.content || pairs.value)) {
      tags.push({
        property: pairs.property || pairs.name,
        content: pairs.content || pairs.value,
        extra: pairs,
      });
    }
  }
  return tags;
};

export const loader = async ({ request }: LoaderArgs) => {
  const { url: url_ } = zxParseQuery(request, { url: z.string().url() });

  /*
    Discord doesn't respect robots.txt at all, and is actually explicitly
    disallowed by Twitter. For the purpose of parity, we are temporarily
    disabling this functionality, but in the spirit of internet ethics, I
    think we may later choose to selectively re-enable it for less
    "prominent" sites.
  */
  // const robotsUrl = `${new URL(url_).origin}/robots.txt`;
  // const robotsResponse = await fetch(robotsUrl, {
  //   method: "GET",
  //   headers: {
  //     "User-Agent": userAgent,
  //   },
  //   cf: {
  //     cacheTtl: 7200,
  //     cacheEverything: true,
  //   },
  // });

  // // We might need to do this again after the "real" fetch in case of a redirect
  // if (robotsResponse.ok) {
  //   const robots = robotsParser(robotsUrl, await robotsResponse.text());
  //   if (robots.isDisallowed(url_, userAgent)) {
  //     throw json(
  //       { message: "Discohook is forbidden by this site's robots.txt" },
  //       400,
  //     );
  //   }
  //   // Discord doesn't actually seem to respect crawl delay
  //   // const delay = robots.getCrawlDelay(userAgent);
  //   // if (delay && delay <= 15) {
  //   //   await sleep(delay * 1000);
  //   // } else if (delay) {
  //   //   throw json(
  //   //     {
  //   //       message:
  //   //         "The delay requested by this site's robots.txt was too large.",
  //   //     },
  //   //     400,
  //   //   );
  //   // }
  // }

  const response = await fetch(url_, {
    method: "GET",
    headers: { "User-Agent": userAgent },
    redirect: "follow",
    cf: { cacheTtl: 7200, cacheEverything: true },
  });
  // This may be different because of a redirect. We want to keep the
  // canonical URL for the special cases below.
  const url = response.url;

  if (!response.ok) {
    throw json({ message: "Received a bad response from the URL" }, 400);
  }
  const contentType = response.headers.get("Content-Type");
  if (contentType && !["text/html"].includes(contentType.split(";")[0])) {
    throw json(
      { message: "Non-HTML content types are currently not supported" },
      400,
    );
  }

  const scraperResponse = response.clone();
  const scraper = new Scraper().fromResponse(scraperResponse);

  const text = await response.text();
  const tags = getMetaTags(text);

  const meta: MetaTags = {
    og: {},
    twitter: {},
    vanilla: {},
  };

  for (const match of tags) {
    const { property, content } = match;

    const [scope_] = property.split(":");
    let scope: keyof MetaTags;
    if (["og", "twitter"].includes(scope_)) {
      scope = scope_ as keyof MetaTags;
    } else {
      scope = "vanilla";
    }

    switch (property) {
      case "og:title":
      case "twitter:title":
        meta[scope].title = decode(content).slice(0, 256);
        break;
      case "description":
      case "og:description":
      case "twitter:description":
        meta[scope].description = decode(content).slice(0, 4096);
        break;
      case "twitter:card":
        meta.twitter.card = content;
        break;
      case "og:image":
      case "og:image:url":
      case "og:image:secure_url":
      case "twitter:image": {
        try {
          new URL(content);
        } catch {
          break;
        }
        const m = meta[scope as ImageScope];
        m.image = m.image ?? [];
        m.image.push({ url: content });
        break;
      }
      case "og:image:height": {
        const height = Number(content);
        const m = meta[scope as ImageScope];
        m.image = m.image ?? [];
        const lastImage = m.image[m.image.length - 1];
        if (lastImage && !Number.isNaN(height)) {
          lastImage.height = height;
        }
        break;
      }
      case "og:image:width": {
        const width = Number(content);
        const m = meta[scope as ImageScope];
        m.image = m.image ?? [];
        const lastImage = m.image[m.image.length - 1];
        if (lastImage && !Number.isNaN(width)) {
          lastImage.width = width;
        }
        break;
      }
      case "og:video":
      case "og:video:url":
      case "og:video:secure_url":
      case "twitter:player:stream": {
        try {
          new URL(content);
        } catch {
          break;
        }
        const m = meta[scope as ImageScope];
        m.video = { url: content };
        break;
      }
      case "og:video:height":
      case "twitter:player:height": {
        const height = Number(content);
        const m = meta[scope as ImageScope];
        if (!m.video) break;

        m.video.height = height;
        break;
      }
      case "og:video:width":
      case "twitter:player:width": {
        const width = Number(content);
        const m = meta[scope as ImageScope];
        if (!m.video) break;

        m.video.width = width;
        break;
      }
      case "og:site_name":
        meta.og.siteName = decode(content);
        break;
      case "theme-color": {
        // Doesn't support standard CSS colors
        const color = parseInt(content.replace(/^#/, ""), 16);
        if (!Number.isNaN(color)) {
          meta.vanilla.themeColor = color;
        }
        break;
      }
      default:
        break;
    }
  }

  // Some sites get special treatment by Discord
  const edgeData: APIEmbed = {};
  const u = new URL(url);
  switch (u.host) {
    case "www.xkcd.com":
    case "xkcd.com": {
      // Only the homepage or a comic page
      if (!/^https?:\/\/(www\.)?xkcd\.com(\/\d+)?/.test(url)) break;

      const caption = await scraper
        .querySelector("#comic>img")
        .getAttribute("title");
      if (caption) {
        edgeData.footer = { text: decode(caption).slice(0, 2048) };
      }
      edgeData.title = `xkcd: ${meta.og.title}`;
      edgeData.provider = undefined;
      break;
    }
    case "www.youtube.com":
    case "youtube.com": {
      const match = getYoutubeVideoParameters(url);
      if (match) {
        edgeData.color = 16711680;
        edgeData.video = {
          url: `https://www.youtube.com/embed/${match.id}`,
          width: 1280,
          height: 720,
        };
      }
      break;
    }
    case "news.ycombinator.com": {
      const timestamp = await scraper
        .querySelector("span.age")
        .getAttribute("title");
      const date = new Date(timestamp);
      if (!Number.isNaN(date)) {
        edgeData.timestamp = date.toISOString();
      }
      const user = await scraper.querySelector("a.hnuser").getText();
      if (user) {
        edgeData.author = { name: user };
      }
      const title = await scraper.querySelector("span.titleline>a").getText();
      if (title) {
        edgeData.title = title;
      }
      edgeData.color = 16737792;
      edgeData.footer = {
        text: "Hacker News",
        icon_url: "https://news.ycombinator.com/y18.svg",
      };
      break;
    }
    case "www.tenor.com":
    case "tenor.com": {
      if (!u.pathname.startsWith("/view")) break;

      edgeData.type = EmbedType.GIFV;
      edgeData.title = undefined;
      edgeData.description = undefined;
      edgeData.provider = {
        name: "Tenor",
        url: "https://tenor.co",
      };

      break;
    }
    case "www.twitter.com":
    case "twitter.com":
    case "www.x.com":
    case "x.com":
      edgeData.color = 4957685;
      break;
    default:
      break;
  }

  // I don't think Discord supports the `Link` header
  // discovery method, so we don't either
  const oembedUrl = await scraper
    // Unsure if Discord supports XML-formatted oEmbed, but we aren't going to for now
    .querySelector('link[type="application/json+oembed"]')
    .getAttribute("href", { last: true });

  let oembed: z.infer<typeof ZodOEmbedData> | undefined;
  if (oembedUrl) {
    const oResponse = await fetch(oembedUrl, {
      method: "GET",
      headers: { "User-Agent": userAgent },
      cf: { cacheTtl: 7200, cacheEverything: true },
    });
    if (oResponse.ok) {
      const oData = await oResponse.text();
      const parsed = await jsonAsString(ZodOEmbedData).safeParseAsync(oData);
      if (parsed.success) {
        oembed = parsed.data;
      }
    }
  }

  const images = meta.twitter.image ?? meta.og.image ?? [];
  const embeds: APIEmbed[] = [
    {
      type: EmbedType.Rich,
      url: url_,
      provider: oembed?.provider_name
        ? { name: oembed.provider_name, url: oembed.provider_url }
        : meta.og.siteName
          ? { name: meta.og.siteName }
          : undefined,
      author: oembed?.author_name
        ? { name: oembed.author_name, url: oembed.author_url }
        : undefined,
      title: meta.twitter.title ?? meta.og.title ?? meta.vanilla.title,
      color: meta.vanilla.themeColor,
      description:
        meta.twitter.description ??
        meta.og.description ??
        meta.vanilla.description,
      thumbnail:
        (images.length !== 0 || oembed?.thumbnail_url) &&
        meta.twitter.card !== "summary_large_image"
          ? oembed?.thumbnail_url
            ? {
                url: oembed.thumbnail_url,
                height: oembed.thumbnail_height,
                width: oembed.thumbnail_width,
              }
            : images[0]
          : undefined,
      image:
        images.length !== 0 && meta.twitter.card === "summary_large_image"
          ? images[0]
          : undefined,
      video: meta.twitter.video ?? meta.og.video,
      ...edgeData,
    },
  ];

  if (Object.values(embeds[0]).filter((v) => v !== undefined).length === 2) {
    return json({ embeds: [] });
  }

  if (meta.twitter.card === "summary_large_image") {
    for (const image of images.slice(1, 4)) {
      embeds.push({ type: EmbedType.Image, url: url_, image });
    }
  }

  return json({ embeds });
};
