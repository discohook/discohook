import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getGeneric, getSessionManagerStub } from "~/store.server";
import { zxParseJson } from "~/util/zod";

// This is so generic I feel like I've written it 100 times. Is there anything
// unique to sessions that we could add? If not, maybe we should change this
// into a more reusable class with keyed IDs. Something like an `ExpirableData`
// with IDs named `session-xxx`, etc.
export class SessionManager implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    switch (request.method) {
      case "PUT": {
        const { data, expires } = await zxParseJson(request, {
          data: z.any(),
          expires: z
            .string()
            .datetime()
            .transform((v) => new Date(v))
            .optional(),
        });
        await this.state.storage.put("data", data);
        if (expires) {
          await this.state.storage.setAlarm(new Date(expires));
        }
        return json({}, 201);
      }
      case "PATCH": {
        const { data, expires } = await zxParseJson(request, {
          data: z.any().optional(),
          expires: z
            .string()
            .datetime()
            .transform((v) => new Date(v))
            .optional(),
        });
        if (data) {
          await this.state.storage.put("data", data);
        }
        if (expires) {
          await this.state.storage.setAlarm(expires);
        }
        return json({ data, expires }, 200);
      }
      case "GET": {
        const data = await this.state.storage.get("data");
        if (!data) {
          return json({ message: "No data" }, 404);
        }
        // const alarm = await this.state.storage.getAlarm();
        return json({ data });
      }
      case "DELETE": {
        await this.alarm();
        return new Response(null, { status: 204 });
      }
      default:
        return json({ message: "Method Not Allowed" }, 405);
    }
  }

  async alarm() {
    await this.state.storage.deleteAll();
  }
}

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

interface TokenComponentEditorState {
  interactionId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  row?: number;
  column?: number;
}
export const getDOToken = async (
  env: Env,
  tokenId: string | bigint,
  componentId: string | bigint,
) => {
  const key = `token:${tokenId}-component-${componentId}`;
  return await getGeneric<TokenComponentEditorState>(env, key);
};

export const patchDOToken = async <T>(
  env: Env,
  tokenId: string | bigint,
  componentId: string | bigint,
  body: { data?: T; expires?: Date },
): Promise<T | null> => {
  const key = `token:${tokenId}-component-${componentId}`;
  return await patchGeneric(env, key, body);
};
