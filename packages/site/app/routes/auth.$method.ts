import { redirect } from "@remix-run/cloudflare";
import { z } from "zod";
import { zx } from "zodix";
import { getDiscordAuth } from "~/auth-discord.server";
import { getDiscordWebhookAuth } from "~/auth-discord-webhook.server";
import { getSessionStorage, getUser, getUserId } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import { zxParseParams, zxParseQuery } from "~/util/zod";

const isValidRedirect = (path: string | undefined): path is string => {
  // I don't know what's causing this but we have this weird bug where,
  // somehow, `/api/v1/users/@me` is getting passed to the redirect when
  // authorizing. I think it might have something to do with the "fetchers"
  // that we now use instead of waiting for the route loader (one of which
  // fetches that API route asynchronously on the index page).
  return !!path && path.startsWith("/") && !path.startsWith("/api/");
};

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { method } = zxParseParams(params, {
    method: z.enum(["discord", "discord-webhook"]),
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
    if (isValidRedirect(redirectTo)) {
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

  const auth = getDiscordAuth(context);
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
    session.unset("updatedAt");

    if (isValidRedirect(redirectTo)) {
      session.flash("redirectTo", redirectTo);
    } else {
      // No lingering
      session.unset("redirectTo");
    }

    request.headers.set("Cookie", await commitSession(session));
    return await auth.authenticate(method, request, {
      failureRedirect: "/?m=auth-failure",
    });
  }

  return redirect("/?m=auth-success");
};
