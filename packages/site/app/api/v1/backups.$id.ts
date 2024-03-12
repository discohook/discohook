import { json } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { doubleDecode, getUser } from "~/session.server";
import { backups, getDb } from "~/store.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { jsonAsString } from "~/util/zod";
import { findMessagesPreviewImageUrl } from "./backups";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });
  const { data: returnData } = zx.parseQuery(request, {
    data: z.optional(zx.BoolAsString),
  });

  const db = getDb(context.env.DATABASE_URL);
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, id),
    columns: {
      id: true,
      name: true,
      data: returnData,
      dataVersion: true,
      ownerId: true,
    },
  });
  if (!backup || backup.ownerId !== user.id) {
    throw json(
      { message: "No backup with that ID or you do not own it." },
      404,
    );
  }

  return {
    ...backup,
    data: "data" in backup ? doubleDecode<QueryData>(backup.data) : null,
  };
};

export const action = async ({ request, params, context }: ActionArgs) => {
  const user = await getUser(request, context, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });
  const { name, data } = await zx.parseForm(request, {
    name: z
      .ostring()
      .refine((val) => (val !== undefined ? val.length <= 100 : true)),
    data: z.optional(jsonAsString(ZodQueryData)),
  });

  const db = getDb(context.env.DATABASE_URL);
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, id),
    columns: {
      ownerId: true,
    },
  });
  if (!backup || backup.ownerId !== user.id) {
    throw json(
      { message: "No backup with that ID or you do not own it." },
      404,
    );
  }

  return (
    await db
      .update(backups)
      .set({
        name,
        data,
        previewImageUrl: data
          ? findMessagesPreviewImageUrl(data.messages)
          : undefined,
      })
      .where(eq(backups.id, id))
      .returning({
        id: backups.id,
        name: backups.name,
        ownerId: backups.ownerId,
        updatedAt: backups.updatedAt,
      })
  )[0];
};
