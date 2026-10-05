import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const origin = new URL(context.env.DISCOHOOK_ORIGIN);
  url.protocol = origin.protocol;
  url.host = origin.host;
  url.searchParams.set("m", "org");
  return redirect(url.href);
};
