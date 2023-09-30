import { LoaderFunctionArgs } from "@remix-run/node";
import { discordAuth } from "~/auth-discord.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await discordAuth.logout(request, { redirectTo: "/" });
};
