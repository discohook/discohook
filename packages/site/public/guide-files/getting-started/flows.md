---
title: "Flows"
description: "A primer on flows and actions in Discohook"
---

# Flows

Flows are what let your buttons, select menus, and triggers perform versatile strings of actions.

## What can flows do?

Here's a list of currently supported actions:

**Do nothing**
Useful for creating display buttons. If this is not the only action in the flow, there is no reason to use it.

**Wait for X seconds**
Pause for the specified number of seconds before continuing to the next action.

**Add role, Remove role, Toggle role**
Add, remove, or toggle a specified role for the user.

**Send message**
As a response to the interaction, send a message from one of your saved backups. Returns a [message](https://discord.com/developers/docs/resources/channel#message-object).

**Send webhook message**
Use a webhook to send a message from one of your saved backups. Returns a [message](https://discord.com/developers/docs/resources/channel#message-object).

**Create thread**
Create a thread in a specified channel. Returns a [thread](https://discord.com/developers/docs/resources/channel#channel-object-channel-structure).

**Set variable**
Assign a name to an arbitrary value up to 500 characters (static type), or to something returned by a previous action (adaptive type). Variables can be used later in actions like **Send message** and **Delete message**. Variables can be re-assigned multiple times.

If you're creating a static variable, the literal values "true" and "false" (without quotes) will evaluate to [boolean values](https://en.wikipedia.org/wiki/Boolean_data_type). Everything else is a string. For message templating, this doesn't matter; all values are cast to string.

If you're creating an adaptive variable, the "Attribute of previous return" you specify should match one of the attributes documented in a return type. For example, if the previous action was **Create thread**, you might want to set a variable with the name `threadId` with attribute `id`. This will let you mention the new thread in a message with the format `<#{threadId}>`, for something like a ticketing system.

**Delete message**
Delete the message with the ID defined as the `messageId` variable.

## How do I use flows?

Get started by adding a non-link button or a select menu to a message. Buttons can have one flow each, string select menus can have one flow per option (up to 25 options), and all other select menus can have one flow each, which applies to every  
