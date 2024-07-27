import { TimestampStyles, time } from "@discordjs/formatters";
import {
  APIActionRowComponent,
  APIMessageActionRowComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb, upsertDiscordUser } from "store";
import { users } from "store/src/schema/schema.js";
import { ChatInputAppCommandCallback } from "../commands.js";

export const deluxeInfoCallback: ChatInputAppCommandCallback = async (ctx) => {
  // Latest stable @djs/builders (1.8.2) doesn't support premium buttons yet
  const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
    {
      type: ComponentType.ActionRow,
      components: ctx.env.PREMIUM_SKUS.map((sku_id) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Premium,
        sku_id,
      })),
    },
  ];
  return ctx.reply({
    content: `Learn about Discohook Deluxe here: <${ctx.env.DISCOHOOK_ORIGIN}/donate>`,
    components,
    flags: MessageFlags.Ephemeral,
  });
};

export const deluxeSyncCallback: ChatInputAppCommandCallback = async (ctx) => {
  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
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
      user.lifetime ?? premium.lifetime
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
            ? `You have a premium subscription until ${
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
    flags: MessageFlags.Ephemeral,
  });
};
