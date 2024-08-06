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

**Check**
Depending on whether a condition is true or false, run a sub-flow. You can execute one of the following functions to calculate the result:

- `And` - all inner functions must return true
- `Or` - at least one inner function must return true
- `Not` - all inner functions must return false
- `Equal` - the value of `a` must be equal to that of `b`
- `In` - the value of `element` must be contained within `array`, which must be a string parsable to a JSON array (like `["one","two","three"]`). such arrays are also returned by variables like `member.role_ids`, which is how one might check if a member has an arbitrary role (keep in mind that member state is partial for the member removal trigger)

**Stop**
Immediately halts the entire flow, even if this action is in a sub-flow. Optionally add a plain text string to attempt to deliver to the user - more limited than sending a backup but easier to set up and customize while editing the rest of your flow.

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

If you're creating a mirror variable, "Full prior variable name" should be the fully qualified reference for the variable you want to mirror. This includes the "scope" of the variable for [nested data](discohook://guide/getting-started/formatting), so if you want to mirror the server name, use `server.name` in this field. This type of variable is mostly only useful if you are creating an anonymous (no name) variable nested inside another action. Keep in mind that a mirror variable will not be updated if the original variable being mirrored has its value changed for any reason.

**Delete message**
Delete the message with the ID defined as the `messageId` variable.

## How do I use flows?

Get started by adding a non-link button or a select menu to a message. Buttons can have one flow each, string select menus can have one flow per option (up to 25 options), and all other select menus can have one flow each, which applies to every  
