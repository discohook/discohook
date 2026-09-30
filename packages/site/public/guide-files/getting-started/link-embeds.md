---
title: "Link Previews"
description: "How to use link previews to post embeds & containers in any server"
---

> <:pinkhook:1356993126513901599> This article is about a [Deluxe](discohook://donate) feature!

# Link Previews

Discohook's Link Preview editor can be used to create embeds and containers that you can post in any server, so long as you have the "Embed Links" permission. Most servers have this enabled for everyone or locked behind a low-level rank, but some servers do have it disabled entirely. Don't post link previews in servers where the moderators have made it apparent that they are not welcome.

## Create a Link Preview

Visit the [link preview editor](discohook://link) to get started. You will see an interface just like the main editor for webhook messages. You may notice some extra fields: redirect URL, embed provider, embed video, and a slider between "Embed" and "Container".

- Redirect URL: By default, when someone clicks on your link in Discord, they will just be shown the preview of the embed or container. If you set a redirect URL, they will be automatically taken to that link.
- (Embed) Provider: This is an extra bit of text that can be shown above the author name. It can be hyperlinked just like the author name!
- (Embed) Images: Up to four large images can be in a link embed, or one small thumbnail. The last 3 large images may not display on mobile devices.
- (Embed) Video: You can embed a YouTube, Vimeo, or plain (e.g. mp4) video in your link embeds just by pasting the link. This cannot be used simultaneously with images.

## Using Containers

If you've used the components-based editor on the main Discohook page, this is much the same. The only limitations are:

- No local attachments (use a remote URL instead, e.g. to Imgur or Discord CDN)
  - All images and videos must resolve within 10 seconds
  - The URL must be a maximum of 2,048 characters in length
  - Valid file formats for video: `.mp4`, `.webm`, and `.mov`
  - Valid file formats for images: `.png`, `.gif`, `.jpg`, `.jpeg`, `.webp`, and `.avif`
- No interactive components (link buttons are ok, other buttons & select menus are not)
- At most 10 media gallery items across the entire container. Thumbnails are exempt from that limit
- Smaller maximum text size than in webhook messages (this is hard to estimate, but Discohook will warn you when your container is getting too large)

If any of these limitations are violated, Discord may refuse to show the container, and fall back to the embed configuration instead (which you can set up separately if you wish).

## Post Your Link Preview

Enter a name for your link at the top and press "Save". The "Copy Link" button will light up--press it to get a link that you can paste in Discord. If you have the right permissions, your preview should appear within a few seconds!

Whichever tab (Embed or Container) you have active when you press "Save" is the one Discohook will try to show to Discord when your link is used, but both are saved simultaneously. So if you're trying to use a container, but have saved on the Embed tab, Discohook won't use the container data.

If you make any changes within about 30 minutes, you will need to copy the slightly modified link below the name box so that Discord knows it needs to refresh its data for that message. Old messages (that you haven't edited) will not refresh automatically.

Happy linking!
