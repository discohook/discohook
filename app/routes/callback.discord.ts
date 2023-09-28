import { LoaderFunctionArgs } from "@remix-run/node";
import { discordAuth } from "~/auth-discord.server";

export const loader = ({ request }: LoaderFunctionArgs) =>
  discordAuth.authenticate("discord", request, {
    successRedirect: "/?m=auth-success",
    failureRedirect: "/?m=auth-failure",
  });
