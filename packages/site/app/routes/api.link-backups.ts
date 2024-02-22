import { z } from "zod";
import { zx } from "zodix";
import { getUser } from "~/session.server";
import { ZodLinkQueryData } from "~/types/QueryData";
import { ActionArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { jsonAsString } from "~/util/zod";
import { getDb, linkBackups } from "../store.server";

export const action = async ({ request, context }: ActionArgs) => {
  const user = await getUser(request, context, true);
  const { name, data } = await zx.parseForm(request, {
    name: z.string().refine((val) => val.length <= 100),
    data: jsonAsString(ZodLinkQueryData),
  });

  const db = getDb(context.env.DATABASE_URL);
  return (
    await db
      .insert(linkBackups)
      .values({
        name,
        code: randomString(12),
        data,
        dataVersion: data.version ?? 1,
        ownerId: user.id,
      })
      .returning({
        id: linkBackups.id,
        name: linkBackups.name,
        code: linkBackups.code,
        dataVersion: linkBackups.dataVersion,
      })
  )[0];
};
