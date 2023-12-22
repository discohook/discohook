import { redirect } from "@remix-run/cloudflare";
import { getDiscordAuth } from "~/auth-discord.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  await getDiscordAuth(context).authenticate("discord", request);
  return redirect("/?m=auth-success");
};
