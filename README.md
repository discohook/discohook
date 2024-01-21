# Boogiehook

The spiritual successor to [Discohook](https://github.com/discohook).

## Meta

This monorepo comes in three main parts:

- [site](/packages/site) - The Boogiehook website
- [bot](/packages/bot) - Handles Discord interactions & proxied gateway events
- [bot-ws](/packages/bot-ws) - Proxies gateway events to `bot`

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
