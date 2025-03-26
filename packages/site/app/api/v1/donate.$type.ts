import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ZodDonateKeyType } from "~/api/zod";
import { getUserId } from "~/session.server";
import { randomString } from "~/util/text";
import { zxParseParams } from "~/util/zod";

export const action = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { type } = zxParseParams(params, {
    type: ZodDonateKeyType,
  });
  const userId = await getUserId(request, context, true);

  const key = `${userId}.${randomString(30)}`;
  await context.env.KV.put(
    `donation-key-${type}-${key}`,
    JSON.stringify({ userId }),
    // 3 hours
    { expirationTtl: 10_8000 },
  );
  return { key };
};
