import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { TimestampStyles, time } from "@discordjs/formatters";
import { ButtonStyle } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb, upsertDiscordUser, users } from "store";
import type { ChatInputAppCommandCallback } from "../commands.js";

export const deluxeInfoCallback: ChatInputAppCommandCallback = async (ctx) => {
  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      ctx.env.PREMIUM_SKUS.map((sku_id) =>
        new ButtonBuilder().setStyle(ButtonStyle.Premium).setSKUId(sku_id),
      ),
    ),
  ];
  return ctx.reply({
    content: `Learn about Discohook Deluxe here: <${ctx.env.DISCOHOOK_ORIGIN}/donate>`,
    components,
    ephemeral: true,
  });
};

export const deluxeSyncCallback: ChatInputAppCommandCallback = async (ctx) => {
  const db = getDb(ctx.env.HYPERDRIVE);
  const user = await upsertDiscordUser(db, ctx.user);

  // Make sure we don't accidentally do this for users if we ever introduce a guild-level subscription
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

  return ctx.reply({
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
