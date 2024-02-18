import { z } from "zod";
import { zx } from "zodix";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";
import { randomString } from "~/util/text";

export const action = async ({ request, params, context }: LoaderArgs) => {
  const { type } = zx.parseParams(params, {
    type: z.literal("btc"),
  });
  const user = await getUser(request, context, true);

  const key = `${user.id}.${randomString(30)}`;
  await context.env.KV.put(
    `donation-key-${type}-${key}`,
    JSON.stringify({
      userId: user.id,
    }),
    {
      // 3 hours
      expirationTtl: 10_8000,
    },
  );
  return { key };
};
