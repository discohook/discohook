import { redirect } from "@remix-run/cloudflare";
import { LoaderArgs } from "./migrate";

export const loader = async ({ request, context }: LoaderArgs) => {
  const url = new URL(request.url);
  const origin = new URL(context.env.DISCOHOOK_ORIGIN);
  url.protocol = origin.protocol;
  url.host = origin.host;
  url.searchParams.set("m", "org");
  return redirect(url.href);
};
