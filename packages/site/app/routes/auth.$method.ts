import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { z } from "zod";
import { zx } from "zodix";
import { getDiscordWebhookAuth } from "~/auth-discord-webhook.server";
import { getDiscordAuth } from "~/auth-discord.server";
import { getGuildedAuth } from "~/auth-guilded.server";
import { getSessionStorage, getUser, getUserId } from "~/session.server";
import { zxParseParams, zxParseQuery } from "~/util/zod";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { method } = zxParseParams(params, {
    method: z.enum(["discord", "discord-webhook", "guilded"]),
  });

  if (method === "discord-webhook") {
    const { guildId } = zxParseQuery(request, {
      guildId: z.ostring(),
    });

    const discordWebhookAuth = getDiscordWebhookAuth(context);
    // request.headers.delete("Cookie");
    try {
      const webhook = await discordWebhookAuth.authenticate("discord", request);
      if (webhook) {
        discordWebhookAuth.logout(request, { redirectTo: request.url });
      }
    } catch (e) {
      const response = e as Response;
      const loc = response.headers.get("Location");
      if (guildId && loc) {
        const url = new URL(loc);
        url.searchParams.set("guild_id", guildId);
        response.headers.set("Location", url.href);
      }
      return response;
    }
    return null;
  }

  let { force, redirect: redirectTo } = zxParseQuery(request, {
    redirect: z.ostring(),
    force: zx.BoolAsString.optional(),
  });

  const userId = await getUserId(request, context);
  const user = await getUser(request, context);
  if (user) {
    if (
      redirectTo &&
      (redirectTo.startsWith("/") ||
        ["discohook.app", "discohook.org"].includes(new URL(redirectTo).host))
    ) {
      return redirect(redirectTo);
    }
    return redirect("/?m=auth-success");
  } else if (userId) {
    // Likely lingering cookie with unavailable server-side data
    force = true;
  }

  // const beforeStorage = getSessionStorage(context);
  // const beforeSession = await beforeStorage.getSession(request.headers.get("Cookie"));
  // if (force) {
  //   // Pretend the user is not logged in so remix-auth doesn't take us to auth-success
  //   request.headers.delete("Cookie");
  // }

  const auth =
    method === "discord" ? getDiscordAuth(context) : getGuildedAuth(context);
  const userAuth = await auth.isAuthenticated(request);

  if (!userAuth || !userAuth[`${method}Id`] || force) {
    const { getSession, commitSession } = getSessionStorage(context);
    const session = await getSession(request.headers.get("Cookie"));

    // We have to remove the value (not just recreate behavior) if we want
    // remix-auth to actually be doing anything. Unfortunately it contains
    // no built-in force behavior as far as I know, so ultimately this causes
    // cancelled (forced) auth requests to log the user out. If you have a
    // solution to this please open an issue.
    session.unset("user");
    // Also: What to do about having both a Discord and Guilded account
    // associated with the same User? This is really a no-good solution.

    if (
      redirectTo &&
      (redirectTo.startsWith("/") ||
        ["discohook.app", "discohook.org"].includes(new URL(redirectTo).host))
    ) {
      session.flash("redirectTo", redirectTo);
    }

    request.headers.set("Cookie", await commitSession(session));
    return await auth.authenticate(method, request, {
      failureRedirect: "/?m=auth-failure",
    });
  }

  return redirect("/?m=auth-success");
};
