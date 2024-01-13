import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { zx } from "zodix";
import { QueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { ShortenedData } from "./api.share";

export const loader = async ({ params, context }: LoaderArgs) => {
  const { shareId: id } = zx.parseParams(params, { shareId: z.string() });

  const key = `boogiehook-shorten-${id}`;
  const shortenedRaw = await context.env.KV.get(key);
  if (!shortenedRaw) {
    throw json(
      { message: "No shortened data with that ID. It may have expired." },
      404,
    );
  }
  const shortened: ShortenedData = JSON.parse(shortenedRaw);

  return {
    data: JSON.parse(shortened.data) as QueryData,
    origin: shortened.origin,
    // expires: new Date(new Date().getTime() + ),
    expires: new Date(),
  };
};
