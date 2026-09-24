import { getShareLinkExists } from "~/durable/share-links.server";
import type { Env } from "~/types/env";
import { randomString } from "~/util/text";

export const generateUniqueShortenKey = async (
  env: Env,
  length: number,
  tries = 10,
): Promise<string> => {
  for (const _ of Array(tries)) {
    const shareId = randomString(length);
    const exists = await getShareLinkExists(env, shareId);
    if (!exists) {
      return shareId;
    }
  }
  return await generateUniqueShortenKey(env, length + 1, tries);
};
