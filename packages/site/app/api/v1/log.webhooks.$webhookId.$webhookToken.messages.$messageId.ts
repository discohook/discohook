import { REST } from "@discordjs/rest";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  type APIMessage,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { notInArray } from "drizzle-orm";
import { Snowflake } from "tif-snowflake";
import { z } from "zod";
import { getBucket } from "~/.server/durable/rate-limits";
import { getUserId } from "~/session.server";
import {
  and,
  discordGuilds,
  discordMessageComponents,
  eq,
  flows,
  generateId,
  getDb,
  inArray,
  launchComponentDurableObject,
  messageLogEntries,
  sql,
  webhooks,
} from "~/store.server";
import {
  getComponentId,
  getWebhook,
  getWebhookMessage,
  hasCustomId,
} from "~/util/discord";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";

// first second of 2015
const DISCORD_EPOCH = 1420070400000;

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const { webhookId, webhookToken, messageId } = zxParseParams(params, {
    webhookId: snowflakeAsString().transform(String),
    webhookToken: z.string(),
    messageId: snowflakeAsString().transform(String),
  });
  const { type, threadId } = await zxParseJson(request, {
    type: z.union([z.literal("send"), z.literal("edit"), z.literal("delete")]),
    threadId: snowflakeAsString().transform(String).optional(),
    // components: z
    //   .object({
    //     id: z.string().regex(/\d+/),
    //     // row: z.number().min(0).max(4),
    //     // col: z.number().min(0).max(4),
    //     flow: ZodFlow,
    //   })
    //   .array()
    //   .optional(),
  });
  const headers = await getBucket(request, context, "messageLog");

  const now = new Date();
  const messageIdSnowflake = Snowflake.parse(messageId, DISCORD_EPOCH);
  if (type === "send" && now.getTime() - messageIdSnowflake.timestamp > 15000) {
    // Allow 15 seconds to send the log request
    // This disallows people from logging any old message sent by a webhook
    // they have access to (and reduces our server's API calls in such cases)
    throw json({ message: "Message is too old" }, { status: 400, headers });
  }

  const rest = new REST({ api: context.env.DISCORD_PROXY_API }).setToken(
    context.env.DISCORD_BOT_TOKEN,
  );
  const userId = await getUserId(request, context);

  let message: APIMessage | undefined;
  if (type === "delete") {
    // Make sure the user doesn't log that they deleted a message that still exists
    const deleted = await getWebhookMessage(
      webhookId,
      webhookToken,
      messageId,
      threadId,
      rest,
    );
    if (deleted.id) {
      throw json({ message: "Message still exists" }, { status: 400, headers });
    }
  } else {
    message = await getWebhookMessage(
      webhookId,
      webhookToken,
      messageId,
      threadId,
      rest,
    );
    if (!message.id) {
      throw json(message, 404);
    }
    if (type === "edit") {
      if (!message.edited_timestamp) {
        throw json(
          { message: "Message has never been edited" },
          { status: 400, headers },
        );
      }
      if (
        now.getTime() - new Date(message.edited_timestamp).getTime() >
        15000
      ) {
        // Allow 15 seconds to send the log request
        // This disallows people from logging any old message sent by a webhook
        // they have access to (and reduces our server's API calls in such cases)
        throw json(
          { message: "Message was edited too long ago" },
          { status: 400, headers },
        );
      }
    }
  }

  const db = getDb(context.env.HYPERDRIVE);
  if (type === "send" || type === "delete") {
    const entry = await db.query.messageLogEntries.findFirst({
      where: (messageLogEntries, { eq, and }) =>
        and(
          eq(messageLogEntries.type, type),
          eq(messageLogEntries.messageId, messageId),
        ),
      columns: {
        id: true,
        webhookId: true,
        channelId: true,
        messageId: true,
      },
    });
    // If it's a duplicate, assume race condition and
    // return the same record instead of erroring
    if (entry) {
      return json(entry, { headers });
    }
  }

  let entryWebhook = await db.query.webhooks.findFirst({
    where: (webhooks, { eq, and }) =>
      and(eq(webhooks.id, webhookId), eq(webhooks.platform, "discord")),
    columns: { id: true, discordGuildId: true, channelId: true },
  });

  let guildId = entryWebhook?.discordGuildId;
  if (!entryWebhook) {
    const webhook = await getWebhook(webhookId, webhookToken, rest);
    if (!webhook.id) {
      throw json(webhook, 404);
    }

    if (webhook.guild_id) {
      guildId = BigInt(webhook.guild_id);
      // I hope this wasn't important, it seemed unnecessary? jan 2 2024
      // try {
      //   const guild = await getchGuild(rest, context.env, webhook.guild_id);
      //   const upserted = await upsertGuild(db, guild);
      //   guildId = upserted.id;
      // } catch {
      //   guildId = undefined;
      // }
    }

    entryWebhook = (
      await db
        .insert(webhooks)
        .values({
          platform: "discord",
          id: webhookId,
          name: webhook.name ?? "",
          avatar: webhook.avatar,
          channelId: webhook.channel_id,
          discordGuildId: guildId,
        })
        .onConflictDoUpdate({
          target: [webhooks.platform, webhooks.id],
          set: {
            name: webhook.name ?? undefined,
            avatar: webhook.avatar,
            channelId: webhook.channel_id,
            discordGuildId: guildId,
          },
        })
        .returning({
          id: webhooks.id,
          discordGuildId: webhooks.discordGuildId,
          channelId: webhooks.channelId,
        })
    )[0];
  }

  if (!message || !message.components || message.components.length === 0) {
    await db
      .delete(discordMessageComponents)
      .where(eq(discordMessageComponents.messageId, BigInt(messageId)));
  } else {
    const components = message.components.flatMap((row) => row.components);
    const componentIds = components
      .map(getComponentId)
      .filter((id): id is bigint => id !== undefined);

    const createdComponents = await db.transaction(async (tx) => {
      const stored =
        componentIds.length !== 0
          ? await tx.query.discordMessageComponents.findMany({
              where: inArray(discordMessageComponents.id, componentIds),
              columns: {
                id: true,
                data: true,
                createdById: true,
              },
              with: {
                componentsToFlows: {
                  with: {
                    flow: {
                      with: {
                        actions: true,
                      },
                    },
                  },
                },
              },
            })
          : [];

      await tx.delete(discordMessageComponents).where(
        and(
          eq(discordMessageComponents.messageId, BigInt(message.id)),
          // drizzle throws when using (not)inArray with an empty array
          componentIds.length === 0
            ? sql`true`
            : notInArray(discordMessageComponents.id, componentIds),
        ),
      );

      const flowsById: Record<string, string[]> = {};
      const flowsValues: (typeof flows.$inferInsert)[] = components.flatMap(
        (component) => {
          const match = stored.find((c) =>
            "custom_id" in component
              ? component.custom_id === `p_${c.id}`
              : false,
          );
          const id = getComponentId(component);
          flowsById[String(id)] = [];

          if (
            match ||
            component.type === ComponentType.StringSelect ||
            (component.type === ComponentType.Button && isLinkButton(component))
          ) {
            return [];
          }

          const newId = generateId();
          flowsById[String(id)].push(newId);
          return [{ id: BigInt(newId) }];
        },
      );
      if (flowsValues.length !== 0) {
        await tx.insert(flows).values(flowsValues).onConflictDoNothing();
      }

      return await tx
        .insert(discordMessageComponents)
        .values(
          components.flatMap((component) => {
            const match =
              "custom_id" in component
                ? stored.find((c) => component.custom_id === `p_${c.id}`)
                : undefined;

            // We generally want to prevent a component type from changing but
            // I think it makes more sense in this context to allow it
            // if (match && match.data.type !== component.type) {
            //   return [];
            // }

            const id = String(getComponentId(component));
            return [
              {
                id: match?.id,
                type: component.type,
                data: (() => {
                  switch (component.type) {
                    case ComponentType.Button: {
                      if (!hasCustomId(component)) {
                        return component;
                      }
                      const { custom_id: _, ...c } = component;
                      return {
                        ...c,
                        flowId:
                          match && "flowId" in match.data
                            ? match.data.flowId
                            : flowsById[id][0],
                      };
                    }
                    case ComponentType.StringSelect: {
                      const { custom_id: _, ...c } = component;
                      return {
                        ...c,
                        // Force max 1 value until we support otherwise
                        // I want to make it so selects with >1 max_values share one
                        // flow for all options, like with autofill selects. And also
                        // a way to tell which values have been selected - `{values[n]}`?
                        minValues: 1,
                        maxValues: 1,
                        // minValues: component.min_values,
                        // maxValues: component.max_values,
                        flowIds:
                          match && "flowIds" in match.data
                            ? match.data.flowIds
                            : {},
                      };
                    }
                    case ComponentType.UserSelect:
                    case ComponentType.RoleSelect:
                    case ComponentType.MentionableSelect:
                    case ComponentType.ChannelSelect: {
                      const { custom_id: _, ...c } = component;
                      return {
                        ...c,
                        // See above
                        minValues: 1,
                        maxValues: 1,
                        flowId:
                          match && "flowId" in match.data
                            ? match.data.flowId
                            : flowsById[id][0],
                      };
                    }
                    default:
                      break;
                  }
                  // Shouldn't happen
                  throw Error("Unsupported component type");
                })(),
                draft: false,
                createdById: match?.createdById ?? userId,
                updatedById: userId,
                updatedAt: sql`NOW()`,
                guildId,
                messageId: BigInt(message.id),
                channelId: BigInt(message.channel_id),
              },
            ];
          }),
        )
        .onConflictDoUpdate({
          target: discordMessageComponents.id,
          set: {
            type: sql`excluded.type`,
            data: sql`excluded.data`,
            draft: sql`excluded.draft`,
            createdById: sql`excluded."createdById"`,
            updatedById: sql`excluded."updatedById"`,
            updatedAt: sql`excluded."updatedAt"`,
            guildId: sql`excluded."guildId"`,
            channelId: sql`excluded."channelId"`,
            messageId: sql`excluded."messageId"`,
          },
        })
        .returning({
          id: discordMessageComponents.id,
          messageId: discordMessageComponents.messageId,
          data: discordMessageComponents.data,
        });
    });
    // I want to do this in the background (ctx.waitUntil) but I had issues
    // the last time I tried with this Remix project. TODO: Try again after
    // upgrading to vite?
    for (const created of createdComponents) {
      if (
        created.messageId &&
        (created.data.type !== ComponentType.Button ||
          (created.data.style !== ButtonStyle.Link &&
            created.data.style !== ButtonStyle.Premium))
      ) {
        await launchComponentDurableObject(context.env, {
          messageId: created.messageId.toString(),
          componentId: created.id,
          customId: `p_${created.id}`,
        });
      }
    }
  }

  const entry = await db.transaction(async (tx) => {
    // Ensure the guild exists for the relationship in messageLogEntries.
    // Users who are the victim of webhook URL leakage (whereafter the attacker
    // happens to use Discohook to abuse the URL) would probably not like
    // to see that there are no logs just because they had never personally
    // logged into the site before -- which is why we do this instead of just
    // not creating the log. It's trivial to delete everything here upon request.
    if (guildId) {
      await tx
        .insert(discordGuilds)
        .values({ id: guildId })
        .onConflictDoNothing();
    }
    return (
      await tx
        .insert(messageLogEntries)
        .values({
          webhookId,
          type,
          discordGuildId: guildId,
          // How crucial is an accurate message ID? This could definitely be
          // fabricated when creating `delete` logs
          messageId: message?.id ?? messageId,
          channelId: message?.channel_id ?? entryWebhook.channelId,
          threadId,
          userId,
          // Not really a reliable check but it doesn't matter.
          // We might want to remove this entirely
          notifiedEveryoneHere: message
            ? message.mention_everyone || message.content.includes("@here")
            : undefined,
          embedCount: message ? message.embeds.length : undefined,
          hasContent: message ? !!message.content : undefined,
        })
        .returning({
          id: messageLogEntries.id,
          webhookId: messageLogEntries.webhookId,
          channelId: messageLogEntries.channelId,
          messageId: messageLogEntries.messageId,
        })
    )[0];
  });

  return json({ ...entry, webhook: entryWebhook }, { headers });
};
