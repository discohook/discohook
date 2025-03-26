import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getDiscordAuth } from "~/auth-discord.server";

export const loader = ({ request, context }: LoaderFunctionArgs) =>
  getDiscordAuth(context).logout(request, { redirectTo: "/" });
