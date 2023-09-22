import { LoaderArgs } from "@remix-run/node";
import { discordAuth } from "~/auth-discord.server";

export const loader = ({ request }: LoaderArgs) =>
  discordAuth.authenticate("discord", request);
