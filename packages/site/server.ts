import { type ServerBuild, createRequestHandler } from "@remix-run/cloudflare";
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server";
import { getLoadContext } from "./load-context";

// Webdis KV interface
import { getRedis } from "store";

// Durable objects
export { DurableComponentState } from "store";
export { DurableDraftComponentCleaner } from "./app/.server/durable/draft-components";
export { RateLimiter } from "./app/.server/durable/rate-limits";
export { DurableScheduler } from "./app/.server/durable/scheduler";
export { SessionManager } from "./app/.server/durable/sessions";
/** @deprecated */
export { ShareLinks } from "./app/.server/durable/share-links";

const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

export default {
  async fetch(request, env, ctx) {
    if (env.ENVIRONMENT === "dev") {
      env.HYPERDRIVE = { connectionString: env.DATABASE_URL } as Hyperdrive;
    }
    // Not strictly compatible due to `get()` missing some features that we don't use
    const kv = getRedis(env);
    env.KV = kv;

    try {
      const { pathname } = new URL(request.url);
      const loadContext = getLoadContext({
        request,
        context: {
          cloudflare: {
            // This object matches the return value from Wrangler's
            // `getPlatformProxy` used during development via Remix's
            // `cloudflareDevProxyVitePlugin`:
            // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
            cf: request.cf,
            ctx: {
              waitUntil: ctx.waitUntil.bind(ctx),
              passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
            caches,
            env,
          },
        },
      });
      const response = await handleRemixRequest(request, loadContext);

      // Don't return text/html for API 404s
      if (
        response.status === 404 &&
        pathname.startsWith("/api/") &&
        !response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        response.headers.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ message: "Not Found" }), {
          status: response.status,
          headers: response.headers,
        });
      }

      return response;
    } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
