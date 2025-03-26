import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { backups, generateId, getDb, makeSnowflake } from "store";
import { z } from "zod";
import { getUser, getUserId } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { zxParseJson, zxParseQuery } from "~/util/zod";
import { findMessagesPreviewImageUrl } from "../util/backups";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
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

  const db = getDb(context.env.HYPERDRIVE);
  const results = await db.query.backups.findMany({
    where: (backups, { inArray }) => inArray(backups.id, ids),
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

// type MessageFile = File & { messageIndex: number };

export const action = async ({ request, context }: ActionFunctionArgs) => {
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

  const db = getDb(context.env.HYPERDRIVE);
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
