import { redirect } from "@remix-run/cloudflare";
import { getDiscordAuth } from "~/auth-discord.server";
import { getSessionStorage } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const auth = getDiscordAuth(context);

  let response: Response;
  try {
    response = await auth.authenticate("discord", request, {
      successRedirect: "/?m=auth-success",
      failureRedirect: "/?m=auth-failure",
    });
  } catch (e) {
    response = e as Response;
  }

  // Bit of a hack. We're letting remix-auth do what it wants, then taking the
  // cookie and treating it like a session from a Request. We can then flash
  // the redirect value, if any, and commit it ourselves. Everything works as
  // expected in the callback.
  const { getSession, commitSession } = getSessionStorage(context);
  const session = await getSession(response.headers.get("Set-Cookie"));

  const redirectTo = new URL(request.url).searchParams.get("redirect");
  if (
    redirectTo &&
    (redirectTo.startsWith("/") ||
      ["discohook.app", "discohook.org"].includes(new URL(redirectTo).host))
  ) {
    session.flash("redirectTo", redirectTo);
  }

  // biome-ignore lint/style/noNonNullAssertion: It's a redirect response
  return redirect(response.headers.get("Location")!, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
