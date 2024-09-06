---
title: "Message Buttons"
description: "How to create components that send hidden & public messages"
---

# Message Buttons

A simple message button/select setup can be achieved with the "Send message" action. After adding the action, you can choose from the backups available on your user account. If you aren't sure how to create a backup, see [Backups](discohook://guide/getting-started/backups). 

If the backup has more than one message, you'll see a "Message" dropdown with the list of messages that are in the backup. This tells Discohook which message you want to send. The "Random" option will choose a random message from the backup each time it's sent.

Finally, in the "Flags" section, you can choose to make the message hidden. This means that Discord will only show the message to the user who clicked the button, and is recommended for public info channels.

![](discohook://help/message_button_backups.png)

![](discohook://help/message_button_action.png)

For further customization, you can use "Send webhook message" instead of "Send message", but due to Discord limitations, webhook messages cannot be hidden. This action is mostly useful for sending messages into a different channel than the one where the button is located.
