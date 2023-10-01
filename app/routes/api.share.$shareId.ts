import { LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { redis } from "~/redis.server";
import { QueryData } from "~/types/QueryData";
import { ShortenedData } from "./api.share";

export const loader = async ({ params }: LoaderFunctionArgs) => {
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

  return {
    data: JSON.parse(shortened.data) as QueryData,
    origin: shortened.origin,
    expires: new Date(new Date().getTime() + (await redis.expireTime(key))),
  };
};
