import { REST } from "@discordjs/rest";
import { type APIMessage, Routes } from "discord-api-types/v10";
import z from "zod/v3";
import { getUserId } from "~/session.server";
import { eq, getDb, savedAttachments } from "~/store.server";
import type { RESTPostAPIRefreshAttachmentURLs } from "~/types/discord";
import {
  injectErrorContext,
  isDiscordAttachmentUrl,
  isDiscordError,
  parseAttachmentUrl,
  routePermissions,
} from "~/util/discord";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

const rootDomainsMatch = (a: string, b: string): boolean => {
  try {
    const aHost = new URL(a).hostname.toLowerCase();
    const bHost = new URL(b).hostname.toLowerCase();
    // Will not properly support 2LDs such as co.uk
    const aRoot = aHost.split(".").slice(-2).join(".");
    const bRoot = bHost.split(".").slice(-2).join(".");
    return aRoot === bRoot;
  } catch {
    // Probably invalid URL
    return false;
  }
};

interface PartialAttachment {
  id: bigint;
  filename?: string;
  url: string;
  title?: string | null;
  description?: string | null;
  contentType: string;
  discordMessageId?: bigint | null;
}

const refreshAttachmentUrl = async (
  rest: REST,
  attachment: PartialAttachment,
): Promise<{ refreshed: boolean; attachment: PartialAttachment }> => {
  const params = parseAttachmentUrl(attachment.url);
  if (
    !params.ex ||
    !params.is ||
    !params.hm ||
    params.ex.getTime() - Date.now() < 2000
  ) {
    // This endpoint is undocumented, but it's very useful for us. It would
    // be silly to stake this whole functionality on it so we have a fallback
    // to just fetching the message on its own (which is how this was originally
    // designed)
    // One caveat is that in this route, we can't refresh the rest of the attachment
    // metadata, so our record might become stale.
    try {
      const allRefreshed = (await rest.post("/attachments/refresh-urls", {
        body: { attachment_urls: [attachment.url] },
      })) as RESTPostAPIRefreshAttachmentURLs;
      const newAttachment = allRefreshed.refreshed_urls[0];
      return {
        refreshed: newAttachment.refreshed !== newAttachment.original,
        attachment: { ...attachment, url: newAttachment.refreshed },
      };
    } catch (e) {
      if (!isDiscordError(e)) throw e;
    }

    // Less than 2 seconds away from expiring, or has insufficient
    // parameters saved.
    if (attachment.discordMessageId === undefined) {
      throw Response.json(
        {
          message:
            "Cannot refresh attachment because original message ID is not known",
        },
        { status: 404 },
      );
    }

    let message: APIMessage;
    try {
      message = (await rest.get(
        Routes.channelMessage(
          params.channelId,
          String(attachment.discordMessageId),
        ),
      )) as APIMessage;
    } catch (e) {
      if (isDiscordError(e)) {
        throw Response.json(
          injectErrorContext(e.rawError, {
            channelId: params.channelId,
            permissions: routePermissions.GET.channelMessage,
          }),
          { status: e.status },
        );
      }
      throw Response.json({ message: String(e) }, { status: 500 });
    }

    const foundAttachment = message.attachments?.find(
      (a) => a.id === String(attachment.id),
    );
    if (!foundAttachment) {
      throw Response.json(
        {
          message: `Attachment ${attachment.id} is not present on saved message ID`,
        },
        { status: 404 },
      );
    }
    return {
      refreshed: true,
      attachment: {
        ...attachment,
        id: BigInt(foundAttachment.id),
        contentType: foundAttachment.content_type ?? attachment.contentType,
        title: foundAttachment.title,
        description: foundAttachment.description,
        url: foundAttachment.url,
      },
    };
  }
  return { refreshed: false, attachment };
};

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { id, filename } = zxParseParams(params, {
    id: snowflakeAsString(),
    filename: z.string(),
  });

  const reqRefer = request.headers.get("Referer");
  if (
    // require embedding to occur only on the site
    ((!reqRefer || !rootDomainsMatch(request.url, reqRefer)) &&
      // ignore referer rule on dev
      context.env.ENVIRONMENT !== "dev") ||
    // reject discord altogether, although their media proxy does not
    // actually use the bot UA
    request.headers
      .get("User-Agent")
      ?.includes("Discord")
  ) {
    throw Response.json(
      { message: "Request must originate from Discohook" },
      { status: 403 },
    );
  }
  // Extra layer of anti abuse
  await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  const dbAttachment = await db.query.savedAttachments.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, id), eq(table.filename, filename)),
    columns: {
      url: true,
      contentType: true,
      discordMessageId: true,
    },
  });
  if (!dbAttachment) {
    throw Response.json({ message: "Unknown Attachment" }, { status: 404 });
  }

  if (isDiscordAttachmentUrl(dbAttachment.url)) {
    const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
    const { refreshed, attachment: newAttachment } = await refreshAttachmentUrl(
      rest,
      { ...dbAttachment, id },
    );

    if (refreshed) {
      context.waitUntil(
        db
          .update(savedAttachments)
          .set({
            url: newAttachment.url,
            contentType: newAttachment.contentType,
            title: newAttachment.title,
            description: newAttachment.description,
            filename: newAttachment.filename,
          })
          .where(eq(savedAttachments.id, id))
          .catch(console.error),
      );
    }
    return await fetch(newAttachment.url, { method: "GET" });
  }
  return await fetch(dbAttachment.url, { method: "GET" });
};
