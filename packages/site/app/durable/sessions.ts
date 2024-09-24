import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { Env } from "~/types/env";
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
          expires: z.string().datetime().optional(),
        });
        await this.state.storage.put("data", data);
        if (expires) {
          await this.state.storage.setAlarm(new Date(expires));
        }
        return json({}, 201);
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

export const getSessionManagerStub = (env: Env, sessionId: string) => {
  const id = env.SESSIONS.idFromName(sessionId);
  const stub = env.SESSIONS.get(id);
  return stub;
};
