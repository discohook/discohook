# bouncer

Serverful mini-server that can wait indefinitely (as configured) to pause or 'bounce' a multi-step flow started on a worker. Discohook is in a sort of unique situation in that it needs to execute long processes in response to a service which will only allow 3 seconds before a timeout, so it must use `waitUntil()` which does not allow unlimited wall time.

### Workflow

Assume a user has defined a flow (for a component/trigger) with these actions:
1. Send Message
2. Wait 900 seconds (15min)
3. Delete Message

If Discohook attempts to wait 900 seconds in a `waitUntil()`, Cloudflare will eventually kill the process and the flow will not reach step 3. Instead, consider the following:

1. User presses a button
2. Discohook reads the flow actions
3. Before executing any actions, Discohook sums the longest possible wait time. If it is sufficiently long, a request is sent to `bouncer` with the current state of the flow + authorization and the flow returns (the `waitUntil()` is now over).
4. The `bouncer` server immediately sends the same state back in a new request to the bot worker. Instead of deferring, `bouncer` can keep this connection open which allows Discohook to execute the remainder of the flow for as long as it wants, since Cloudflare imposes "no hard limit" for "as long as the client that sent the request remains connected"[1].

If a flow can be executed without bouncing, it will avoid doing so in order to reduce latency.

### Why not a Durable Object alarm?

1. Expensive
2. There is a hard 15 minute limit imposed on alarm duration

### References

- [1] https://developers.cloudflare.com/workers/platform/limits/#duration

### Develop

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
