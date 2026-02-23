import type { AppLoadContext } from "@remix-run/cloudflare";
import { createRequestHandler, json, logDevReady } from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import { getRedis } from "~/store.server";
import type { Env } from "~/types/env";

export { DurableDraftComponentCleaner } from "./app/durable/draft-components";
export { RateLimiter } from "./app/durable/rate-limits";
export { DurableScheduler } from "./app/durable/scheduler";
export { SessionManager } from "./app/durable/sessions";
export { ShareLinks } from "./app/durable/share-links";

const handleRemixRequest = createRequestHandler(build, process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

export default {
  async fetch(
    request: Request,
    env: Env & { __STATIC_CONTENT: KVNamespace<string> },
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (env.ENVIRONMENT === "dev") {
      env.HYPERDRIVE = { connectionString: env.DATABASE_URL } as Hyperdrive;
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
