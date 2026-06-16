---
title: "Flow Responsibility"
description: "How Discohook determines when not to execute an action"
---

Discohook keeps track of who was the last person to edit a component or trigger (or anything with a flow). It uses this information to determine **responsibility**: when a flow is executed (e.g. one of your buttons is pressed), it takes on the role of the responsible user. This is a security measure to prevent unauthorized users, who may have appropriate permissionst to create buttons, but not assign roles, from giving themselves elevated permissions through the bot.

Internally, the flow is restricted to only perform actions that the responsible user may perform on their own. This means that if a nefarious user creates a flow that assigns an administrator role which is above their own highest role, even if Discohook Utils can assign it, it will refuse on the grounds that the responsible user is unable.

If an action is successful, you may also see in your audit log the username and ID of the user who Discohook determined was responsible.

### Caveats

It may be the case that a responsible user cannot be determined if, for example, the user left the server. If this happens, the fewest possible permissions will be used; no roles can be managed nor threads created.
