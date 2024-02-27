import { z } from "zod";
import { zx } from "zodix";
import { getUserId } from "~/session.server";
import { LoaderArgs } from "~/util/loader";
import { randomString } from "~/util/text";

export const action = async ({ request, params, context }: LoaderArgs) => {
  const { type } = zx.parseParams(params, {
    type: z.literal("btc"),
  });
  const userId = await getUserId(request, context, true);

  const key = `${userId}.${randomString(30)}`;
  await context.env.KV.put(
    `donation-key-${type}-${key}`,
    JSON.stringify({ userId }),
    {
      // 3 hours
      expirationTtl: 10_8000,
    },
  );
  return { key };
};
