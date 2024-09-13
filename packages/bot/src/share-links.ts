import { QueryData } from "store/src/types";
import { Env } from "./types/env.js";

export const putShareLink = async (
  env: Env,
  shareId: string,
  data: QueryData,
  expiresAt: Date,
  origin?: string,
) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  await stub.fetch("http://do/", {
    method: "PUT",
    body: JSON.stringify({
      data,
      expiresAt,
      origin,
    }),
    headers: { "Content-Type": "application/json" },
  });
};

export const getShareLinkExists = async (env: Env, shareId: string) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  const response = await stub.fetch("http://do/", {
    method: "HEAD",
  });
  return response.ok;
};

export const getShareLink = async (env: Env, shareId: string) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  const response = await stub.fetch(`http://do/?shareId=${shareId}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw Error(await response.text());
  }
  const raw = (await response.json()) as {
    data: QueryData;
    alarm: number;
    origin?: string;
  };
  return raw;
};
