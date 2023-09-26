import { LoaderArgs, json, redirect } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { redis } from "~/redis.server";
import { base64UrlEncode } from "~/util/text";
import { ShortenedData } from "./api.share";

export const loader = async ({ request, params }: LoaderArgs) => {
  const { shareId: id } = zx.parseParams(params, { shareId: z.string() });

  const key = `boogiehook-shorten-${id}`;
  const shortenedRaw = await redis.get(key);
  if (!shortenedRaw) {
    throw json(
      { message: "No shortened data with that ID. It may have expired." },
      404
    );
  }
  const shortened: ShortenedData = JSON.parse(shortenedRaw);
  const origin = shortened.origin ?? new URL(request.url).origin;

  const url = new URL(origin + new URL(request.url).searchParams);
  const encoded = base64UrlEncode(shortened.data);
  url.searchParams.set("data", encoded);

  return redirect(url.toString());
};
