import { Env } from "../types/env.js";

export const getSessionManagerStub = (env: Env, sessionId: string) => {
  const id = env.SESSIONS.idFromName(sessionId);
  const stub = env.SESSIONS.get(id);
  return stub;
};

// No good way to `has()` with this unfortunately
export const getGeneric = async <T>(
  env: Env,
  key: string,
): Promise<T | null> => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", { method: "GET" });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as { data: T };
  return raw.data;
};

export const putGeneric = async <T>(
  env: Env,
  key: string,
  data: any,
  options?: { expirationTtl?: number; expiration?: number },
) => {
  const stub = getSessionManagerStub(env, key);
  const response = await stub.fetch("http://do/", {
    method: "PUT",
    body: JSON.stringify({
      data,
      expires: options?.expiration
        ? new Date(options.expiration)
        : options?.expirationTtl
          ? new Date(new Date().getTime() + options.expirationTtl * 1000)
          : undefined,
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    return null;
  }
  const raw = (await response.json()) as T;
  return raw;
};

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
