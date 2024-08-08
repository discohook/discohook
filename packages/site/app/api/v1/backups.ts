import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getUser, getUserId } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { zxParseJson, zxParseQuery } from "~/util/zod";
import {
  QueryData,
  backups,
  generateId,
  getDb,
  inArray,
  makeSnowflake,
} from "../../store.server";

export const loader = async ({ request, context }: LoaderArgs) => {
  const userId = await getUserId(request, context, true);
  const { ids } = zxParseQuery(request, {
    ids: z
      .string()
      .refine(
        (v) =>
          v
            .split(",")
            .map(Number)
            .filter((n) => !Number.isNaN(n)).length > 0,
      )
      .transform((v) => v.split(",").map(BigInt)),
  });

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const results = await db.query.backups.findMany({
    where: inArray(backups.id, ids),
    columns: {
      id: true,
      name: true,
      data: true,
      ownerId: true,
      scheduled: true,
      cron: true,
      timezone: true,
    },
  });
  if (
    results.length < ids.length ||
    results.filter((r) => r.ownerId !== userId).length !== 0
  ) {
    throw json(
      { message: "Some IDs were not found or are not owned by you." },
      404,
    );
  }

  return results;
};

export const findMessagesPreviewImageUrl = (
  messages: QueryData["messages"],
) => {
  // Work out the optimal preview image (for the /me page). Order of priority
  // is messages[0].embeds[0] thumbnail, image, author, footer, then embeds[1],
  // then messages[1], ...
  let previewImageUrl: string | null = null;
  for (const message of messages) {
    const candidates = {
      thumbnail: [] as string[],
      image: [] as string[],
      author: [] as string[],
      footer: [] as string[],
    };
    for (const embed of message.data.embeds ?? []) {
      if (embed.thumbnail?.url) candidates.thumbnail.push(embed.thumbnail.url);
      if (embed.image?.url) candidates.image.push(embed.image.url);
      if (embed.author?.icon_url) candidates.author.push(embed.author.icon_url);
      if (embed.footer?.icon_url) candidates.footer.push(embed.footer.icon_url);
    }
    previewImageUrl =
      candidates.thumbnail[0] ??
      candidates.image[0] ??
      candidates.author[0] ??
      candidates.footer[0];
    if (previewImageUrl) break;
  }
  return previewImageUrl;
};

type MessageFile = File & { messageIndex: number };

export const action = async ({ request, context }: ActionArgs) => {
  const contentLength = Number(request.headers.get("Content-Length"));
  if (!contentLength || Number.isNaN(contentLength)) {
    throw json({ message: "Must provide Content-Length header." }, 400);
  }

  const { name, data } = await zxParseJson(request, {
    name: z.string().max(100),
    data: ZodQueryData,
  });
  const backupId = generateId();

  // 100 MiB per message
  const byteLimit = data.messages.length * 104_857_600;
  if (contentLength > byteLimit) {
    throw json({
      message: "Data is too large (max. (100 * message_count) MiB).",
    });
  }

  const user = await getUser(request, context, true);
  // const premium = userIsPremium(user);
  // if (premium) {
  //   const files: MessageFile[] = [];
  //   Array(data.messages.length)
  //     .fill(undefined)
  //     .forEach((_, i) => {
  //       Array(10)
  //         .fill(undefined)
  //         .forEach((_, fi) => {
  //           const file = formData.get(`data.messages[${i}].files[${fi}]`);
  //           if (file instanceof File) {
  //             const f = file as MessageFile;
  //             f.messageIndex = i;
  //             files.push(f);
  //           }
  //         });
  //     });
  //   console.log(files);

  //   const uploadData: {
  //     filename: string;
  //     url: string;
  //   }[] = [];
  //   for (const file of files) {
  //     const uploaded = await context.env.CDN.upload(
  //       file,
  //       `attachments/${backupId}`,
  //     );
  //     uploadData.push(uploaded);
  //   }
  //   console.log(uploadData);
  // }

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  return (
    await db
      .insert(backups)
      .values({
        id: makeSnowflake(backupId),
        name,
        data,
        dataVersion: data.version ?? "d2",
        ownerId: user.id,
        previewImageUrl: findMessagesPreviewImageUrl(data.messages),
      })
      .returning({
        id: backups.id,
        name: backups.name,
        previewImageUrl: backups.previewImageUrl,
        importedFromOrg: backups.importedFromOrg,
        scheduled: backups.scheduled,
        nextRunAt: backups.nextRunAt,
        cron: backups.cron,
        timezone: backups.timezone,
      })
  )[0];
};
