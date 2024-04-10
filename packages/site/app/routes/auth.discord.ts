import { redirect } from "@remix-run/cloudflare";
import { z } from "zod";
import { zx } from "zodix";
import { getDiscordAuth } from "~/auth-discord.server";
import { getSessionStorage } from "~/session.server";
import { LoaderArgs } from "~/util/loader";
import { zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const auth = getDiscordAuth(context);
  const { force, redirect: redirectTo } = zxParseQuery(request, {
    redirect: z.ostring(),
    force: zx.BoolAsString.optional(),
  });

  if (force) {
    // Pretend the user is not logged in so remix-auth doesn't take us to auth-success
    request.headers.delete("Cookie");
  }

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
