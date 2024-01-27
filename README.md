# Boogiehook

The spiritual successor to [Discohook](https://github.com/discohook).

## Feature comparison

| Feature                   | Boogiehook                                       | Discohook                                               |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| MD: headers               | ✅                                               | ❌                                                      |
| MD: lists                 | ✅                                               | ❌                                                      |
| MD: timestamps            | ✅                                               | ❌                                                      |
| MD: mention infill        | ⌛                                               | ✅ [with extension](https://dutils.shay.cat/extension)  |
| MD: message links         | ✅                                               | ❌                                                      |
| Mobile-specific preview   | ⌛                                               | ❌                                                      |
| Load messages             | ✅                                               | ✅                                                      |
| Multiple targets          | ✅                                               | ✅                                                      |
| Guilded webhooks          | ✅ [with utils bot](https://dutils.shay.cat/bot) | ✅ [with utils bot](https://dutils.shay.cat/bot)        |
| Backups                   | ✅ stored in the cloud                           | ✅ stored in-browser                                    |
| Scheduled messages        | ⌛                                               | ✅ [with utils site](https://dutils.shay.cat/scheduler) |
| Message logs              | ✅                                               | ❌                                                      |
| Editor history            | ✅                                               | ❌                                                      |
| Edit & preview components | ✅                                               | ❌                                                      |
| Custom bot commands       | ❌                                               | ❌                                                      |
| Languages supported       | English (full), others (partial)                 | English (full)                                          |
| Reorder messages          | ✅                                               | ❌                                                      |

## Meta

This monorepo comes in three main parts:

- [site](/packages/site) - The Boogiehook website
- [bot](/packages/bot) - Handles Discord interactions & proxied gateway events
- [bot-ws](/packages/bot-ws) - Proxies gateway events to `bot`

Along with some shared packages:

- [store](/packages/store) - Database & KV utilities

## Development

### Bot

Run `yarn dev:bot` to start a miniflare server for the "primary" portion of the bot. In another terminal window, run `yarn ngrok:bot` to forward local port `8787` to Ngrok. Copy the logged `Forwarding` address to your bot application's Interactions Endpoint URL field.

If you would also like to work on gateway event processing (the logic for which is contained in the primary portion), you will need to run `yarn bot-ws` to start an instance of the gateway-connected bot. Be sure to define the required environment variables [as described in its README](/packages/bot-ws/README.md#setup). While testing, use the Ngrok URL from above as your `WORKER_ORIGIN` so that you can use the Ngrok web interface to replay events.

### Site

Run `yarn dev:site` to start a miniflare server for the site. An `ngrok:site` script is provided for convenience, but it is not necessary as you can just visit http://localhost:8788 for testing.
