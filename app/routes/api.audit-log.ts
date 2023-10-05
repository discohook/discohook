import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { prisma } from "~/prisma.server";
import { getUser } from "~/session.server";
import { getWebhook, getWebhookMessage } from "~/util/discord";

export const action = async ({ request }: ActionFunctionArgs) => {
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

  const user = await getUser(request);

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

  const entry = await prisma.messageLogEntry.create({
    data: {
      webhook: {
        connectOrCreate: {
          where: { id: webhookId },
          create: {
            platform: "discord",
            id: webhookId,
            name: webhook.name ?? "",
            avatar: webhook.avatar,
            channelId: webhook.channel_id,
            discordGuild: webhook.guild_id
              ? {
                  connectOrCreate: {
                    where: { id: BigInt(webhook.guild_id) },
                    create: {
                      id: BigInt(webhook.guild_id),
                      name: "Unknown Server",
                    },
                  },
                }
              : undefined,
          },
        },
      },
      type,
      messageId: message.id,
      channelId: message.channel_id,
      threadId: threadId,
      user: user ? { connect: { id: user?.id } } : undefined,
      // Not really a reliable check but it doesn't matter much.
      // We might want to remove this entirely
      notifiedEveryoneHere:
        message.content.includes("@everyone") ||
        message.content.includes("@here"),
      embedCount: message.embeds.length,
      hasContent: !!message.content,
    },
    select: {
      webhook: {
        select: {
          discordGuildId: true,
        },
      },
      channelId: true,
      messageId: true,
    },
  });

  return entry;
};
