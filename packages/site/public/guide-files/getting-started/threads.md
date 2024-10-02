---
title: "Threads"
description: "Utilize sub-channels with your webhooks"
---

# Threads

When editing your webhook message, you may notice the "Thread" section under the content box, which contains two input boxes: "Forum Thread Name" and "Thread ID". Here's what they mean:

## Forum Thread Name

If your webhook is in a forum channel (only threads), you can use this to create a new post in the forum with the name you specified. If you type in a thread name, you cannot also specify a thread ID (in the other input).

## Thread ID

If your webhook is in a text channel or forum channel, you can use this to send a message to a thread that already exists in your server. When using this, you cannot also specify a thread name (in the other input).

The value here needs to be Discord's identifier for the thread. You can use [our bot](discohook://bot) to get this with the </id channel:1> command, or you can [copy the ID manually](https://support.discord.com/hc/en-us/articles/206346498).
