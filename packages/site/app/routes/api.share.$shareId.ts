import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { zx } from "zodix";
import { QueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { ShortenedData } from "./api.share";

export const loader = async ({ params, context }: LoaderArgs) => {
  const { shareId: id } = zx.parseParams(params, { shareId: z.string() });

  const key = `boogiehook-shorten-${id}`;
  const { value: shortened, metadata } =
    await context.env.KV.getWithMetadata<ShortenedData>(key, {
      type: "json",
      // 15 minutes
      cacheTtl: 900,
    });
  if (!shortened) {
    throw json(
      { message: "No shortened data with that ID. It may have expired." },
      404,
    );
  }

  const { expiresAt } = metadata as { expiresAt?: string };
  return {
    data: JSON.parse(shortened.data) as QueryData,
    origin: shortened.origin,
    expires: expiresAt ? new Date(expiresAt) : new Date(),
  };
};
