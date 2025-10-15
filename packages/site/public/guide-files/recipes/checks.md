---
title: "Checks"
description: "How to use the \"Check\" action type"
---

# Checks

A check action will allow you to define "paths" in your flow that depend on certain state. This page will cover common use cases for this action type. For details on the types of check functions that you can use, see [flows](discohook://guide/getting-started/flows).

## Checking if the user has a role

Add a new check action and choose the `Member has role` function. By default, you will be able to select a role from the dropdown. If you see a message that says there is no data, you will need to add a webhook for the message so that Discohook knows which server's roles to let you select from. [Discohook Utils](discohook://bot) needs to be in the server for you to do this.

![](discohook://help/check_member_role.png)

You can also turn the role dropdown into an adaptive or mirror variable, using values from earlier in the flow. If you do not use "static", be sure the value that you are pointing the check to is a role ID (not a role name, for example), or else it won't work!

## Checking if the user is one of a few predefined users (using the `IN` function)

Add a new check action and choose the `IN` function. In the "Element" input (top), choose "Mirror" and type `member.id`. In the "Contained within" input (bottom), select "Static" and enter a valid [JSON formatted array](https://tutorialreference.com/json/json-array). This tells Discohook to read the value of [the variable](discohook://guide/getting-started/formatting) and check if it is in the array you defined.

![](discohook://help/check_member_id.png)

These two boxes extend the named variable system, which means that you could also define your array before this check action and then reference it with a mirror value. We're going to use this knowledge in the following section about `NOT`.

## Negating the result (using the `NOT` function)

Sometimes it makes more sense to inverse the outcome of the check. You can do this by first selecting the `NOT` function, and then adding conditions within it.

![](discohook://help/check_not_equals.png)

Did you see that? You can use user-defined variables in messages just like regular formatting options!

## Using mirror variables

You may have noticed that the above examples used values like `member.id` in an input area with a "Mirror" dropdown, but `member.id` was never defined in the flow. This works because all values on the [formatting page](discohook://guide/getting-started/formatting) are accessible in flows just like user-defined variables.

If you want to create a variable with the same name as one of the pre-defined variables, you can do that! However, because you are overwriting the value for all future actions, so you may want to "rename" it by creating a mirror variable before the new variable is defined.

For example, if you want to pretend that the member has no roles, but you still want to be able to access their roles as `roles`:

![](discohook://help/overwrite_variable.png)

Of course, the above creates a confusing user experience, but this is just a demonstration.
