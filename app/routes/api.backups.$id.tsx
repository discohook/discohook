import { LoaderFunctionArgs, json } from "@remix-run/node";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { getUser } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getUser(request, true);
  const { id } = zx.parseParams(params, { id: zx.NumAsString });

  const backup = await prisma.backup.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      dataVersion: true,
      ownerId: true,
    },
  });
  if (!backup || backup.ownerId !== user.id) {
    throw json({ message: "No backup with that ID or you do not own it." }, 404)
  }

  return backup;
};
