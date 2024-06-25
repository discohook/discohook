---
title: "Backups"
description: "A primer on Discohook's long-term message storage system"
---

# Backups

## Saving Backups

When using Discohook, click the "Save Message" button, right next to "Send". You'll see an option to save the current editor contents as a backup (if you are not already editing one). This data is stored on Discohook's server, and can be accessed on any device as long as you use the same Discord account.

## View & Edit Backups

On your [user page](https://discohook.app/me?tab=backups), you can see a list of all the backups you have saved. If one of your old button messages has been migrated, you may already have a few backups with names that look like "Button: <numbers>". This is because previously-named "custom message buttons" are now linked to Discohook backups, which you can edit at any time to modify the message sent by the component.

Click the pencil icon on any of your backups to edit the name and schedule. To edit the content of the backup, click the link button on the right to open it. As the notice at the top explains, autosave is enabled when editing backups. To manually save a backup (always a good idea before closing the tab), go back into the "Save Message" menu and select "Save".

## Scheduling

In the backup edit menu, enable "Schedule this backup". You will now be able to select a date and time for the backup to be sent one time. **If your backup does not have a webhook target saved along with it, nothing will happen when the set time occurs.**

### Repeating schedules

If you enable "Repeating", you will be shown a different form where you can set a schedule on which to send the backup. You cannot configure a backup to be sent more frequently than every 2 hours. Additionally, due to internal limitations, you cannot set configurations that differ a subset of the schedule depending on a superset. Here are a few examples:

- 12:00 AM and 4:30 AM
- Every Sunday of every month, but every Monday in September
- The 30th of every month, but the 28th in February
 - If you set a schedule to the 30th or 31st, it will be ignored in February.
