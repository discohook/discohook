import { json, redirect } from "@remix-run/cloudflare";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";
import { randomString } from "~/util/text";

export const loader = async ({ request, context }: LoaderArgs) => {
  const legacyOrigin = context.env.LEGACY_ORIGIN;
  if (!legacyOrigin) {
    throw json(
      { message: "No legacy origin is configured for this instance." },
      500,
    );
  }

  const user = await getUser(request, context, true);
  const token = randomString(30);
  await context.env.KV.put(
    `magic-token-${token}`,
    JSON.stringify({ userId: user.id }),
    { expirationTtl: 600 },
  );
  return redirect(`${legacyOrigin}/?token=${token}`);
};
