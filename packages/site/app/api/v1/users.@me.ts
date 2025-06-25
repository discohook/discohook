import { json } from "@remix-run/cloudflare";
import { getSessionStorage, getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { getSession, commitSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUser(request, context, true, session);
  return json(user, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

export type ApiGetCurrentUser = typeof loader;
