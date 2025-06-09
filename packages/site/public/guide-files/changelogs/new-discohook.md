---
title: "New Discohook - 2024 rewrite"
description: "The good times are here"
---

Here's a list of things that happened in this update.

# Meta

Discohook is now maintained by @catshay (you may know me from Discohook Utils!). Also, the entire project was completely rewritten, and the source is now available at [discohook/discohook](https://github.com/discohook/discohook). The old [site](https://github.com/discohook/site) and [bot](https://github.com/discohook/bot) repositories will be archived.

Naturally, Discohook and Discohook Utils have merged. [Read more about this here](discohook://guide/deprecated/migrate-utils).

# New Features

## Editor

- [Localization](https://translate.shay.cat/engage/discohook/) (thank you so much to our lovely translators who helped translate before this update released - maddymeows (dutch), mew610 (arabic), & anon (chinese))
- Embeds now support the `attachment://` URI ([site#90](https://github.com/discohook/site/issues/90))
- Webhooks can now be selected from your list of servers while logged in, or created straight from Discohook ([site#25](https://github.com/discohook/site/issues/25))
- Server data like channels, emojis, and roles are now loaded for mentioning when you add a webhook ([site#35](https://github.com/discohook/site/issues/35))
- Messages can now be rearranged while editing ([site#51](https://github.com/discohook/site/issues/51))
- A thread ID for editing messages can now be set in the same section as the forum thread name ([site#65](https://github.com/discohook/site/issues/65))

## Markdown

- Headers ([site#92](https://github.com/discohook/site/issues/92))
- Footers (`-# subtext`)
- Lists
- Message links
- Mentions
- Timestamps ([site#49](https://github.com/discohook/site/issues/49))
- Server-channel mentions like <id:browse> ([site#86](https://github.com/discohook/site/issues/86))

## Backups

- Now stored by Discohook rather than in the user's browser storage ([site#23](https://github.com/discohook/site/issues/23))
- Can be scheduled to send at specific times as well as on repeating schedules ([site#10](https://github.com/discohook/site/issues/10))

## Components (buttons)

- Can now be created in the Discohook editor as well as through the bot
- Select menus can now be created
- Can now send messages with other components already attached
- Can now do [a lot more stuff](discohook://guide/getting-started/flows)

## Deluxe

We now offer a [premium subscription](discohook://donate)! It's completely optional and nothing has been paywalled that was previously free.

# Fixed Bugs

- Creating a webhook with </webhook create:1> while in a forum thread will no longer error, instead it will create the webhook in the parent forum channel.
- JSON editor will no longer clear pasted embed content ([site#46](https://github.com/discohook/site/issues/46))

# Changes

- The confirmation for deleting a webhook with </webhook delete:1> is now hidden.
- The two-pane (traditionally desktop-only) editor layout is now dependent on screen width, not device, and can be forcibly enabled
