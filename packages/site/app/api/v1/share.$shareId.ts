import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getBucket } from "~/.server/durable/rate-limits";
import type { QueryData } from "~/types/QueryData";
import { zxParseParams } from "~/util/zod";
import { getShareLink } from "../util/share-links";

export interface InvalidShareIdData {
  message: string;
  expiredAt: string | undefined;
}

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { shareId } = zxParseParams(params, { shareId: z.string() });
  const headers = await getBucket(request, context, "share");

  let data: QueryData;
  let alarm: number | undefined;
  try {
    ({ data, alarm } = await getShareLink(context.env, shareId));
  } catch (e) {
    if (e instanceof Response) {
      // e.headers is immutable
      const h = new Headers(e.headers);
      for (const [k, v] of Object.entries(headers)) {
        h.set(k, v);
      }
      throw new Response(e.body, { headers: h, status: e.status });
    }
    throw e;
  }

  return json({ data, expires: new Date(alarm ?? 0) }, { headers });
};
