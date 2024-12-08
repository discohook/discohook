import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { getRedis } from "~/store.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { Env } from "~/types/env";
import { zxParseJson, zxParseQuery } from "~/util/zod";

export interface KVShortenedData {
  data: string;
  origin?: string;
  userId?: string;
}

export class ShareLinks implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    if (!this.env.KV) this.env.KV = getRedis(this.env);

    switch (request.method) {
      case "PUT": {
        const { data, expiresAt, origin } = await zxParseJson(request, {
          data: ZodQueryData,
          expiresAt: z
            .string()
            .datetime()
            .transform((v) => new Date(v)),
          origin: z.ostring().nullable(),
        });
        await this.state.storage.put("data", data);
        await this.state.storage.put("expiresAt", expiresAt.toISOString());
        await this.state.storage.setAlarm(expiresAt);

        if (origin === null) await this.state.storage.delete("origin");
        else if (origin) await this.state.storage.put("origin", origin);

        return new Response(undefined, { status: 201 });
      }
      case "HEAD": {
        // > A request unit is defined as 4 KB of data read or written. A
        // > request that writes or reads more than 4 KB will consume multiple
        // > units, for example, a 9 KB write will consume 3 write request units.
        // https://developers.cloudflare.com/durable-objects/platform/pricing/

        // I would prefer not to be reading `data` for the reason above.
        // In dev, I was experiencing a bug where the alarm was `null` for
        // links that still had data associated with them. Therefore, just to
        // ensure this doesn't happen, we check data if the alarm supposedly
        // doesn't exist.
        // Give us `storage.has()`!

        const alarm = await this.state.storage.getAlarm();
        if (alarm !== null) {
          return new Response(null, { status: 200 });
        }
        const data = await this.state.storage.get<QueryData>("data");
        if (data) {
          // Does this really happen in prod?
          const expiresAt = await this.state.storage.get<string>("expiresAt");
          if (expiresAt) {
            await this.state.storage.setAlarm(new Date(expiresAt));
          }
        }
        return new Response(null, { status: data ? 200 : 404 });
      }
      case "GET": {
        const data = await this.state.storage.get<QueryData>("data");
        const origin = await this.state.storage.get<string>("origin");
        if (!data) {
          const { shareId: id } = zxParseQuery(request, {
            shareId: z.string(),
          });
          const key = `share-${id}`;
          const { value: shortened, metadata } =
            await this.env.KV.getWithMetadata<KVShortenedData>(key, {
              type: "json",
            });
          if (shortened) {
            const { expiresAt } = metadata as { expiresAt?: string };
            return json({
              data: JSON.parse(shortened.data) as QueryData,
              alarm: expiresAt
                ? new Date(expiresAt).getTime()
                : new Date().getTime(),
              origin: shortened.origin,
            });
          }

          const expiredAt = await this.state.storage.get<string>("expiresAt");
          return json(
            {
              message: "No shortened data with that ID. It may have expired.",
              expiredAt,
            },
            404,
          );
        }
        const alarm = await this.state.storage.getAlarm();
        return json({ data, alarm, origin });
      }
      case "DELETE": {
        await this.alarm();
        return new Response(undefined, { status: 204 });
      }
    }

    return new Response(null, { status: 405 });
  }

  async alarm() {
    await this.state.storage.deleteAll();
  }
}

export const putShareLink = async (
  env: Env,
  shareId: string,
  data: QueryData,
  expiresAt: Date,
  origin?: string,
) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  await stub.fetch("http://do/", {
    method: "PUT",
    body: JSON.stringify({
      data,
      expiresAt,
      origin,
    }),
    headers: { "Content-Type": "application/json" },
  });
};

export const getShareLinkExists = async (env: Env, shareId: string) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  const response = await stub.fetch("http://do/", { method: "HEAD" });
  return response.ok;
};

export const getShareLink = async (env: Env, shareId: string) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  const response = await stub.fetch(`http://do/?shareId=${shareId}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw response;
  }
  const raw = (await response.json()) as {
    data: QueryData;
    alarm: number;
    origin?: string;
  };
  return raw;
};

export const deleteShareLink = async (env: Env, shareId: string) => {
  const id = env.SHARE_LINKS.idFromName(shareId);
  const stub = env.SHARE_LINKS.get(id);
  const response = await stub.fetch(`http://do/?shareId=${shareId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw response;
  }
};
