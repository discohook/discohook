import { z } from "zod";
import { getUser } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { ActionArgs } from "~/util/loader";
import { jsonAsString, zxParseForm } from "~/util/zod";
import { QueryData, backups, getDb } from "../../store.server";

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
  const user = await getUser(request, context, true);
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
        ownerId: user.id,
        previewImageUrl: findMessagesPreviewImageUrl(data.messages),
      })
      .returning({
        id: backups.id,
        name: backups.name,
        dataVersion: backups.dataVersion,
      })
  )[0];
};
