import { json } from "@remix-run/cloudflare";
import { z } from "zod/v3";
import { getBucket } from "~/durable/rate-limits";
import { getShareLink } from "~/durable/share-links";
import type { QueryData } from "~/types/QueryData";
import { retrofitQueryData } from "~/types/QueryData-raw";
import type { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export interface InvalidShareIdData {
  message: string;
  expiredAt: string | undefined;
}

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { shareId } = zxParseParams(params, { shareId: z.string() });
  const headers = await getBucket(request, context, "share");

  let data: QueryData;
  let alarm: number;
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

  return json(
    { data: retrofitQueryData(data), expires: new Date(alarm) },
    { headers },
  );
};
