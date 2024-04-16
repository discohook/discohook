# Discohook

Simple, free, and highly versatile message designer for Discord webhooks.

## Feature comparison

This is a complete rewrite of the [original Discohook project](https://github.com/discohook/site) by [@maddysrc](https://github.com/maddysrc), now under new ownership. Here's what's new.

- Extended Markdown support: headers, lists, timestamps, mentions, message links
- Cloud backups
- Message logs
- Editor history
- Button/select editor
- Localization
- Reordering messages
- Scheduled messages
- Attachment URI support
<!-- - Mobile-specific preview toggle for ironing out Discord inconsistencies -->
<!-- - Custom bots -->

## Free?

Discohook is free, but you are encouraged to [donate and get extra perks](https://discohook.app/donate)!

## Meta

This monorepo comes in a few main parts:

- [site](/packages/site) - The Discohook website
- [bot](/packages/bot) - Handles Discord interactions & proxied gateway events
- [bot-ws](/packages/bot-ws) - Proxies gateway events to `bot`
- [magic-backup-importer](/packages/magic-backup-importer) - Hosted on a domain where users may have local backups stored (`site` redirects here and vice versa)
- [my](/packages/my) - Hosted on a subdomain or shorter domain, used for redirecting to `/link/...`

Along with some shared packages:

- [store](/packages/store) - Database & KV utilities

## Attribution

### Translations

| Thanks to | Language(s) |
|-----------|-------------|
| anonymous | Chinese     |
| mew610    | Arabic      |

### Original Project

Big thanks to [@maddysrc](https://github.com/maddysrc) and [@crawron](https://twitter.com/Crawron) for creating the original Discohook project in 2019 and later working with me to gracefully transfer ownership after 5 years.

## Development

### Contributing

Before submitting your pull request, please remember to run `npx biome check .` to check for errors, then `yarn fix` to format. This repository uses [Biome](https://biomejs.dev), not ESLint/Prettier. You may also want to install the [Biome extension for your editor](https://biomejs.dev/guides/integrate-in-editor).

As far as style preferences not covered by the [Biome configuration](/biome.json):

- Use `n += 1` rather than `n++`

### Bot

Run `yarn dev:bot` to start a miniflare server for the "primary" portion of the bot. In another terminal window, run `yarn ngrok:bot` to forward local port `8787` to Ngrok. Copy the logged `Forwarding` address to your bot application's Interactions Endpoint URL field.

If you would also like to work on gateway event processing (the logic for which is contained in the primary portion), you will need to run `yarn bot-ws` to start an instance of the gateway-connected bot. Be sure to define the required environment variables [as described in its README](/packages/bot-ws/README.md#setup). While testing, use the Ngrok URL from above as your `WORKER_ORIGIN` so that you can use the Ngrok web interface to replay events.

### Site

Run `yarn dev:site` to start a miniflare server for the site. An `ngrok:site` script is provided for convenience, but it is not necessary as you can just visit http://localhost:8788 for testing.

If you want to develop `magic-backup-importer`, also run `yarn dev:backups` after [setting up its environment](/packages/magic-backup-importer/README.md#development). This will be hosted on http://localhost:8789 by default. To save a backup to the local database, uncomment the execution of the `saveBackup()` method in the index route's `useEffect` callback.

## Deployment

This project relies on [Durable Objects](https://developers.cloudflare.com/durable-objects/), which is a feature exclusive to accounts on the Workers Paid plan, for message scheduling and persistent component callbacks (defined by users). If you do not want to subscribe to Workers Paid, you will have to remove these features in your fork.

Or, if you don't want to do either of those, consider joining the [support server](https://discohook.app/discord) and letting me know what you want to see in the main instance.
