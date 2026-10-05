import { createRequestHandler } from "react-router";

interface Env {
  DISCOHOOK_ORIGIN: string;
}

declare module "react-router" {
  interface AppLoadContext {
    env: Env;
  }
}

const handleRequest = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      return await handleRequest(request, { env });
    } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};
