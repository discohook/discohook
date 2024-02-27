import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { zx } from "zodix";
import { getUser } from "~/session.server";
import { getWebhook, getWebhookMessage } from "~/util/discord";
import { ActionArgs } from "~/util/loader";
import {
    getDb,
    getchGuild,
    messageLogEntries,
    upsertGuild,
    webhooks
} from "../../store.server";

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
          val !== undefined ? !Number.isNaN(Number.parseInt(val)) : true,
        ),
    });

  const user = await getUser(request, context);

  const message = await getWebhookMessage(
    webhookId,
    webhookToken,
    messageId,
    threadId,
  );
  if (!message.id) {
    throw json({ message: "Message could not be found." }, 404);
  }

  const webhook = await getWebhook(webhookId, webhookToken);

  const db = getDb(context.env.DATABASE_URL);

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

  const entry = (
    await db
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
      .returning({
        id: messageLogEntries.id,
        webhookId: messageLogEntries.webhookId,
        channelId: messageLogEntries.channelId,
        messageId: messageLogEntries.messageId,
      })
  )[0];

  return { ...entry, webhook: entryWebhook };
};
