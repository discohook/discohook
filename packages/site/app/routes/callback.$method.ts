import { z } from "zod";
import { getDiscordAuth } from "~/auth-discord.server";
import { getSessionStorage } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { method } = zxParseParams(params, {
    method: z.literal("discord"),
  });

  const { sessionStorage, getSession } = getSessionStorage(context);
  const session = await getSession(request.headers.get("Cookie"));
  const auth = getDiscordAuth(context, sessionStorage);

  const redirectTo: string | null = session.get("redirectTo") || null;
  return await auth.authenticate(method, request, {
    successRedirect: redirectTo ?? "/?m=auth-success",
    failureRedirect: "/?m=auth-failure",
  });
};
