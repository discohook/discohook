---
title: "Nesting Buttons"
description: "How to create components that send other components that do other things"
---

# Nesting Buttons

Discohook allows you to create component flows that will send a message with another component attached to it, which has its own flow and actions. This is called nesting components.

For this recipe, we'll set up a main message (Level 1), a subsequent message (Level 2) sent by a button on Level 1, and a third message (Level 3) that is sent by a button on Level 2. The last two levels will both be hidden messages.

## Setting it up: Level 3

It's easier to explain this process if we work "backwards", starting at Level 3. To begin, design a message on Discohook and save it as a backup (press "Backups" -> type in a name -> press "Save"). We'll be naming our backup "Level 3".

![](discohook://help/nesting-buttons/level_3.png)

## Level 2

Now open a new Discohook tab and create the Level 2 message in the same way that you did with Level 3, with one extra step: we'll be adding a button at the bottom to send the Level 3 backup.

![](discohook://help/nesting-buttons/level_2.mp4)

Create the button with the flow as shown above, then save the backup like you did with Level 3.

Add a webhook to the top of the page and send Level 2 in a private channel in your server. Make sure Discohook shows a blue checkmark next to the webhook you use, indicating that it is owned by Discohook. If it doesn't, the button on the message either won't show up or will do nothing when pressed. Use the button to ensure it sends Level 3 properly. This is an important step and you must perform it, otherwise the Level 3 button will not work in the future. After pressing the button, you can delete the message from the channel.

## Level 1

Now you can create Level 1. As a reminder, this is the top-most message that your users will interact with in order to see levels 2 and 3. Design a message and add a button exactly like you did with Level 2, but this time, configure the button to send Level 2 instead of Level 3.

![](discohook://help/nesting-buttons/level_1.png)

Add a webhook to the top and send the message in your server. Again, make sure Discohook shows a blue checkmark next to the webhook's name. You don't need to save Level 1 as a backup, but it's generally a good idea in case you accidentally delete the message in Discord.

## That's it!

Congratulations, you have now created a message that has two layers of nested buttons.

![](discohook://help/nesting-buttons/complete.png)
