# Discohook

Simple, free, and highly versatile message designer for Discord webhooks.

## Feature comparison

This is a complete rewrite of the [original Discohook project](https://github.com/discohook/site) by [@maddysrc](https://github.com/maddysrc), now under new ownership. [Read the full changelog](https://discohook.app/guide/changelogs/new-discohook).

## Free?

Discohook is free, but you are encouraged to [donate and get extra perks](https://discohook.app/donate)!

## Meta

This monorepo comes in a few main parts:

- [site](/packages/site) - The Discohook website
- [bot](/packages/bot) - Handles Discord interactions & proxied gateway events
- [bot-ws](/packages/bot-ws) - Proxies gateway events to `bot`
- [magic-backup-importer](/packages/magic-backup-importer) - Hosted on a domain where users may have local backups stored (`site` redirects here and vice versa)
- [link](/packages/link) - Hosted on a subdomain or shorter domain, used for redirecting to `/link/...`

Along with some shared packages:

- [store](/packages/store) - Database & KV utilities

## Attribution

### Translations

| Thanks to              | Language(s) | Progress |
|------------------------|-------------|----------|
| anonymous              | Chinese     | [![](https://translate.shay.cat/widget/discohook/-/zh_Hans/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/zh_Hans/) |
| mew610                 | Arabic      | [![](https://translate.shay.cat/widget/discohook/-/ar/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/ar/)           |
| maddymeows             | Dutch       | [![](https://translate.shay.cat/widget/discohook/-/nl/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/nl/)           |
| yaraej_                | Spanish     | [![](https://translate.shay.cat/widget/discohook/-/es/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/es/)           |
|                        | French      | [![](https://translate.shay.cat/widget/discohook/-/fr/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/fr/)           |
| dustytheonly, Kamfkeks | German      | [![](https://translate.shay.cat/widget/discohook/-/de/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/de/)           |
| ilprofilodineko        | Italian     | [![](https://translate.shay.cat/widget/discohook/-/it/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/it/)           |
| denyshon               | Ukranian    | [![](https://translate.shay.cat/widget/discohook/-/uk/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/uk/)           |
| Mathew Rozhdestvensky  | Russian     | [![](https://translate.shay.cat/widget/discohook/-/ru/svg-badge.svg)](https://translate.shay.cat/engage/discohook/-/ru/)           |

### Original Project

Big thanks to [@maddysrc](https://github.com/maddysrc) and [@crawron](https://twitter.com/Crawron) for creating the original Discohook project in 2019 and later working with me to gracefully transfer ownership after 5 years.

## Development

### Prerequisites: bindings

#### Hyperdrive (PostgreSQL)

The `DATABASE_URL` secret should be defined when developing as a connection string for a local PostgreSQL database. The `bot` and `site` packages will fill `env.HYPERDRIVE` such that it can be used in the `getDb` utility.

In production, this variable is not used. Instead, provide a connection string directly to the [Hyperdrive instance](https://developers.cloudflare.com/hyperdrive/) associated with the worker in wrangler.toml.

#### KV (Redis)

This project started out using Cloudflare KV, but it was exorbitantly expensive, so it now uses a self-hosted instance of [Valkey](https://valkey.io/) behind [Webdis](https://webd.is). In the `bot` and `site` packages, you will need to define a `REDIS_URL` secret that describes the credentials to your Webdis instance in a standard `redis://` URI format. See [Webdis's README](https://github.com/nicolasff/webdis#acl) on configuring access control.

`env.KV` is made available as a `RedisKV` instance, which is a custom class designed to mimic the behavior of `KVNamespace`.

### Contributing

Before submitting your pull request, please remember to run `npx biome check .` to check for errors, then `yarn fix` to format. This repository uses [Biome](https://biomejs.dev), not ESLint/Prettier. You may also want to install the [Biome extension for your editor](https://biomejs.dev/guides/integrate-in-editor).

As far as style preferences not covered by the [Biome configuration](/biome.json):

- Use `n += 1` rather than `n++`
- Prefer chaining schemas (`z.string().optional()`) over nesting (`z.optional(z.string())`)
- Prefer Drizzle callbacks where possible (`(table, { eq }) => eq(table.id, id)`) over importing individual tables and functions

### Bot

Run `yarn dev:bot` to start a miniflare server for the "primary" portion of the bot. To expose the local server to the internet so that Discord can request it, use the `tunnel` script in the bot directory (requires cloudflared to be installed). Once you're done with that, copy your tunneled URL to your Discord application's "Interactions Endpoint URL" field.

![interactions-endpoint](https://user-images.githubusercontent.com/534619/157510959-6cf0327a-052a-432c-855b-c662824f15ce.png)

If you would also like to work on gateway event processing (the "response" logic for which is contained in the primary portion), you will need to run `yarn bot-ws` to start an instance of the gateway-connected bot. Be sure to define the required environment variables [as described in its README](/packages/bot-ws/README.md#setup). While testing, use the Ngrok URL from above as your `WORKER_ORIGIN` so that you can use the Ngrok web interface to replay events.

### Site

Run `yarn dev:site` to start a miniflare server for the site.

If you want to develop `magic-backup-importer`, also run `yarn dev:backups` after [setting up its environment](/packages/magic-backup-importer/README.md#development). This will be hosted on http://localhost:8789 by default. To save a backup to the local database, uncomment the execution of the `saveBackup()` method in the index route's `useEffect` callback.

## Deployment

This project relies on [Durable Objects](https://developers.cloudflare.com/durable-objects/) for many core features, which is a product exclusive to accounts on the Workers Paid plan. If you do not want to subscribe to Workers Paid, you will have to remove these features in your fork.

Or, if you don't want to do either of those, consider joining the [support server](https://discohook.app/discord) and letting me know what you want to see in the main instance.
