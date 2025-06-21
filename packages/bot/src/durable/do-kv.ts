import { getSessionManagerStub } from "store";
import type { Env } from "../types/env.js";

export const patchGeneric = async <T>(
  env: Env,
  key: string,
  body: { data?: T; expires?: Date },
): Promise<T | null> => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as T;
  return raw;
};

export const deleteGeneric = async (env: Env, key: string) => {
  const stub = getSessionManagerStub(env, key);
  await stub.fetch("http://do/", { method: "DELETE" });
};
