import { json } from "@remix-run/cloudflare";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  type APIMessage,
  type APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { notInArray } from "drizzle-orm";
import { Snowflake } from "tif-snowflake";
import { z } from "zod/v3";
import { getBucket } from "~/durable/rate-limits";
import { getUserId } from "~/session.server";
import type { APIComponentInMessageActionRow } from "~/types/QueryData";
import { WEBHOOK_TOKEN_RE } from "~/util/constants";
import {
  getWebhook,
  getWebhookMessage,
  hasCustomId,
  isComponentsV2,
  isErrorData,
} from "~/util/discord";
import type { ActionArgs } from "~/util/loader";
import { createREST } from "~/util/rest";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";
import {
  and,
  autoRollbackTx,
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

// first second of 2015
const DISCORD_EPOCH = 1420070400000;

export const action = async ({ request, context, params }: ActionArgs) => {
  const { webhookId, webhookToken, messageId } = zxParseParams(params, {
    webhookId: snowflakeAsString().transform(String),
    webhookToken: z.string().regex(WEBHOOK_TOKEN_RE),
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
  if (
    type === "send" &&
    // Allow 15 seconds to send the log request
    // This disallows people from logging any old message sent by a webhook
    // they have access to (and reduces our server's API calls in such cases)
    (now.getTime() - messageIdSnowflake.timestamp > 15000 ||
      // Don't allow future timestamps
      messageIdSnowflake.timestamp - now.getTime() > 0)
  ) {
    throw json(
      { message: "Message is too old or the snowflake is invalid" },
      { status: 400, headers },
    );
  }

  const rest = createREST(context.env);
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
    if (isErrorData(message)) {
      throw json(message, { status: 404, headers });
    }
    if (isComponentsV2(message)) {
      // We currently do not support logging these messages out of an abundance of caution
      throw json(
        { message: "Message is not loggable" },
        { status: 400, headers },
      );
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
    if (isErrorData(webhook)) {
      throw json(webhook, 404);
    }

    if (webhook.guild_id) {
      guildId = BigInt(webhook.guild_id);
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
    const storableComponents = message.components.flatMap((component) => {
      switch (component.type) {
        case ComponentType.ActionRow:
          return component.components;
        case ComponentType.Section:
          return component.accessory.type === ComponentType.Button
            ? [component.accessory]
            : [];
        case ComponentType.Container:
          return component.components.flatMap((child) => {
            switch (child.type) {
              case ComponentType.ActionRow:
                return child.components;
              case ComponentType.Section:
                return child.accessory.type === ComponentType.Button
                  ? [child.accessory]
                  : [];
              default:
                return [];
            }
          });
        default:
          return [];
      }
    }) satisfies APIComponentInMessageActionRow[];
    const componentIds = storableComponents
      .map(getComponentId)
      .filter((id): id is bigint => id !== undefined);

    const createdComponents = await db.transaction(
      autoRollbackTx(async (tx) => {
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
        const flowsValues: (typeof flows.$inferInsert)[] =
          storableComponents.flatMap((component) => {
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
              (component.type === ComponentType.Button &&
                isLinkButton(component))
            ) {
              return [];
            }

            const newId = generateId();
            flowsById[String(id)].push(newId);
            return [{ id: BigInt(newId) }];
          });
        if (flowsValues.length !== 0) {
          await tx.insert(flows).values(flowsValues).onConflictDoNothing();
        }

        const now = new Date();
        const values: (typeof discordMessageComponents.$inferInsert)[] =
          storableComponents.flatMap((component) => {
            const match =
              "custom_id" in component
                ? stored.find((c) => component.custom_id === `p_${c.id}`)
                : undefined;

            const id = String(getComponentId(component));

            let data:
              | (typeof discordMessageComponents.$inferInsert)["data"]
              | undefined;
            switch (component.type) {
              case ComponentType.Button: {
                if (!hasCustomId(component)) {
                  data = component;
                } else {
                  const { custom_id: _, ...c } = component;
                  data = {
                    ...c,
                    flowId:
                      match && "flowId" in match.data
                        ? match.data.flowId
                        : flowsById[id][0],
                  };
                }
                break;
              }
              case ComponentType.StringSelect: {
                const { custom_id: _, ...c } = component;
                data = {
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
                    match && "flowIds" in match.data ? match.data.flowIds : {},
                };
                break;
              }
              case ComponentType.UserSelect:
              case ComponentType.RoleSelect:
              case ComponentType.MentionableSelect:
              case ComponentType.ChannelSelect: {
                const { custom_id: _, ...c } = component;
                data = {
                  ...c,
                  // See above
                  minValues: 1,
                  maxValues: 1,
                  flowId:
                    match && "flowId" in match.data
                      ? match.data.flowId
                      : flowsById[id][0],
                };
                break;
              }
              default:
                break;
            }
            // Shouldn't happen
            if (!data) {
              console.error("Unsupported component type");
              return [];
            }

            return [
              {
                id: match?.id,
                type: component.type,
                data,
                draft: false,
                createdById: match?.createdById ?? userId,
                updatedById: userId,
                updatedAt: now,
                guildId,
                messageId: BigInt(message.id),
                channelId: BigInt(message.channel_id),
              },
            ];
          });
        return values.length === 0
          ? []
          : await tx
              .insert(discordMessageComponents)
              .values(values)
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
      }),
    );
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

  const entry = await db.transaction(
    autoRollbackTx(async (tx) => {
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
    }),
  );

  return json({ ...entry, webhook: entryWebhook }, { headers });
};
