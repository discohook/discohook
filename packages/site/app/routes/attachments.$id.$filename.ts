import { REST } from "@discordjs/rest";
import { type APIMessage, Routes } from "discord-api-types/v10";
import z from "zod/v3";
import { getUserId } from "~/session.server";
import { eq, getDb, savedAttachments } from "~/store.server";
import {
  isDiscordAttachmentUrl,
  isDiscordError,
  parseAttachmentUrl,
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

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { id, filename } = zxParseParams(params, {
    id: snowflakeAsString(),
    filename: z.string(),
  });
  // const { ex, is, hm } = zxParseQuery(request, {
  //   ex: z.string(),
  //   is: z.string(),
  //   hm: z.string(),
  // });

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
  const attachment = await db.query.savedAttachments.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, id), eq(table.filename, filename)),
    columns: {
      url: true,
      // contentType: true,
      discordMessageId: true,
    },
  });
  if (!attachment) {
    throw Response.json({ message: "Unknown Attachment" }, { status: 404 });
  }

  if (isDiscordAttachmentUrl(attachment.url)) {
    const params = parseAttachmentUrl(attachment.url);
    if (
      !params.ex ||
      !params.is ||
      !params.hm ||
      params.ex.getTime() - Date.now() < 1000
    ) {
      // Less than 1 second away from expiring, or has insufficient
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

      const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
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
          throw Response.json(e.rawError, { status: e.status });
        }
        throw Response.json({ message: String(e) }, { status: 500 });
      }

      const foundAttachment = message.attachments?.find(
        (a) => a.id === String(id),
      );
      if (!foundAttachment) {
        throw Response.json(
          { message: `Attachment ${id} is not present on saved message ID` },
          { status: 404 },
        );
      }

      context.waitUntil(
        db
          .update(savedAttachments)
          .set({
            url: foundAttachment.url,
            contentType: foundAttachment.content_type,
            title: foundAttachment.title,
            description: foundAttachment.description,
          })
          .where(eq(savedAttachments.id, id))
          .catch(console.error),
      );
      return await fetch(foundAttachment.url, { method: "GET" });
    }
    // const rawParams = new URL(attachment.url).searchParams;
    // if (
    //   rawParams.get("ex") !== ex ||
    //   rawParams.get("is") !== is ||
    //   rawParams.get("hm") !== hm
    // ) {
    //   throw Response.json(
    //     { message: "Unmatched URL parameters" },
    //     { status: 400 },
    //   );
    // }
  }
  return await fetch(attachment.url, { method: "GET" });
};
