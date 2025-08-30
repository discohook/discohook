# discohook/bot

## Build & start

See the [.env example](#env-example) and [config.json](#configjson) sections for setting up the necessary local files. This project uses [Bun](https://bun.sh), so you will need that installed - at least version 1.2.18.

After configuring, you can run `bun deploy` to register commands. Then run `bun start --cluster=x` to start the bot, where `x` is the zero-indexed number of the cluster. For example, if you have 4 clusters configured, you will need to run `bun start` four concurrent times with `--cluster=0` through `--cluster=3`.



#### .env example

```
DISCORD_APPLICATION_ID = "12345"
DISCORD_TOKEN = "abc123"
DISCOHOOK_ORIGIN = "https://discohook.app"
TOKEN_SECRET = "ghi789"
DATABASE_URL = "postgresql://..."
APPLICATIONS_RAW = {"67890":"def456"}
REDIS_URL = "redis://..."
GUILD_ID = "123"
DEV_GUILD_ID = "123"
DEV_OWNER_ID = "456"
```

#### config.json

Most of this file is populated automatically by the `config` script (`bun config:shards`), which you must run before starting the bot. However, also take care to provide a `clusters` value according to your needs. You will need to start several processes in accordance with the number of clusters you set here; if you set 4 clusters, for example, each process will only handle 25% of the shards.

Since Discohook Utils is sufficiently large to require "large bot sharding", we leave shard calculation up to Discord, which will automatically return a `shards` value that is a multiple of 16. However, if this is not desirable for you, you can instead call `bun config:shardless` to only populate the `url` value of this file, and you can write in `shards` yourself.

```json
{
  "url": "wss://gateway.discord.gg",
  "shards": 304,
  "clusters": 4
}
```
