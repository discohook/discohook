import { json } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { getDb } from "~/db/index.server";
import { messageLogEntries, webhooks } from "~/db/schema.server";
import { getUser } from "~/session.server";
import { getWebhook, getWebhookMessage } from "~/util/discord";
import { ActionArgs } from "~/util/loader";

export const action = async ({ request, context }: ActionArgs) => {
  const { type, webhookId, webhookToken, messageId, threadId } =
    await zx.parseForm(request, {
      type: z.enum(["send", "edit", "delete"]),
      webhookId: z
        .string()
        .refine((val) => !Number.isNaN(Number.parseInt(val))),
      webhookToken: z.string(),
      messageId: z
        .string()
        .refine((val) => !Number.isNaN(Number.parseInt(val))),
      threadId: z
        .ostring()
        .refine((val) =>
          val !== undefined ? !Number.isNaN(Number.parseInt(val)) : true
        ),
    });

  const user = await getUser(request, context);

  const message = await getWebhookMessage(
    webhookId,
    webhookToken,
    messageId,
    threadId
  );
  if (!message.id) {
    throw json({ message: "Message could not be found." }, 404);
  }

  const webhook = await getWebhook(webhookId, webhookToken);

  const db = getDb(context.env.D1);

  await db.insert(webhooks).values({
    platform: "discord",
    id: webhookId,
    name: webhook.name ?? "",
    avatar: webhook.avatar,
    channelId: webhook.channel_id,
    // discordGuild: webhook.guild_id
    //   ? {
    //     connectOrCreate: {
    //       where: { id: BigInt(webhook.guild_id) },
    //       create: {
    //         id: BigInt(webhook.guild_id),
    //         name: "Unknown Server",
    //       },
    //     },
    //   }
    //   : undefined,
  }).onConflictDoUpdate({
    target: webhooks.id,
    set: {
      name: webhook.name ?? undefined,
      avatar: webhook.avatar,
      channelId: webhook.channel_id,
      // discordGuildId: webhook.guild_id ? makeSnowflake(webhook.guild_id) : null,
    }
  });

  const { id } = (await db
    .insert(messageLogEntries)
    .values({
      webhookId,
      type,
      messageId: message.id,
      channelId: message.channel_id,
      threadId,
      userId: user?.id,
      // Not really a reliable check but it doesn't matter much.
      // We might want to remove this entirely
      notifiedEveryoneHere:
        message.content.includes("@everyone") ||
        message.content.includes("@here"),
      embedCount: message.embeds.length,
      hasContent: !!message.content,
    })
    .returning({ id: messageLogEntries.id }))[0];

  const entry = await db.query.messageLogEntries.findFirst({
    where: eq(messageLogEntries.id, id),
    with: {
      webhook: {
        columns: {
          discordGuildId: true,
        }
      }
    },
    columns: {
      channelId: true,
      messageId: true,
    }
  });

  return entry!;
};
