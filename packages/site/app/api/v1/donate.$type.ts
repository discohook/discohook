import { z } from "zod";
import { getUserId } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { zxParseParams } from "~/util/zod";

export const ZodDonateKeyType = z.literal("btc");

export const action = async ({ request, params, context }: LoaderArgs) => {
  const { type } = zxParseParams(params, {
    type: ZodDonateKeyType,
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
