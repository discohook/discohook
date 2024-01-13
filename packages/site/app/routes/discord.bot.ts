import { redirect } from "@remix-run/cloudflare";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  redirect(
    new URL(
      "https://discord.com/oauth2/authorize?" +
        new URLSearchParams({
          client_id: context.env.DISCORD_CLIENT_ID,
          scope: "bot applications.commands",
          permissions: "0",
          guild_id: new URL(request.url).searchParams.get("guildId") ?? "",
        }),
    ).href,
  );
