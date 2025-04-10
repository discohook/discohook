import {
  MetaDescriptor,
  MetaFunction,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { z } from "zod";
import { BRoutes, apiUrl } from "~/api/routing";
import type { ZodOEmbedData } from "~/api/v1/oembed";
import { Button } from "~/components/Button";
import { decimalToHex } from "~/components/editor/ColorPicker";
import { getEmbedText } from "~/components/editor/LinkEmbedEditor";
import { Embed } from "~/components/preview/Embed";
import {
  getVimeoVideoParameters,
  getYoutubeVideoParameters,
} from "~/components/preview/Gallery";
import { getDb } from "~/store.server";
import { LinkEmbedStrategy, LinkQueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { copyText } from "~/util/text";
import { zxParseParams } from "~/util/zod";
import { linkEmbedToAPIEmbed } from "./link";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { code } = zxParseParams(params, {
    code: z.string(),
  });

  const db = getDb(context.env.HYPERDRIVE);
  const linkBackup = await db.query.linkBackups.findFirst({
    where: (linkBackups, { eq }) => eq(linkBackups.code, code),
    columns: {
      id: true,
      data: true,
    },
  });

  if (!linkBackup) {
    throw json({ message: "Unknown link embed code." }, 404);
  }

  // Why doesn't the `location` passed to `meta` include data
  // for the entire URL? I've never understood this
  const origin = new URL(request.url).origin;

  const data: LinkQueryData = linkBackup.data;
  if (
    data.embed.redirect_url &&
    !request.headers.get("User-Agent")?.includes("Discordbot")
  ) {
    return redirect(data.embed.redirect_url);
  }
  return {
    data: data.embed,
    backup_id:
      data.embed.data.strategy === LinkEmbedStrategy.Mastodon
        ? linkBackup.id
        : undefined,
    origin,
    code,
  };
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const {
      data: { data: embed, redirect_url },
      backup_id,
      origin,
      code,
    } = data as SerializeFrom<typeof loader>;
    const strategy = embed.strategy ?? LinkEmbedStrategy.Link;

    const tags: MetaDescriptor[] = [
      { title: `${getEmbedText(embed) || "Custom link embed"} - Discohook` },
      {
        tagName: "link",
        rel: "canonical",
        href: redirect_url ?? `${origin}/link/${code}`,
      },
      { property: "og:url", content: redirect_url ?? `${origin}/link/${code}` },
    ];

    // Open Graph/Twitter tags
    if (strategy === LinkEmbedStrategy.Mastodon) {
      if (embed.author?.name) {
        tags.push(
          { property: "twitter:title", content: embed.author.name },
          { property: "og:title", content: embed.author.name },
        );
      }
      // Goes in the footer for mastodon
      if (embed.provider?.name) {
        tags.push({
          property: "og:site_name",
          content: embed.provider.name,
        });
      }
      if (embed.provider?.icon_url) {
        tags.push({
          tagName: "link",
          href: embed.provider.icon_url,
          rel: "icon",
          // ¯\_(ツ)_/¯ ?
          // sizes: "64x64",
          // type: "image/png",
        });
      }
    } else if (strategy === LinkEmbedStrategy.Link) {
      if (embed.title) {
        tags.push({ property: "og:title", content: embed.title });
      }
    }

    if (embed.description) {
      tags.push({
        property: "og:description",
        content: embed.description,
      });
    }
    if (embed.color != null) {
      tags.push({
        name: "theme-color",
        content: decimalToHex(embed.color),
      });
    }

    if (embed.video?.url) {
      const youtubeMatch = embed.video?.url
        ? getYoutubeVideoParameters(embed.video.url)
        : null;
      const vimeoMatch = embed.video?.url
        ? getVimeoVideoParameters(embed.video.url)
        : null;
      const videoUrl = youtubeMatch
        ? `https://www.youtube.com/embed/${youtubeMatch.id}`
        : vimeoMatch
          ? `https://player.vimeo.com/video/${vimeoMatch.id}`
          : embed.video.url;
      tags.push(
        { name: "twitter:card", content: "player" },
        { property: "og:video", content: videoUrl },
        { property: "og:video:secure_url", content: videoUrl },
        { property: "og:video:width", content: embed.video.width ?? "1280" },
        { property: "og:video:height", content: embed.video.height ?? "720" },
        ...(youtubeMatch
          ? [
              {
                property: "og:image",
                content: `https://img.youtube.com/vi/${youtubeMatch.id}/0.jpg`,
              },
            ]
          : vimeoMatch
            ? [
                {
                  property: "og:image",
                  // Unsure if this service is reliable
                  content: `https://vumbnail.com/${vimeoMatch.id}_large.jpg`,
                },
              ]
            : []),
      );
    } else if (embed.large_images) {
      tags.push({
        name: "twitter:card",
        content: "summary_large_image",
      });
    }

    // Add these after the Youtube thumbnail
    if (embed.images) {
      tags.push(
        ...embed.images.map((img) => ({
          property: "og:image",
          content: img.url,
        })),
      );
    }

    // oEmbed
    const oembed: z.infer<typeof ZodOEmbedData> = {
      type: "link",
      version: "1.0",
    };
    if (embed.provider) {
      oembed.provider_name = embed.provider.name;
      oembed.provider_url = embed.provider.url;
    }
    if (embed.author) {
      oembed.author_name = embed.author.name;
      oembed.author_url = embed.author.url;
    }
    if (Object.keys(oembed).length > 2) {
      tags.push({
        tagName: "link",
        rel: "alternate",
        href: `${origin}${apiUrl(BRoutes.oembed())}?${new URLSearchParams({
          data: JSON.stringify(oembed),
        })}`,
        type: "application/json+oembed",
      });
    }

    // Activity Streams (reformats the data to mimic a mastodon status)
    if (backup_id !== undefined && strategy === LinkEmbedStrategy.Mastodon) {
      tags.push({
        tagName: "link",
        rel: "alternate",
        // Not actually visited by Discord; they parse out
        // the ID and go to /api/v1/statuses/$id
        href: `${origin}/users/link-embeds/statuses/${backup_id}`,
        type: "application/activity+json",
      });
    }

    return tags;
  }
  return [];
};

export default function LinkCodePage() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen">
      <div className="max-w-4xl m-auto p-4 text-lg">
        <Embed {...linkEmbedToAPIEmbed(data.data)} />
        <Button
          className="mt-1"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => {
            copyText(location.href);
          }}
        >
          Copy Link
        </Button>
      </div>
    </div>
  );
}
