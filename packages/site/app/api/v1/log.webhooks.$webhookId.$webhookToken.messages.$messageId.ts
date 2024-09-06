import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIButtonComponentWithCustomId,
  APIButtonComponentWithSKUId,
  APIButtonComponentWithURL,
  APIMessage,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { notInArray } from "drizzle-orm";
import { z } from "zod";
import { getUserId } from "~/session.server";
import { getWebhook, getWebhookMessage, hasCustomId } from "~/util/discord";
import { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";
import {
  and,
  discordMessageComponents,
  eq,
  flows,
  generateId,
  getDb,
  getchGuild,
  inArray,
  launchComponentDurableObject,
  messageLogEntries,
  sql,
  upsertGuild,
  webhooks,
} from "../../store.server";

export const getComponentId = (
  component:
    | Pick<APIButtonComponentWithCustomId, "type" | "style" | "custom_id">
    | Pick<APIButtonComponentWithURL, "type" | "style" | "url">
    | Pick<APIButtonComponentWithSKUId, "type" | "style" | "sku_id">
    | Pick<APISelectMenuComponent, "type" | "custom_id">,
) => {
  if (
    component.type === ComponentType.Button &&
    component.style === ButtonStyle.Link
  ) {
    let url: URL;
    try {
      url = new URL(component.url);
    } catch {
      return undefined;
    }
    const id = url.searchParams.get("dhc-id");
    if (id) {
      try {
        return BigInt(id);
      } catch {}
    }
    return undefined;
  }
  if ("sku_id" in component) return undefined;

  return /^p_\d+/.test(component.custom_id)
    ? BigInt(component.custom_id.replace(/^p_/, ""))
    : undefined;
};

export const action = async ({ request, context, params }: ActionArgs) => {
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

  const userId = await getUserId(request, context);

  let message: APIMessage | undefined;
  if (type === "delete") {
    // Make sure the user doesn't log that they deleted a message that still exists
    const deleted = await getWebhookMessage(
      webhookId,
      webhookToken,
      messageId,
      threadId,
    );
    if (deleted.id) {
      throw json({ message: "Message still exists" }, 400);
    }
  } else {
    message = await getWebhookMessage(
      webhookId,
      webhookToken,
      messageId,
      threadId,
    );
    if (!message.id) {
      throw json(message, 404);
    }
  }

  const webhook = await getWebhook(webhookId, webhookToken);
  if (!webhook.id) {
    throw json(webhook, 404);
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
      return entry;
    }
  }

  let guildId: bigint | undefined = undefined;
  if (webhook.guild_id) {
    const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
    try {
      const guild = await getchGuild(rest, context.env.KV, webhook.guild_id);
      const upserted = await upsertGuild(db, guild);
      guildId = upserted.id;
    } catch {
      guildId = undefined;
    }
  }
  const entryWebhook = (
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
      })
  )[0];

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
          // drizzle throws when using inArray with an empty array
          componentIds.length === 0
            ? eq(sql`1`, sql`1`)
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

          if (match) {
            // avoid conflict, later `insert` will find flow ids from match
            return [];
            // return match.componentsToFlows.map((ctf) => {
            //   flowsById[String(id)].push(String(ctf.flow.id));
            //   return { id: ctf.flow.id, name: ctf.flow.name };
            // });
          }

          if (
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
        });
    });
    // I want to do this in the background (ctx.waitUntil) but I had issues
    // the last time I tried with this Remix project. TODO: Try again after
    // upgrading to vite?
    for (const created of createdComponents) {
      if (created.messageId) {
        await launchComponentDurableObject(context.env, {
          messageId: created.messageId.toString(),
          componentId: created.id,
          customId: `p_${created.id}`,
        });
      }
    }
  }

  const entry = (
    await db
      .insert(messageLogEntries)
      .values({
        webhookId,
        type,
        discordGuildId: guildId,
        // How crucial is an accurate message ID? This could definitely be
        // fabricated when creating `delete` logs
        messageId: message?.id ?? messageId,
        channelId: message?.channel_id ?? webhook.channel_id,
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

  return { ...entry, webhook: entryWebhook };
};
