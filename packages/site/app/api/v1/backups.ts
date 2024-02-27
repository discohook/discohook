import { z } from "zod";
import { zx } from "zodix";
import { getUser } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { ActionArgs } from "~/util/loader";
import { jsonAsString } from "~/util/zod";
import { backups, getDb } from "../../store.server";

export const action = async ({ request, context }: ActionArgs) => {
  const user = await getUser(request, context, true);
  const { name, data } = await zx.parseForm(request, {
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
      })
      .returning({
        id: backups.id,
        name: backups.name,
        dataVersion: backups.dataVersion,
      })
  )[0];
};
