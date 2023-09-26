import { ActionArgs, LoaderArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { redis } from "~/redis.server";
import { getUser } from "~/session.server";
import { ShortenedData } from "./api.share";

export const loader = async ({ params }: LoaderArgs) => {
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
    data: JSON.parse(shortened.data),
    origin: shortened.origin,
    expires: new Date(new Date().getTime() + (await redis.expireTime(key))),
  };
};

export const action = async ({ request, params }: ActionArgs) => {
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
  if (request.method === "DELETE") {
    const user = await getUser(request);
    if (!user) {
      throw json({ message: "Must be logged in to delete a share link." }, 401)
    }
    if (!shortened.userId || shortened.userId !== user.id) {
      throw json({ message: "You do not own this share link." }, 403)
    }
    await redis.del(key);
    return new Response(null, { status: 204 });
  }

  return null;
};
