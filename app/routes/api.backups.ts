import { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { getUser } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";
import { jsonAsString } from "~/util/zod";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request, true);
  const { name, data } = await zx.parseForm(request, {
    name: z.string().refine((val) => val.length <= 100),
    data: jsonAsString(ZodQueryData),
  });

  const backup = await prisma.backup.create({
    data: {
      name,
      data,
      dataVersion: data.version ?? "d2",
      ownerId: user.id,
    },
    select: {
      id: true,
      name: true,
      dataVersion: true,
    },
  });

  return backup;
};
