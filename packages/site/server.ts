import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { createRequestHandler, json, logDevReady } from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import __STATIC_CONTENT_MANIFEST from "__STATIC_CONTENT_MANIFEST";
import { getRedis } from "~/store.server";
import { Env } from "~/types/env";
export { DurableComponentState } from "store";
export { DurableDraftComponentCleaner } from "./app/durable/draft-components";
export { RateLimiter } from "./app/durable/rate-limits";
export { DurableScheduler } from "./app/durable/scheduler";
export { SessionManager } from "./app/durable/sessions";
export { ShareLinks } from "./app/durable/share-links";

const MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST);
const handleRemixRequest = createRequestHandler(build, process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

export default {
  async fetch(
    request: Request,
    env: Env & { __STATIC_CONTENT: Fetcher },
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (env.ENVIRONMENT === "dev") {
      env.HYPERDRIVE = { connectionString: env.DATABASE_URL } as Hyperdrive;
    }
    try {
      const url = new URL(request.url);
      const ttl = url.pathname.startsWith("/build/")
        ? 60 * 60 * 24 * 365 // 1 year
        : 60 * 5; // 5 minutes
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        } as FetchEvent,
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: MANIFEST,
          cacheControl: {
            browserTTL: ttl,
            edgeTTL: ttl,
          },
        },
      );
    } catch (error) {
      // No-op
    }

    const kv = getRedis(env);
    // Not strictly compatible due to `get()` missing some features that we don't use
    env.KV = kv;

    try {
      const { origin, pathname } = new URL(request.url);
      const loadContext: AppLoadContext = {
        origin,
        env,
        waitUntil: ctx.waitUntil,
        // passThroughOnException: ctx.passThroughOnException,
      };
      const response = await handleRemixRequest(request, loadContext);
      if (
        pathname.startsWith("/api/") &&
        !response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        response.headers.delete("Content-Type");
        if (response.status === 404) {
          return json(
            { message: "Not Found" },
            {
              status: 404,
              headers: response.headers,
            },
          );
        }
      }
      return response;
    } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};
