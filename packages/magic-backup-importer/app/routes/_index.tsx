import { redirect } from "@remix-run/cloudflare";
import { LoaderArgs } from "./migrate";

export const loader = async ({ context }: LoaderArgs) =>
  redirect(context.env.DISCOHOOK_ORIGIN);
