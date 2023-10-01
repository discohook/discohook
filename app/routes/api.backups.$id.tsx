import { LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { doubleDecode, getUser } from "~/session.server";
import { QueryData } from "~/types/QueryData";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getUser(request, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });
  const { data: returnData } = zx.parseQuery(request, { data: z.optional(zx.BoolAsString) });

  const backup = await prisma.backup.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      data: returnData,
      dataVersion: true,
      ownerId: true,
    },
  });
  if (!backup || backup.ownerId !== user.id) {
    throw json({ message: "No backup with that ID or you do not own it." }, 404)
  }

  return {
    ...backup,
    data: returnData ? doubleDecode<QueryData>(backup.data) : null,
  };
};
