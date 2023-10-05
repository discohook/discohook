import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { doubleDecode, getUser } from "~/session.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { jsonAsString } from "~/util/zod";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getUser(request, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });
  const { data: returnData } = zx.parseQuery(request, {
    data: z.optional(zx.BoolAsString),
  });

  const backup = await prisma.backup.findUnique({
    where: { id },
    select: {
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
      404
    );
  }

  return {
    ...backup,
    data: returnData ? doubleDecode<QueryData>(backup.data) : null,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getUser(request, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });
  const { name, data } = await zx.parseForm(request, {
    name: z
      .ostring()
      .refine((val) => (val !== undefined ? val.length <= 100 : true)),
    data: z.optional(jsonAsString(ZodQueryData)),
  });

  const backup = await prisma.backup.findUnique({
    where: { id },
    select: {
      ownerId: true,
    },
  });
  if (!backup || backup.ownerId !== user.id) {
    throw json(
      { message: "No backup with that ID or you do not own it." },
      404
    );
  }

  return await prisma.backup.update({
    where: { id },
    data: { name, data },
    select: {
      id: true,
      name: true,
      ownerId: true,
      updatedAt: true,
    },
  });
};
