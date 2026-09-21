// remix-auth/remix-auth-oauth2 requires "@remix-run/server-runtime" at load
// time for: `json`, `redirect`, `isSession`.
// That package no longer exists but we can easily reimplement them
import { redirect } from "react-router";

export { redirect };

export const json = <Data>(
  data: Data,
  init: number | ResponseInit = {},
): Response => {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return Response.json(data, responseInit);
};

export const isSession = (object: unknown): boolean =>
  object != null &&
  typeof (object as Record<string, unknown>).id === "string" &&
  typeof (object as Record<string, unknown>).data !== "undefined" &&
  typeof (object as Record<string, unknown>).has === "function" &&
  typeof (object as Record<string, unknown>).get === "function" &&
  typeof (object as Record<string, unknown>).set === "function" &&
  typeof (object as Record<string, unknown>).flash === "function" &&
  typeof (object as Record<string, unknown>).unset === "function";
