import { getDiscordAuth } from "~/auth-discord.server";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  getDiscordAuth(context).authenticate("discord", request, {
    successRedirect: "/?m=auth-success",
    failureRedirect: "/?m=auth-failure",
  });
