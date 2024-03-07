# discohook-bot-ws

A minimal application designed to fulfill the gaps left by the Discohook bot after the move to HTTP-only commands, encapsulating the majority of the featureset in conjunction with the main site.

## Manifesto

I didn't want to create a tertiary portion of this application that relies on the gateway due to complications with the previous iteration (née Discohook Utils). As mentioned above, most of the bot is no longer on the gateway and thusly relies very little on the type of caching that was being done by my library. Nonetheless, some offerings of this application can only be fulfilled by a gateway connected process, and I would much rather continue offering them than cut them out entirely.

I have attempted to turn this *situation* into an ✨ opportunity ✨ to take advantage of the niceties that come with having a gateway connection.

### Goals

- Minimize CPU and RAM usage, especially considering prior caching-pain-points like guilds, channels, roles, and emojis
- Compartmentalize features and reduce downtime

## Current Features

- Custom status showcasing the bot site (nice-to-have)
- Selective gateway event proxy to a sibling worker instance

## Setup

1. Clone the repository. CD to project root. Run `yarn` / `npm install`
2. Create your `.env` file. Specify the following variables:
  - `DISCORD_TOKEN` - your bot token. must be the same as the one configured for your worker application
  - `WORKER_ORIGIN` - the URL origin (`https://example.com`, no path) of your worker application. your bot token is sent to this process in order to verify requests
3. Run `yarn bot` / `npm run bot`
