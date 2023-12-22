import { redirect } from "@remix-run/cloudflare";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ context }: LoaderArgs) =>
  redirect(`https://discord.gg/${context.env.DISCORD_SUPPORT_INVITE_CODE}`);
