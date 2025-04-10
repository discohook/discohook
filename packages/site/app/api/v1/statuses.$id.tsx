// Discord assumes a specific API path for these Mastodon-style responses,
// which is why this is not under /link-backups/:id

// Thanks to https://wuff.gay for their work on 'abusing' this format for
// non-Mastodon sites (and, I think, https://rcombs.me for implementing the
// functionality in the first place)

import { json, redirect } from "@remix-run/cloudflare";
import { getDb } from "~/store.server";
import { LinkEmbedStrategy } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });

  const ua = request.headers.get("User-Agent");
  if (!ua || !ua.includes("Discordbot")) {
    throw redirect(`/link?backup=${id}`);
  }

  const db = getDb(context.env.HYPERDRIVE);
  const backup = await db.query.linkBackups.findFirst({
    where: (linkBackups, { eq }) => eq(linkBackups.id, id),
    columns: { id: true, code: true, data: true },
  });
  if (!backup) {
    throw json({ message: "No backup with that ID" }, 404);
  }
  if (backup.data.embed.data.strategy !== LinkEmbedStrategy.Mastodon) {
    throw json(
      { message: "This backup does not use this embed strategy" },
      400,
    );
  }

  const { data: embed, redirect_url } = backup.data.embed;
  const blankImage = `${context.env.CDN_ORIGIN}/transparent/1x1.png`;

  const url =
    redirect_url ??
    `${context.env.LINK_ORIGIN ?? `${new URL(request.url).origin}/link`}/${
      backup.code
    }`;

  let content = "";
  if (embed.description) {
    // TODO: convert to html
    content = embed.description;
    //   const output = markdownToHtmlable({ content: embed.description });
    //   content = ReactDOMServer.renderToStaticMarkup(<p>{output}</p>);
    //   console.log(content);
  }

  const payload: ActivityStatus = {
    id: String(backup.id),
    url,
    uri: url,
    created_at: embed.timestamp ?? "1970-01-01:00:00:00.000Z",
    edited_at: null,
    reblog: null,
    in_reply_to_account_id: null,
    language: "en",
    content,
    spoiler_text: "",
    visibility: "public",
    application: {
      name: "Discohook",
      website: null,
    },
    media_attachments: [],
    account: {
      id: "64565898",
      display_name: embed.author?.name ?? ".",
      username: "discohook",
      acct: "discohook",
      url: embed.author?.url ?? url,
      uri: embed.author?.url ?? url,
      created_at: "1970-01-01T00:00:00.000Z",
      locked: false,
      bot: false,
      discoverable: true,
      indexable: false,
      group: false,
      avatar: embed.author?.icon_url || blankImage,
      avatar_static: embed.author?.icon_url || blankImage,
      header: "",
      header_static: "",
      followers_count: 0,
      following_count: 0,
      statuses_count: 0,
      hide_collections: false,
      noindex: false,
      emojis: [],
      roles: [],
      fields: [],
    },
    mentions: [],
    tags: [],
    emojis: [],
    card: null,
    poll: null,
  };

  for (const image of embed.images ?? []) {
    payload.media_attachments.push({
      id: "114163769487684704",
      type: "image",
      url: image.url,
      remote_url: null,
      preview_url: null,
      preview_remote_url: null,
      text_url: null,
      description: null,
      meta: { original: { width: 0, height: 0 } },
    });
  }
  // TODO: create video thumbnails. Discord reads the image and errors if
  // the size is not correct.
  // if (embed.video?.url) {
  //   const youtubeMatch = embed.video.url
  //     ? getYoutubeVideoParameters(embed.video.url)
  //     : null;
  //   const vimeoMatch = embed.video.url
  //     ? getVimeoVideoParameters(embed.video.url)
  //     : null;
  //   // Discord errors when using the actual embedded players :(
  //   if (!youtubeMatch && !vimeoMatch) {
  //     const width = embed.video.width ?? 1280;
  //     const height = embed.video.height ?? 720;
  //     payload.media_attachments.push({
  //       id: "114163769487684704",
  //       type: "video",
  //       url: embed.video.url,
  //       remote_url: null,
  //       // Required to be an image of the correct size
  //       preview_url: null,
  //       preview_remote_url: null,
  //       text_url: null,
  //       description: null,
  //       meta: {
  //         original: {
  //           width,
  //           height,
  //           size: `${width}x${height}`,
  //           aspect: width / (height || 1),
  //         },
  //       },
  //     });
  //   }
  // }

  return payload;
};

// Mastodon API V1 Interfaces
export interface ActivityStatus {
  id: string;
  url: string;
  uri: string;
  created_at: string;
  edited_at: string | null;
  reblog: null;
  in_reply_to_id?: string | null;
  in_reply_to_account_id?: string | null;
  language?: string | null;
  content: string;
  spoiler_text: string;
  visibility: "public";
  application: {
    name: string | null;
    website: string | null;
  };
  media_attachments: ActivityMediaAttachment[];
  account: ActivityAccount;
  mentions: [];
  tags: [];
  emojis: [];
  card: null;
  poll: null;
}

export interface ActivityAccount {
  id: string;
  display_name: string;
  username: string;
  acct: string;
  url: string;
  uri: string;
  created_at: string;
  locked: boolean;
  bot: boolean;
  discoverable: boolean;
  indexable: boolean;
  group: boolean;
  avatar?: string;
  avatar_static?: string;
  header?: string;
  header_static?: string;
  followers_count?: number;
  following_count?: number;
  statuses_count?: number;
  hide_collections: boolean;
  noindex: boolean;
  emojis: [];
  roles: [];
  fields: [];
}

export interface ActivityMediaAttachment {
  id: string;
  type: "image" | "video" | "gifv" | "audio" | string;
  url: string;
  preview_url: string | null;
  remote_url: string | null;
  preview_remote_url: string | null;
  text_url: string | null;
  description: string | null;
  meta: {
    original?: {
      width: number;
      height: number;
      size?: string;
      aspect?: number;
    };
    small?: {
      width: number;
      height: number;
      size?: string;
      aspect?: number;
    };
  };
}
