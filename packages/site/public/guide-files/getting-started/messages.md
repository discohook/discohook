---
title: "Messages and the Editor"
description: "How to design, send, & edit messages through Discohook"
---

# Messages and the Editor

If this is your first time using Discohook, you may be confused by the extensive editor options at your disposal. Fear no longer!

## The Editor

When you see someone refer to "the editor", that means the left pane of the discohook.app site. It's where you will entirely design and send your messages. The right side, visible at the same time on wide screens or with a button on mobile, is the preview pane and just shows you what your message will look like when it's sent to Discord.

## Editor options

If you open a [new Discohook tab](discohook://), you'll see the default message meant to introduce you to Discohook. At the very top of the editor pane is two rows of buttons:

![](discohook://help/editor/top_row.png)

Here's what each of these buttons does:
- **Share:** Creates a temporary shortlink which other people can click on to see the current editor content. This is also used for creating message buttons via the Discohook Utils bot.
- **Backups:** Opens a menu that shows you all of your saved backups & lets you create a new one using the current editor content.
- **Clear All:** Deletes everything in the editor and presents you with a blank editor.
- **Add Webhook:** Lets you add a webhook to use to send the message. We'll get to this one later.
- **Send:** This one sends the message into Discord.

Navigate further down to the box labeled "Content". This is the plain text shown right below the webhook name. Importantly, this is the only text in the message that can contain pings - embeds can have mentions, but they won't send any notifications to the people you try to mention.

Below content, you'll see "Thread", "Profile", and "Files".
- **Thread:** [Read about this one here](discohook://guide/getting-started/threads)
- **Profile:** Sets the username and avatar of the webhook for just this message. This can be used to overwrite the details you may have in the channel settings where your webhook was created.
- **Files:** Can be used to attach files from your computer to send with the message. By default, all files appear in between content and embeds, but you'll see later how you can use this to upload new images that display inside embeds.

At this point, if you pressed "Clear All", you'll be out of things in the message to look at. To create an embed, click the "Add" dropdown and select the "Add Embed" option. Most of the options here are pretty self explanatory (if you're unsure, just try entering some text and look at where it shows up in the preview) - so here are some highlights:

### One of my images doesn't show up

If it's an author icon URL or a footer icon URL, there needs to be a value in the name/text box in order for Discord to display it.

If you've copied an image URL from another site, notably Google, Pinterest, Tenor, or Giphy, make sure you copied the *direct image URL* instead of the page link. Usually these end in an image extension like `.png`/`.jpg`/`.webp`/`.gif`. To make sure you have a direct URL, you can right click the image and click "Copy image address". On mobile devices, you can usually long-press the image and see a button to copy the link.

### How do I upload an image and use it in an embed? or: My external images just aren't working

In the "Files" section, mentioned above, upload an image file. You'll see it pop up under the files header and in the preview above your embed. Now go down to the slot in the editor where you want the image to live. You may notice that the little "File" button is no longer grayed out! Press it and select the file you just uploaded. It greets you by nestling into the embed in the preview.

![](discohook://help/editor/embed_attachment.mp4)

## Adding webhooks & sending messages

This page is a work in progress! If you have questions, feel free to join the support server linked in the help menu.
