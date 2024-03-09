import { getDiscordAuth } from "~/auth-discord.server";
import { getSessionStorage } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { sessionStorage, getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  const auth = getDiscordAuth(context, sessionStorage);

  const redirectTo: string | null = session.get("redirectTo") || null;
  return await auth.authenticate("discord", request, {
    successRedirect: redirectTo ?? "/?m=auth-success",
    failureRedirect: "/?m=auth-failure",
  });
};
