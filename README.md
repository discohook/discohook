# Discohook

Simple, free, and highly versatile message designer for Discord webhooks.

## Feature comparison

This is a complete rewrite of the original [Discohook](https://github.com/discohook/site) project by @maddysrc, now under new ownership. Here's what's new.

- Extended Markdown support: headers, lists, timestamps, ~~mentions~~, message links
- Cloud backups
- Message logs
- Editor history
- Button/select editor
- Localization
- Reordering messages
<!-- - Mobile-specific preview toggle for ironing out Discord inconsistencies -->
<!-- - Scheduled messages -->
<!-- - Custom bots -->

## Meta

This monorepo comes in three main parts:

- [site](/packages/site) - The Discohook website
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
