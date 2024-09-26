import { json } from "@remix-run/cloudflare";
import { BRoutes } from "~/api/routing";
import { getUserId } from "~/session.server";
import { Env } from "~/types/env";
import { Context } from "~/util/loader";

// Modified from https://developers.cloudflare.com/durable-objects/examples/build-a-rate-limiter

interface BucketConfig {
  /** Max. requests in the bucket */
  capacity: number;
  /** Bucket time limit (`capacity` requests per `seconds`) */
  seconds: number;
}

const apiBuckets: Partial<
  Record<RateLimitBucketName, Record<string, BucketConfig>>
> & { global: Record<string, BucketConfig> } = {
  global: {
    POST: { capacity: 50, seconds: 5 },
    GET: { capacity: 50, seconds: 5 },
    PATCH: { capacity: 50, seconds: 5 },
    PUT: { capacity: 50, seconds: 5 },
    DELETE: { capacity: 50, seconds: 5 },
    "*": { capacity: 50, seconds: 5 },
  },
  share: {
    GET: { capacity: 20, seconds: 5 },
    POST: { capacity: 20, seconds: 5 },
    PATCH: { capacity: 20, seconds: 5 },
  },
  guildWebhooks: {
    GET: { capacity: 10, seconds: 10 },
  },
  guildWebhooksForce: {
    GET: { capacity: 1, seconds: 120 },
  },
};

const getBucketInfo = (method: string, bucket: string) => {
  const root = apiBuckets[bucket as keyof typeof apiBuckets];
  if (!root) {
    return null;
  }
  const inner = root[method] ?? root["*"];
  if (!inner && bucket !== "global") {
    const global = apiBuckets.global;
    return global[method] ?? global["*"] ?? null;
  }
  return inner ?? null;
};

const getRps = (bucket: BucketConfig): number =>
  bucket.capacity / (bucket.seconds ?? 1);

const KEY_RE =
  /^(?<method>\w+):(?<bucket>\w+):(?<idScope>id|ip):(?<idValue>.+)$/;

export type ExtraRateLimitBucketName = "guildWebhooksForce";

export type RateLimitBucketName =
  | keyof typeof BRoutes
  | ExtraRateLimitBucketName;

export const getBucket = async (
  request: Request,
  context: Context,
  bucket?: RateLimitBucketName, // we should determine this from the url
) => {
  const userId = await getUserId(request, context);
  const ip = request.headers.get("CF-Connecting-IP");
  if (!userId && !ip) {
    throw json(
      { message: "Could not identify client (unauthorized & undetermined IP)" },
      400,
    );
  }
  const idKey = userId ? `id:${userId}` : `ip:${ip}`;

  const globalKey = `${request.method}:global:${idKey}`;
  const globalId = context.env.RATE_LIMITER.idFromName(globalKey);
  const globalStub = context.env.RATE_LIMITER.get(globalId);
  const globalResponse = await globalStub.fetch(
    `http://do/?${new URLSearchParams({ key: globalKey })}`,
    { method: "GET" },
  );
  // biome-ignore lint/style/noNonNullAssertion: Global always exists
  const globalBucketInfo = getBucketInfo(request.method, "global")!;

  const { ms: gMs, remaining: gRemaining } = (await globalResponse.json()) as {
    ms: number;
    remaining: number;
  };

  const globalHeaders = {
    "Retry-After": String(Math.ceil(gMs / 1000)),
    "X-RateLimit-Limit": globalBucketInfo.capacity.toString(),
    "X-RateLimit-Remaining": gRemaining.toString(),
    "X-RateLimit-Name": "global",
  };
  const routeHeaders: Record<string, string> = {};

  const body = { message: "Rate limit exceeded" };

  if (bucket && apiBuckets[bucket]) {
    // Don't double-trigger the global bucket when a local bucket can't be found

    const key = `${request.method}:${bucket}:${idKey}`;
    const id = context.env.RATE_LIMITER.idFromName(key);
    const stub = context.env.RATE_LIMITER.get(id);
    const response = await stub.fetch(
      `http://do/?${new URLSearchParams({ key })}`,
      { method: "GET" },
    );
    const { ms, remaining } = (await response.json()) as {
      ms: number;
      remaining: number;
    };
    // biome-ignore lint/style/noNonNullAssertion: If check above
    const bucketInfo = getBucketInfo(request.method, bucket)!;

    routeHeaders["Retry-After"] = String(Math.ceil(ms / 1000));
    routeHeaders["X-RateLimit-Limit"] = Math.min(
      bucketInfo.capacity,
      globalBucketInfo.capacity,
    ).toString();
    routeHeaders["X-RateLimit-Remaining"] = Math.min(
      remaining,
      gRemaining,
    ).toString();
    routeHeaders["X-RateLimit-Name"] = bucket;

    if (gMs > 0 && gMs > ms) {
      throw json(body, {
        status: 429,
        headers: globalHeaders,
      });
    }
    if (ms > 0) {
      throw json(body, {
        status: 429,
        headers: routeHeaders,
      });
    }
    if (ms === gMs) {
      if (getRps(bucketInfo) < getRps(globalBucketInfo)) {
        return routeHeaders;
      } else {
        return globalHeaders;
      }
    } else if (ms > gMs) {
      return routeHeaders;
    }
  }

  if (gMs > 0) {
    throw json(body, {
      status: 429,
      headers: globalHeaders,
    });
  }

  return globalHeaders;
};

export class RateLimiter implements DurableObject {
  bucket: string | null = null;
  milliseconds_per_request = 1;
  milliseconds_for_updates = 5000;
  capacity = 10000;
  tokens: number | null = null;

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    if (this.tokens === null) {
      const params = new URL(request.url).searchParams;
      const key = params.get("key");
      if (!key) {
        throw new Error("No bucket key provided (use `key` param)");
      }
      const match = KEY_RE.exec(key);
      if (!match?.groups) {
        throw new Error("Invalid bucket key");
      }

      const { method, bucket } = match.groups;
      const bucketInfo = getBucketInfo(method, bucket);
      if (!bucketInfo) {
        throw new Error("Could not resolve bucket");
      }

      this.bucket = bucket;
      this.milliseconds_per_request = bucketInfo.seconds * 1000;
      this.capacity = bucketInfo.capacity;
      this.tokens = bucketInfo.capacity;
    }

    if (request.method === "GET") {
      this.checkAndSetAlarm();

      let milliseconds_to_next_request = this.milliseconds_per_request;
      if (this.tokens !== null && this.tokens > 0) {
        this.tokens -= 1;
        milliseconds_to_next_request = 0;
      }

      return json({
        ms: milliseconds_to_next_request,
        bucket: this.bucket,
        remaining: this.tokens ?? 0,
      });
    }
    return new Response(null, { status: 204 });
  }

  private async checkAndSetAlarm() {
    const currentAlarm = await this.state.storage.getAlarm();
    if (currentAlarm == null) {
      this.state.storage.setAlarm(
        Date.now() +
          this.milliseconds_for_updates * this.milliseconds_per_request,
      );
    }
  }

  async alarm() {
    if (this.tokens !== null && this.tokens < this.capacity) {
      this.tokens = Math.min(
        this.capacity,
        this.tokens + this.milliseconds_for_updates,
      );
      this.checkAndSetAlarm();
    }
  }
}
