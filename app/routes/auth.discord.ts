import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { discordAuth } from "~/auth-discord.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await discordAuth.authenticate("discord", request);
  return redirect("/?m=auth-success");
};
