import { RESTJSONErrorCodes } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { t } from "i18next";
import { useEffect, useState } from "react";
import {
  UNSAFE_decodeViaTurboStream,
  type AppLoadContext,
  type ActionFunctionArgs as RRActionFunctionArgs,
  type LoaderFunctionArgs as RRLoaderFunctionArgs,
  type SubmitOptions,
  type useLoaderData,
} from "react-router";
import type { ZodError } from "zod";
import { isErrorData, type RESTErrorWithContext } from "./discord";

export type Context = AppLoadContext;

// Since RR7 move: this is kind of outdated and might warrant replacement.
// we should be able to do this with a .d.ts module alone
export type LoaderArgs = RRLoaderFunctionArgs<Context> & { context: Context };
export type ActionArgs = RRActionFunctionArgs<Context> & { context: Context };

// thanks https://github.com/remix-run/react-router/discussions/12417#discussioncomment-11512424
export type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;

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

const getDiscordOrZodErrorMessage = (e: any) => {
  if (isErrorData(e)) {
    if ("context" in e) {
      const data = e as RESTErrorWithContext;
      if (
        (data.code === RESTJSONErrorCodes.MissingAccess ||
          data.code === RESTJSONErrorCodes.MissingPermissions) &&
        data.context?.required_permissions !== undefined
      ) {
        const required = new PermissionsBitField(
          BigInt(data.context.required_permissions),
        );
        const str = Object.entries(PermissionFlags)
          .filter(([_, val]) => required.has(val))
          .map(([flag]) => t(`permission.${flag}`, { lng: "en" }))
          .join(", ");
        return `Ensure Discohook Utils has all of the following permissions in the ${data.context.channel ? "channel" : "server"}: ${str}.`;
      }
    }
    return e.message;
  }
  return getZodErrorMessage(e);
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
      if ("context" in data) {
        return keys === 3 ? undefined : stringified;
      }
      return keys === 2 ? undefined : stringified;
    }
    return keys === 1 ? undefined : stringified;
  }
  return stringified;
};

const getResponseRaw = async (
  response: Response,
  routeId: string | boolean = false,
) => {
  if (response.body === null) throw Error("No response body");
  if (routeId) {
    // i know this is marked as unsafe, but it's highly desirable in our
    // workflow. it will be very obvious when it breaks, so such breakage
    // likely won't make it to production
    const result = await UNSAFE_decodeViaTurboStream(response.body, window);
    await result.done;
    const raw = result.value as Record<string, { data: unknown }>;
    if (typeof routeId === "string") {
      const id = routeId === "root" ? routeId : `routes/${routeId}`;
      return raw[id].data;
    }
    const lastKey = Object.keys(raw).slice(-1)[0];
    return raw[lastKey].data;
  }
  return await response.json();
};

type SafeFetcherSubmitOptions = Pick<SubmitOptions, "action" | "method"> & {
  /**
   * if this is an action (not an API route), the route ID to return data for.
   * if not provided, picks the last keyed item automatically.
   */
  routeId?: string;
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
    load: ((href, routeId?: string) => {
      setState("loading");

      const url = new URL(href, origin);
      const isLoader =
        routeId !== undefined || !url.pathname.startsWith("/api/");
      if (isLoader) url.pathname += ".data";

      fetch(url, { method: "GET" })
        .then((response) => {
          // not sure what we should do here
          if (response.body === null) {
            setState("idle");
            return;
          }
          getResponseRaw(response, routeId || isLoader)
            .then((raw) => {
              if (!response.ok) {
                if (onError) {
                  onError({
                    status: response.status,
                    message: getDiscordOrZodErrorMessage(raw),
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
    loadAsync: (async (href, routeId?: string) => {
      setState("loading");
      try {
        const url = new URL(href, origin);
        const isLoader =
          routeId !== undefined || !url.pathname.startsWith("/api/");
        if (isLoader) url.pathname += ".data";

        const response = await fetch(url, { method: "GET" });
        const raw = await getResponseRaw(response, routeId || isLoader);
        if (!response.ok) {
          if (onError) {
            onError({
              status: response.status,
              message: getDiscordOrZodErrorMessage(raw),
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
      const headers = new Headers();
      if (target instanceof FormData) {
        // no-op; fetch autofills the content type
        // with appropriate boundary string
      } else if (target instanceof URLSearchParams) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      } else {
        headers.set("Content-Type", "application/json");
      }

      const url = new URL(options?.action ?? window.location.href, origin);
      const isLoader =
        options?.routeId !== undefined || !url.pathname.startsWith("/api/");
      if (isLoader) url.pathname += ".data";

      fetch(url, {
        method: options?.method ?? "POST",
        body:
          headers.get("Content-Type") === "application/json"
            ? JSON.stringify(target)
            : target,
        headers,
      })
        .then((response) => {
          if (response.status === 204) {
            setState("idle");
            return;
          }
          const contentType = response.headers.get("Content-Type");
          if (
            contentType?.trim().startsWith("application/json") ||
            (contentType === "text/x-script" && isLoader)
          ) {
            getResponseRaw(response, options?.routeId || isLoader)
              .then((raw) => {
                if (!response.ok) {
                  if (onError) {
                    onError({
                      status: response.status,
                      message: getDiscordOrZodErrorMessage(raw),
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
          } else {
            throw Error(`Unhandled content type: ${contentType}`);
          }
        })
        .catch((e) => {
          setState("idle");
          throw e;
        });
    }) as (
      target: FormData | URLSearchParams | any,
      options?: SafeFetcherSubmitOptions,
    ) => void,
    submitAsync: (async (target, options) => {
      setState("submitting");
      const headers = new Headers();
      if (target instanceof FormData) {
        // no-op; fetch autofills the content type
        // with appropriate boundary string
      } else if (target instanceof URLSearchParams) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      } else {
        headers.set("Content-Type", "application/json");
      }

      try {
        const url = new URL(options?.action ?? window.location.href, origin);
        const isLoader =
          options?.routeId !== undefined || !url.pathname.startsWith("/api/");
        if (isLoader) url.pathname += ".data";

        const response = await fetch(url, {
          method: options?.method ?? "POST",
          body:
            headers.get("Content-Type") === "application/json"
              ? JSON.stringify(target)
              : target,
          headers,
        });

        if (!response.ok) {
          const raw = await getResponseRaw(
            response,
            options?.routeId || isLoader,
          );
          if (onError) {
            onError({
              status: response.status,
              message: getDiscordOrZodErrorMessage(raw),
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
        if (
          resContentType?.trim().startsWith("application/json") ||
          (resContentType === "text/x-script" && isLoader)
        ) {
          const raw = await getResponseRaw(
            response,
            options?.routeId || isLoader,
          );
          const responseData = raw as SerializeFrom<TData>;
          setData(responseData);
          setState("idle");
          return responseData;
        }
        throw Error(`Unhandled content type: ${headers.get("Content-Type")}`);
      } catch (e) {
        setState("idle");
        throw e;
      }
    }) as (
      target: FormData | URLSearchParams | any,
      options?: SafeFetcherSubmitOptions,
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
