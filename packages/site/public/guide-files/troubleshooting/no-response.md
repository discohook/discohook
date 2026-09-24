---
title: "What to do when a flow does not respond"
description: "Why a button might leave you hanging"
---

## The component says "Application Did Not Respond" or "Interaction Failed"

The most common solution is to simply try again in a few seconds. If that doesn't work, it may be indicative of a server issue, in which case you should try again in a few minutes or hours.

Why this happens: Discohook has to take a while to prepare the response, and if it takes too long, Discord will reject it. This is a process that we are continually trying to speed up so that this doesn't happen. Trying again usually works because Discohook already prepared some of the response in the background.

## The component does nothing (no response whatsoever)

Discohook includes a helpful debugging tool that you can use to see where your flow might be failing.

1. If you are on mobile, long-press the message in Discord, go to "Apps", "Discohook Utils", then "Debug". If you are on desktop, right-click the message and navigate to the same menu.
2. If your message has interactive components and is from a webhook owned by Discohook, you will see a button labeled "Debug Components". Press it, then select the troublesome component from the menu that appears.
3. The new message will show the [responsible user](discohook://guide/troubleshooting/responsibility) for the component, which determines what permissions the flow is able to use. Now, press "Test Flow" or select an option to run the flow in real time and see logs after it completes or fails.

### Manual debugging tips

Identify what actions your flow has. Discord may be failing to process some of your data.

- If you have Send Message or Send Webhook Message actions:
  - Ensure the message is valid. You may have attached a local file (which is currently stored only on your browser) or you may simply have an invalid URL/too many characters. If you can't find anything wrong with it, join the [support server](discohook://discord) and we'll take a look.
  - Only if you are using the Send Webhook Message action:
    - Ensure the webhook you are using still exists and that Discohook Utils has the Manage Webhooks permission so that it can be accessed.
    - If you want to send a message in a thread, either set the [thread ID](discohook://guide/getting-started/threads) in the backup itself or create a variable with the name `threadId` whose value is the ID of the thread.

- If you have Add/Remove/Toggle Role actions:
  - First, check the bot's permissions. Discohook Utils needs the Manage Roles permission, and its highest role (the one that is at the top of its role list) must be *higher* than the role you are trying to manage (assign or remove).
  - If the bot has the appropriate permissions, next you should investigate the [responsible user](discohook://guide/troubleshooting/responsibility); whoever most recently edited the component. They need the same allowances that the bot must have, listed above, otherwise Discohook will refuse to manage the role for security.

- If you have Create Thread actions: Ensure both the [responsible user](discohook://guide/troubleshooting/responsibility) and the bot (Discohook Utils) has either Create Public Threads or Create Private Threads permissions, depending on which type you are creating.

## The trigger does nothing

It may be a misconfiguration or permissions error. If the trigger is a welcomer (Member Add/Member Remove), run </welcomer view:1>. The first two fields should have <:check:1263857933209571329> green checkmarks. If the configuration looks good, press "Send Test". Discohook will do a trial run of the flow and output an error message if anything went wrong.
