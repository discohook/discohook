import { SerializeFrom } from "@remix-run/cloudflare";
import { SubmitOptions } from "@remix-run/react";
import type {
  ActionFunctionArgs as RRActionFunctionArgs,
  LoaderFunctionArgs as RRLoaderFunctionArgs,
} from "@remix-run/router";
import { useState } from "react";
import { ZodError } from "zod";
import { Env } from "~/types/env";

export interface Context {
  origin: string;
  env: Env;
  waitUntil: ExecutionContext["waitUntil"];
}

// We are specifically using these imports from @remix-run/router because the
// adapter exports are not generic and we cannot pass Env like this.
export type LoaderArgs = RRLoaderFunctionArgs<Context> & { context: Context };
export type ActionArgs = RRActionFunctionArgs<Context> & { context: Context };

export const getZodErrorMessage = (e: any) => {
  if ("issues" in e) {
    return (e as ZodError).issues
      .map((iss) => `${iss.message} (${iss.path.join(".")})`)
      .join("\n");
  } else if ("message" in e) {
    return (e as ZodError).message;
  }
  return String(e);
};

export const useSafeFetcher = <TData = any>({
  onError,
}: { onError?: (error: { status: number; message: string }) => void }) => {
  const [data, setData] = useState<SerializeFrom<TData>>();
  const [state, setState] = useState<"idle" | "loading" | "submitting">("idle");
  return {
    data,
    state,
    // load: () => {},
    submit: ((target, options) => {
      setState("submitting");
      const contentType =
        target instanceof FormData || target instanceof URLSearchParams
          ? "application/x-www-form-urlencoded"
          : "application/json";
      // TODO determine appropriate route for `_data` query param
      // This data is passed to the client by Remix somewhere
      fetch(options?.action ?? window.location.href, {
        method: options?.method ?? "POST",
        body:
          contentType === "application/json" ? JSON.stringify(target) : target,
        headers: {
          "Content-Type": contentType,
        },
      })
        .then((response) => {
          response
            .json()
            .then((raw) => {
              if (!response.ok) {
                if (onError) {
                  onError({
                    status: response.status,
                    message: getZodErrorMessage(raw),
                  });
                }
                setState("idle");
                return;
              }
              const responseData = raw as SerializeFrom<TData>;
              setData(responseData);
              setState("idle");
            })
            .catch((e) => {
              setState("idle");
              throw e;
            });
        })
        .catch((e) => {
          setState("idle");
          throw e;
        });
    }) as (
      target: FormData | URLSearchParams | any,
      options?: Pick<SubmitOptions, "action" | "method">,
    ) => void,
  };
};
