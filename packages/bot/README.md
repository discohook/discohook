# Discohook Bot (formerly Discohook Utils)

## Setup

Due to the complexity of this project, I recommend that you do not do this, *especially* if you have not done something similar before! Instead, invite the instance of the bot that I host. [It's quick and easy!](https://discohook.app/bot)

### Attribution

This repository is based on a fork of [Discord's Cloudflare Workers sample app](https://github.com/discord/cloudflare-sample-app), thank you to the contributors!

### Configuring project

Create a [Discord app](https://discord.com/developers/applications). You will need the application ID, public key, and bot token.

### Creating your Cloudflare worker

Next, you'll need to create a Cloudflare Worker.

- Visit the [Cloudflare dashboard](https://dash.cloudflare.com/)
- Click on the `Workers` tab, and create a new service using the same name as your Discord bot

### Running locally

First clone the project:

```
git clone https://github.com/discohook/discohook.git
```

Then navigate to the bot directory and install all dependencies:

```
cd discohook/packages/bot
yarn install
```

> ⚙️ The dependencies in this project require at least v18 of [Node.js](https://nodejs.org/en/).

#### Local configuration

> 💡 More information about generating and fetching credentials can be found [in the tutorial](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers#storing-secrets)

Rename `example.dev.vars` to `.dev.vars`, and make sure to set each variable.

#### Register commands

The following command only needs to be run once:

```
$ yarn register
```

#### Run app

Now you should be ready to start your server:

```
$ yarn dev
```

### Deploying app

This repository is set up to automatically deploy to Cloudflare Workers when new changes land on the `main` branch. To deploy manually, run `npm run publish`, which uses the `wrangler publish` command under the hood. Publishing via a GitHub Action requires obtaining an [API Token and your Account ID from Cloudflare](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/authentication/#generate-tokens). These are stored [as secrets in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), making them available to GitHub Actions. The following configuration in `.github/workflows/ci.yaml` demonstrates how to tie it all together:

```yaml
release:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  needs: [test, lint]
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm install
    - run: npm run publish
      env:
        CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
```

#### Storing secrets

The credentials in `.dev.vars` are only applied locally. The production service needs access to credentials from your app:

```
$ wrangler secret put DISCORD_TOKEN
$ wrangler secret put DISCORD_PUBLIC_KEY
$ wrangler secret put DISCORD_APPLICATION_ID
```

##### Tokens for other bots

If you want the bot to be able to access webhook tokens created by other applications, supply a mapping of application ID to bot token as the `APPLICATIONS_RAW` environment variable. This will be parsed on fetch as `APPLICATIONS`.
