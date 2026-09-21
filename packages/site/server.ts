import { createRequestHandler } from "react-router";
import { getRedis } from "~/store.server";
import type { Env } from "~/types/env";

declare module "react-router" {
  interface AppLoadContext {
    origin: string;
    env: Env;
    waitUntil: ExecutionContext["waitUntil"];
  }
}

export { DurableDraftComponentCleaner } from "./app/durable/draft-components";
export { RateLimiter } from "./app/durable/rate-limits.server";
export { DurableScheduler } from "./app/durable/scheduler";
export { SessionManager } from "./app/durable/sessions";
export { ShareLinks } from "./app/durable/share-links.server";

const handleRemixRequest = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

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
      const response = await handleRemixRequest(request, {
        origin,
        env,
        waitUntil: ctx.waitUntil.bind(ctx),
      });
      if (
        pathname.startsWith("/api/") &&
        !response.headers.get("Content-Type")?.startsWith("application/json")
      ) {
        response.headers.delete("Content-Type");
        if (response.status === 404) {
          return Response.json(
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
