import { json } from "@remix-run/cloudflare";
import { z } from "zod";
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
        await this.state.storage.put("expiresAt", expiresAt);
        await this.state.storage.setAlarm(expiresAt);

        if (origin === null) await this.state.storage.delete("origin");
        else if (origin) await this.state.storage.put("origin", origin);

        return new Response(undefined, { status: 201 });
      }
      case "HEAD": {
        // I would prefer not to be reading data but I was experiencing a bug
        // where the alarm was `null` for links that still had data associated
        // with them. This seems to be the only reliable method.
        const data = await this.state.storage.get<QueryData>("data");
        return new Response(undefined, { status: data ? 200 : 404 });
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

          const expiredAt = await this.state.storage.get<Date>("expiresAt");
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

    return new Response(undefined, { status: 405 });
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
