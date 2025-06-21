import { json, redirect } from "@remix-run/cloudflare";
import { getUserId } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import { randomString } from "~/util/text";

export const loader = async ({ request, context }: LoaderArgs) => {
  const legacyOrigin = context.env.LEGACY_ORIGIN;
  if (!legacyOrigin) {
    throw json(
      { message: "No legacy origin is configured for this instance." },
      500,
    );
  }

  const userId = await getUserId(request, context, true);
  const token = randomString(30);
  await context.env.KV.put(
    `magic-token-${token}`,
    JSON.stringify({ userId: userId?.toString() }),
    { expirationTtl: 600 },
  );
  return redirect(`${legacyOrigin}/migrate?token=${token}`);
};
