import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = ({ request }: LoaderFunctionArgs) =>
  redirect(
    new URL(
      `https://discord.com/oauth2/authorize?` +
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID!,
          scope: "bot applications.commands",
          permissions: "0",
          guild_id: new URL(request.url).searchParams.get("guildId") ?? "",
        })
    ).href
  );
