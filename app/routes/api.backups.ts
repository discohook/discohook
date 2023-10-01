import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { getUser } from "~/session.server";
import { ZodQueryData } from "~/types/QueryData";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request, true);
  const { name, data: data_ } = await zx.parseForm(request, {
    name: z.ostring().refine((val) => val ? val.length <= 100 : true),
    data: z
      .string()
      .refine((val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      })
      .transform((val) => JSON.parse(val)),
  });
  let data;
  try {
    data = ZodQueryData.parse(data_);
  } catch {
    throw json({ message: "Invalid payload" }, 400);
  }

  const backup = await prisma.backup.create({
    data: {
      name: name ?? new Date().toLocaleDateString(),
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
