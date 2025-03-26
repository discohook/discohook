import type { PlatformProxy } from "wrangler";

type GetLoadContextArgs = {
  request: Request;
  context: {
    cloudflare: Omit<PlatformProxy<Env>, "dispose" | "caches" | "cf"> & {
      caches: PlatformProxy<Env>["caches"] | CacheStorage;
      cf: Request["cf"];
    };
  };
};

declare module "@remix-run/cloudflare" {
  // This will merge the result of `getLoadContext` into the `AppLoadContext`
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {}
}

export function getLoadContext({ request, context }: GetLoadContextArgs) {
  // origin & env at top level for compatibility with pre-vite code
  return {
    origin: new URL(request.url).origin,
    env: context.cloudflare.env,
    cloudflare: context.cloudflare,
  };
}
