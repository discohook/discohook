import { getDiscordAuth } from "~/auth-discord.server";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  getDiscordAuth(context).logout(request, { redirectTo: "/" });
