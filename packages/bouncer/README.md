# bouncer

Serverful mini-server that can wait indefinitely (as configured) to resume a multi-step flow started on a worker. Discohook is in a sort of unique situation in that it needs to execute long processes in response to a service which will only allow 3 seconds before a timeout, so it must use `waitUntil()` which does not allow unlimited wall time.

### Workflow

Assume a user has defined a flow (for a component/trigger) with these actions:
1. Send Message
2. Wait 900 seconds (15min)
3. Delete Message

If Discohook attempts to wait 900 seconds in a `waitUntil()`, Cloudflare will eventually kill the process and the flow will not reach step 3. Instead, consider the following execution:

1. Send Message
2. Wait 900 seconds
  - Discohook sees that this is a particularly long time, and instead of sleeping, sends a request to the `bouncer` server telling _it_ to wait. Included in the request is details about the current state of the flow execution + authorization. The worker is now finished executing code for this request.
  - After 900 seconds have passed, minus latency and processing delay, `bouncer` sends a "resume" request back to Discohook with the same flow state and its own authorization. Instead of deferring, `bouncer` can keep this connection open which allows Discohook to execute the remainder of the flow for as long as it wants, since Cloudflare imposes "no hard limit" for "as long as the client that sent the request remains connected".
3. Delete Message

The default configuration is a minimum of 60 seconds and a maximum of 2 hours, but Discohook doesn't currently allow flows to be created which wait that long.

### Why not a Durable Object alarm?

1. Expensive
2. There is a hard 15 minute limit imposed on alarm duration

### References

- https://developers.cloudflare.com/workers/platform/limits/#duration

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
