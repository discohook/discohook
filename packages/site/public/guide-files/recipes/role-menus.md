---
title: "Role Menus"
description: "How to create role menus using components & flows"
---

# Role Menus

Here's how to create role menus using components & flows.

## Buttons

A simple button role setup with a response can be created with the following actions:

1. Toggle role
 - If you want the role to be add-only or remove-only, just choose "Add role" or "Remove role" instead
 - If you only want to allow the user to 
2. Stop
 - Provide "Content" with your message, which will be seen by the person who pressed the button
 - You will likely want to make the message hidden (select "Hidden (ephemeral)" in the "Flags" dropdown)

![](discohook://help/role_menu_button.png)

## Select Menus

Creating role menus with selects is just as easy as with buttons, but with a few extra steps.

1. Choose the type of select you want to use
 - A string select (just called "Select Menu") is the most common type, and probably the one you want to use for a role menu.
 - The other select types are auto-populated by Discord and allow the user to choose a resource from the server (like one of the server's members, roles, or channels). But beware: these select menus present all possible options and cannot be filtered. For example, you cannot create a Role Select Menu and tell Discord to only show 5 specific roles. You would need to create a regular select menu instead.
2. If you are using a string select: add an option, give it a label, and click "Edit Flow"
 - You don't need to edit "Value (hidden)", it exists just so Discohook can track which option was clicked
3. Otherwise: just click "Edit Flow"
 - This flow will be used for all options that the user can select
4. Create actions as described in the "Buttons" section above

![](discohook://help/select_options.png)
