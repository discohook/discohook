import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getUserId } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { jsonAsString, zxParseForm, zxParseQuery } from "~/util/zod";
import { QueryData, backups, getDb, inArray } from "../../store.server";

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

  const db = getDb(context.env.DATABASE_URL);
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

export const action = async ({ request, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);
  const { name, data } = await zxParseForm(request, {
    name: z.string().refine((val) => val.length <= 100),
    data: jsonAsString(ZodQueryData),
  });

  const db = getDb(context.env.DATABASE_URL);
  return (
    await db
      .insert(backups)
      .values({
        name,
        data,
        dataVersion: data.version ?? "d2",
        ownerId: userId,
        previewImageUrl: findMessagesPreviewImageUrl(data.messages),
      })
      .returning({
        id: backups.id,
        name: backups.name,
        dataVersion: backups.dataVersion,
      })
  )[0];
};
