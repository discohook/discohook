import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIButtonComponentWithCustomId,
  APIButtonComponentWithURL,
  APIMessage,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { z } from "zod";
import { getUserId } from "~/session.server";
import { getWebhook, getWebhookMessage } from "~/util/discord";
import { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseForm, zxParseParams } from "~/util/zod";
import {
  discordMessageComponents,
  eq,
  getDb,
  getchGuild,
  inArray,
  messageLogEntries,
  sql,
  upsertGuild,
  webhooks,
} from "../../store.server";

const getComponentId = (
  component:
    | Pick<APIButtonComponentWithCustomId, "type" | "style" | "custom_id">
    | Pick<APIButtonComponentWithURL, "type" | "style" | "url">
    | Pick<APISelectMenuComponent, "type" | "custom_id">,
) => {
  if (
    component.type === ComponentType.Button &&
    component.style === ButtonStyle.Link
  ) {
    const url = new URL(component.url);
    const id = url.searchParams.get("dhc-id");
    if (id) {
      try {
        return BigInt(id);
      } catch {}
    }
    return undefined;
  }
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
  const { type, threadId } = await zxParseForm(request, {
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

  const db = getDb(context.env.HYPERDRIVE.connectionString);

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

    await db.transaction(async (tx) => {
      const stored =
        componentIds.length !== 0
          ? await tx.query.discordMessageComponents.findMany({
              where: inArray(discordMessageComponents.id, componentIds),
              columns: {
                id: true,
                data: true,
                createdById: true,
              },
            })
          : [];

      await tx
        .delete(discordMessageComponents)
        .where(eq(discordMessageComponents.messageId, BigInt(message.id)));

      await tx
        .insert(discordMessageComponents)
        .values(
          components.map((component) => {
            const match = stored.find((c) =>
              "custom_id" in component
                ? component.custom_id === `p_${c.id}`
                : false,
            );
            return {
              id: match?.id,
              data: (() => {
                switch (component.type) {
                  case ComponentType.Button: {
                    if (isLinkButton(component)) {
                      return component;
                    }
                    const { custom_id: _, ...c } = component;
                    return {
                      ...c,
                      flow:
                        match && "flow" in match.data
                          ? match.data.flow
                          : { actions: [] },
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
                      flows:
                        match && "flows" in match.data ? match.data.flows : {},
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
                      flow:
                        match && "flow" in match.data
                          ? match.data.flow
                          : { actions: [] },
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
            };
          }),
        )
        .onConflictDoUpdate({
          target: discordMessageComponents.id,
          set: {
            data: sql`excluded.data`,
            draft: sql`excluded.draft`,
            createdById: sql`excluded."createdById"`,
            updatedById: sql`excluded."updatedById"`,
            updatedAt: sql`excluded."updatedAt"`,
            guildId: sql`excluded."guildId"`,
            channelId: sql`excluded."channelId"`,
            messageId: sql`excluded."messageId"`,
          },
        });
    });
  }

  const entry = (
    await db
      .insert(messageLogEntries)
      .values({
        webhookId,
        type,
        discordGuildId: guildId,
        // How crucial is an accurate message ID? This could definitely be fabricated
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
