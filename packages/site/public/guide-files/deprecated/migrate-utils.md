---
title: "Migrating from Discobot"
description: "Discohook Utils is no longer a separate service!"
---

:wave: Hello there, please read below if you use Discohook or Discohook Utils! Also read the [updated legal documents](discohook://legal)!

# What's the difference between Discohook and Discohook Utils?

In 2024, Discohook and Discohook Utils merged into one service. "Discohook" may refer to this website or its Discord bot. We now use Discohook Utils#4333 as our primary bot account.

# Do I need to do anything if I already use Discohook Utils?

As far as your buttons go, you may need to run </buttons migrate:1> to manually migrate your messages, but it may be done automatically as well. After you have ensured a successful migration, you can bask in the new and improved suite of functionality at your disposal.

# I still have reaction roles with Discobot, not Discohook Utils

**Watch out:** You shouldn't remove Discobot if you still have webhooks in your server that it created. Doing so will also delete those webhooks.

Simply invite Discohook Utils to your server, ensure it has proper permissions (role position is above all reaction roles, has the manage roles permission), then remove Discobot if it does not have any webhooks. Your reaction roles will continue working, but the Discohook Utils bot will be used to manage them.

If you only need Discobot for its webhooks and not for reaction roles, you should remove its ability to view channels so that it leaves everything to Discohook Utils instead. You can use Discohook Utils to manage and access webhooks created by Discobot.

# Can I still use the old Discohook?

The previous version of Discohook will still be accessible at discohook.org for a little while. After we have fully migrated, discohook.org will begin redirecting, but your backups will always be migratable.

## But what about my backups?

New backups are not stored on your browser, and are now instead stored in the cloud, available everywhere you are signed in with your Discord account - but we do still encourage you to keep offline backups somewhere on your computer!

If you have backups on Discohook.org, [click here to link them to your account.](discohook://me/import-org-backups)
