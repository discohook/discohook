import {
  MetaDescriptor,
  MetaFunction,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { getEmbedText } from "~/components/editor/LinkEmbedEditor";
import { Embed } from "~/components/preview/Embed";
import { getYoutubeVideoParameters } from "~/components/preview/Gallery";
import { getDb, linkBackups } from "~/store.server";
import { LinkQueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { copyText } from "~/util/text";
import { ZodOEmbedData } from "../api/v1/oembed";
import { linkEmbedToAPIEmbed } from "./link";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { code } = zx.parseParams(params, {
    code: z.string(),
  });

  const db = getDb(context.env.DATABASE_URL);
  const linkBackup = await db.query.linkBackups.findFirst({
    where: eq(linkBackups.code, code),
    columns: {
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
    !request.headers.get("User-Agent")?.includes("Discord")
  ) {
    return redirect(data.embed.redirect_url);
  }
  return { data: data.embed, origin };
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { data: embed } = (data as SerializeFrom<typeof loader>).data;
    const tags: MetaDescriptor[] = [
      {
        title: `${getEmbedText(embed) || "Custom link embed"} - Discohook`,
      },
    ];

    // Open Graph/Twitter tags
    if (embed.title) {
      tags.push({
        property: "og:title",
        content: embed.title,
      });
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
        content: `#${embed.color.toString(16)}`,
      });
    }

    const youtubeMatch = embed.video?.url
      ? getYoutubeVideoParameters(embed.video?.url)
      : null;
    if (embed.video?.url) {
      tags.push(
        {
          name: "twitter:card",
          content: "player",
        },
        {
          property: "og:video",
          content: youtubeMatch
            ? `https://www.youtube.com/embed/${youtubeMatch.id}`
            : embed.video.url,
        },
        {
          property: "og:video:secure_url",
          content: youtubeMatch
            ? `https://www.youtube.com/embed/${youtubeMatch.id}`
            : embed.video.url,
        },
        {
          property: "og:video:width",
          content: "1280",
        },
        {
          property: "og:video:height",
          content: "720",
        },
        ...(youtubeMatch
          ? [
              {
                property: "og:image",
                content: `https://img.youtube.com/vi/${youtubeMatch.id}/0.jpg`,
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
        href: `${(data as SerializeFrom<typeof loader>).origin}${apiUrl(
          BRoutes.oembed(),
        )}?${new URLSearchParams({
          data: JSON.stringify(oembed),
        })}`,
        type: "application/json+oembed",
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
