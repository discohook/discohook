import type { SerializeFrom } from "@remix-run/cloudflare";
import type { SubmitOptions } from "@remix-run/react";
import type {
  ActionFunctionArgs as RRActionFunctionArgs,
  LoaderFunctionArgs as RRLoaderFunctionArgs,
} from "@remix-run/router";
import { useEffect, useState } from "react";
import type { ZodError } from "zod";
import type { Env } from "~/types/env";

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
    if (Array.isArray(e.issues)) {
      return (e as ZodError).issues
        .map((iss) => `${iss.message} (${iss.path.join(".")})`)
        .join("\n");
    }
    const lines: string[] = [];
    let i = -1;
    const iter = (obj: Record<string, unknown>, top = false) => {
      if (top) {
        i += 1;
      }
      for (const [key, errs] of Object.entries(obj)) {
        if (key === "_errors") {
          lines[i] = `${lines[i] ?? ""} ${(errs as string[]).join(", ")}`;
        } else {
          lines[i] = `${lines[i] ?? ""} ${key}:`.trim();
          iter(errs as Record<string, unknown>);
        }
      }
    };
    iter(e.issues, true);
    return lines.join("\n");
  } else if ("message" in e) {
    return (e as ZodError).message;
  }
  return String(e);
};

const returnRawIf = (raw: unknown): string | undefined => {
  try {
    JSON.parse(JSON.stringify(raw));
  } catch {
    return;
  }

  const stringified = JSON.stringify(raw);
  const data = raw as Record<string, unknown>;
  const keys = Object.keys(data).length;
  if (data.message) {
    if ("code" in data) {
      return keys === 2 ? undefined : stringified;
    }
    return keys === 1 ? undefined : stringified;
  }
  return stringified;
};

export const useSafeFetcher = <TData = any>({
  onError,
}: {
  onError?: (error: { status: number; message: string; raw?: string }) => void;
}) => {
  const [data, setData] = useState<SerializeFrom<TData>>();
  const [state, setState] = useState<"idle" | "loading" | "submitting">("idle");
  return {
    data,
    state,
    load: ((href) => {
      setState("loading");
      // TODO determine appropriate route for `_data` query param
      // This data is passed to the client by Remix somewhere
      fetch(href, { method: "GET" })
        .then((response) => {
          response
            .json()
            .then((raw) => {
              if (!response.ok) {
                if (onError) {
                  onError({
                    status: response.status,
                    message: getZodErrorMessage(raw),
                    raw: returnRawIf(raw),
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
    }) as (href: string) => void,
    loadAsync: (async (href) => {
      setState("loading");
      try {
        const response = await fetch(href, { method: "GET" });
        const raw = await response.json();
        if (!response.ok) {
          if (onError) {
            onError({
              status: response.status,
              message: getZodErrorMessage(raw),
              raw: returnRawIf(raw),
            });
          }
          setState("idle");
          return;
        }
        const responseData = raw as SerializeFrom<TData>;
        setData(responseData);
        setState("idle");
        return responseData;
      } catch (e) {
        setState("idle");
        throw e;
      }
    }) as (href: string) => Promise<SerializeFrom<TData>>,
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
          if (response.status === 204) {
            setState("idle");
            return;
          }
          const contentType = response.headers.get("Content-Type");
          if (contentType?.trim().startsWith("application/json")) {
            response
              .json()
              .then((raw) => {
                if (!response.ok) {
                  if (onError) {
                    onError({
                      status: response.status,
                      message: getZodErrorMessage(raw),
                      raw: returnRawIf(raw),
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
          }
          throw Error(`Unhandled content type: ${contentType}`);
        })
        .catch((e) => {
          setState("idle");
          throw e;
        });
    }) as (
      target: FormData | URLSearchParams | any,
      options?: Pick<SubmitOptions, "action" | "method">,
    ) => void,
    submitAsync: (async (target, options) => {
      setState("submitting");
      const contentType =
        target instanceof FormData || target instanceof URLSearchParams
          ? "application/x-www-form-urlencoded"
          : "application/json";
      try {
        const response = await fetch(options?.action ?? window.location.href, {
          method: options?.method ?? "POST",
          body:
            contentType === "application/json"
              ? JSON.stringify(target)
              : target,
          headers: {
            "Content-Type": contentType,
          },
        });

        if (!response.ok) {
          const raw = await response.json();
          if (onError) {
            onError({
              status: response.status,
              message: getZodErrorMessage(raw),
              raw: returnRawIf(raw),
            });
          }
          setState("idle");
          return;
        }
        if (response.status === 204) {
          setState("idle");
          return undefined;
        }
        const resContentType = response.headers.get("Content-Type");
        if (resContentType?.trim().startsWith("application/json")) {
          const raw = await response.json();
          const responseData = raw as SerializeFrom<TData>;
          setData(responseData);
          setState("idle");
          return responseData;
        }
        throw Error(`Unhandled content type: ${contentType}`);
      } catch (e) {
        setState("idle");
        throw e;
      }
    }) as (
      target: FormData | URLSearchParams | any,
      options?: Pick<SubmitOptions, "action" | "method">,
    ) => Promise<SerializeFrom<TData>>,
    /**
     * Beware of making it possible to spam concurrent requests
     * since this resets `state` to `idle`
     */
    reset: () => {
      setData(undefined);
      setState("idle");
    },
  };
};

export type SafeFetcher<TData = any> = ReturnType<typeof useSafeFetcher<TData>>;

export const useApiLoader = <L = any, T = Awaited<SerializeFrom<L>>>(
  route: string,
  options?: {
    method?: string;
    version?: number;
  },
): T | undefined => {
  const [data, setData] = useState<T>();

  useEffect(() => {
    const apiPath = `/api/v${options?.version ?? 1}${route}`;
    fetch(apiPath, { method: options?.method ?? "GET" }).then((response) => {
      if (!response.ok) {
        console.error(response);
        return;
      }
      response.json().then((resolved) => {
        setData(resolved as T);
      });
    });
  }, [route, options]);

  return data;
};
