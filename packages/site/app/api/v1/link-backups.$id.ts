import { json } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { getUser } from "~/session.server";
import { getDb, linkBackups } from "~/store.server";
import { ZodLinkQueryData } from "~/types/QueryData";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { jsonAsString } from "~/util/zod";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  const { id } = zx.parseParams(params, { id: zx.IntAsString });

  const db = getDb(context.env.DATABASE_URL);
  const backup = await db.query.linkBackups.findFirst({
    where: eq(linkBackups.id, id),
    columns: {
      id: true,
      code: true,
      name: true,
      data: true,
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

  return backup;
};

export const action = async ({ request, params, context }: ActionArgs) => {
  const user = await getUser(request, context, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });
  const { name, data } = await zx.parseForm(request, {
    name: z
      .ostring()
      .refine((val) => (val !== undefined ? val.length <= 100 : true)),
    data: z.optional(jsonAsString(ZodLinkQueryData)),
  });

  const db = getDb(context.env.DATABASE_URL);
  const backup = await db.query.linkBackups.findFirst({
    where: eq(linkBackups.id, id),
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
      .update(linkBackups)
      .set({ name: name?.trim() || undefined, data })
      .where(eq(linkBackups.id, id))
      .returning({
        id: linkBackups.id,
        code: linkBackups.code,
        name: linkBackups.name,
        ownerId: linkBackups.ownerId,
        updatedAt: linkBackups.updatedAt,
      })
  )[0];
};
