import { json } from "@remix-run/cloudflare";
import { getSessionStorage, getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { getSession, commitSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUser(request, context, true, session);

  // I want to implement something where the user profile is refreshed if the
  // stored avatar is outdated. Still working out the best way to go about it
  // if (user.discordUser?.avatar) {
  //   // Smallest file for quickest load time
  //   const avatarUrl = getUserAvatar(user, { size: 16, extension: "jpg" });
  //   const resp = await fetch(avatarUrl, {
  //     method: "GET",
  //     headers: { "User-Agent": userAgent },
  //   });
  //   if (resp.status === 404) {
  //     await refreshUserSession({ user, session });
  //   }
  // }

  return json(user, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

export type ApiGetCurrentUser = typeof loader;
