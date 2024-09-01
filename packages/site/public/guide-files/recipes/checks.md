---
title: "Checks"
description: "How to use the \"Check\" action type"
---

# Checks

A check action will allow you to define "paths" in your flow that depend on certain state. This page will cover common use cases for this action type. For details on the types of check functions that you can use, see [flows](discohook://guide/getting-started/flows).

## Checking if the user has a role (using the `IN` function)

Add a new check action and choose the `IN` function. In the "Element" input (top), choose static and enter a role ID. In the "Contained within" input (bottom), select "Mirror" and type `member.role_ids`. This tells Discohook to read the value of [that variable](discohook://guide/getting-started/formatting) and check if the value you entered in the top box is in the list.

![](discohook://help/check_member_roles.png)

These two boxes extend the named variable system, which means that you could also define your role ID before this check action and then reference it with a mirror value. We're going to use this in the following section about `NOT`.

## Negating the result (using the `NOT` function)

Sometimes it makes more sense to inverse the outcome of the check. You can do this by first selecting the `NOT` function, and then adding conditions within it.

![](discohook://help/check_member_roles_not.png)

Did you see that? You can use user-defined variables in messages just like regular formatting options!

## Using mirror variables

You may have noticed that the above examples used values like `member.role_ids` in an input area with a "Mirror" dropdown, but `member.role_ids` was never defined in the flow. This works because all values on the [formatting page](discohook://guide/getting-started/formatting) are accessible in flows just like user-defined variables.

If you want to create a variable with the same name as one of the pre-defined variables, you can do that! However, because you are overwriting the value for all future actions, so you may want to "rename" it by creating a mirror variable before the new variable is defined.

For example, if you want to pretend that the member has no roles, but you still want to be able to access their roles as `roles`:

![](discohook://help/overwrite_variable.png)

Of course, the above creates a confusing user experience, but this is just a demonstration.
