import type { Serve } from "bun";
import { AutoRouter, type IRequest, json } from "itty-router";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

const USER_AGENT =
  "discohook-bouncer/1.0.0 (+https://github.com/discohook/discohook)";

const getIp = (request: IRequest) => {
  const g = (name: string) => request.headers.get(name);
  return (
    g("X-Real-IP") ?? g("X-Forwarded-For") ?? g("Client-IP") ?? g("Forwarded")
  );
};

const router = AutoRouter({
  before: [
    async (request) => {
      const token = request.headers.get("Authorization");
      if (!token) {
        console.log("401:", getIp(request));
        return json({ message: "Unauthorized" }, { status: 401 });
      }

      const key = new TextEncoder().encode(Bun.env.JWT_KEY);
      try {
        await jwtVerify(token, key, {
          issuer: "discohook:bot",
          audience: "discohook:bouncer",
        });
      } catch {
        console.log("403:", getIp(request));
        return json({ message: "Forbidden" }, { status: 403 });
      }
      console.log(
        `OK Auth: ${request.method} ${new URL(request.url).pathname} from ${getIp(request)}`,
      );
    },
  ],
});

let ping: {
  at: number;
  latency: number;
} | null = null;

const now = () => new Date().valueOf();

router.post("/flow/pause", async (request) => {
  const received = now();
  const data = await z
    .object({
      until: z
        .number()
        .int()
        // 60s - 2hr
        .min(received + 60_000)
        .max(received + 7_200_000)
        .optional(),
      payload: z.object({}).passthrough(),
    })
    .parseAsync(await request.json());

  // after 1 hour
  if (!ping || now() - ping.at > 3_600_000) {
    // re-measure latency for better precision. this doesn't take into account
    // overhead like token verification. the purpose of this is to send the
    // final request at the `until` time minus the latency recorded below such
    // that the server receives it _at the `until` time_ and is able to then
    // process it immediately, making the whole thing appear faster.
    // Unfortunately there is no guarantee that the two systems' clocks are
    // sufficiently synced but we just have to assume that it's negligible.
    const bench1 = now();
    await fetch(Bun.env.BOT_ORIGIN, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT },
    });
    const bench2 = now();
    ping = {
      at: bench1,
      latency: bench2 - bench1,
    };
  }

  const key = new TextEncoder().encode(Bun.env.JWT_KEY);
  const jwt = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("discohook:bouncer")
    .setAudience("discohook:bot")
    .setExpirationTime("1 minute")
    .sign(key);
  const resumeRequest = new Request(`${Bun.env.BOT_ORIGIN}/flow/resume`, {
    method: "POST",
    body: JSON.stringify({ payload: data.payload }),
    headers: { Authorization: jwt, "User-Agent": USER_AGENT },
  });

  const startSleeping = async (until: number, pingLatency: number) => {
    const processingLatency = now() - received;
    await Bun.sleep(new Date(until - pingLatency - processingLatency));

    // this should never allow a timeout so that the worker can run for as
    // long as it wants
    // https://developers.cloudflare.com/workers/platform/limits/#duration
    const response = await fetch(resumeRequest);
    if (!response.ok) {
      console.log(await response.json());
    }
  };

  if (data.until !== undefined) {
    startSleeping(data.until, ping.latency);
  } else {
    (async () => {
      const response = await fetch(resumeRequest);
      if (!response.ok) {
        console.log(await response.json());
      }
    })();
  }
  return new Response(null, { status: 204 });
});

export default {
  // shouldn't affect our sleep timeout or the
  // indefinitely-long resume request
  idleTimeout: 20,
  fetch: router.fetch,
} satisfies Serve;
