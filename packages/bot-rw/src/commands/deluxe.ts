import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { TimestampStyles, time } from "@discordjs/formatters";
import { ButtonStyle } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { upsertDiscordUser, users } from "store";
import type { ChatInputAppCommandCallback } from "./handler.js";

export const deluxeInfoCallback: ChatInputAppCommandCallback = async (ctx) => {
  const premiumSkus: string[] = JSON.parse(Bun.env.PREMIUM_SKUS ?? "[]");
  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      premiumSkus.map((skuId) =>
        new ButtonBuilder().setStyle(ButtonStyle.Premium).setSKUId(skuId),
      ),
    ),
  ];
  await ctx.reply({
    content: `Learn about Discohook Deluxe here: <${Bun.env.DISCOHOOK_ORIGIN}/donate>`,
    components,
    ephemeral: true,
  });
};

export const deluxeSyncCallback: ChatInputAppCommandCallback = async (ctx) => {
  const db = ctx.client.getDb();
  const user = await upsertDiscordUser(db, ctx.user);

  // Make sure we don't accidentally do this for users if we ever introduce a
  // guild-level subscription
  const { premium } = ctx;
  await db
    .update(users)
    .set({
      subscribedSince: premium.subscribedAt ?? null,
      firstSubscribed: user.firstSubscribed ? undefined : premium.subscribedAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
      lifetime: user.lifetime ?? premium.lifetime,
    })
    .where(eq(users.id, user.id));

  await ctx.reply({
    content: `Synced successfully: ${
      (user.lifetime ?? premium.lifetime)
        ? "You have a lifetime subscription."
        : premium.grace && premium.graceEndsAt
          ? `You can access your Deluxe subscription until ${time(
              premium.graceEndsAt,
              TimestampStyles.LongDate,
            )} (expired ${
              premium.endsAt
                ? time(premium.endsAt, TimestampStyles.RelativeTime)
                : ""
            }).`
          : premium.active
            ? `You have an active Deluxe subscription until ${
                premium.endsAt
                  ? time(premium.endsAt, TimestampStyles.LongDate)
                  : "unknown"
              }${
                premium.purchased
                  ? ", with an eligible grace period of 3 days."
                  : ""
              }.`
            : "You do not have an active Deluxe subscription."
    }`,
    ephemeral: true,
  });
};
