import { REST } from "@discordjs/rest";
import { APIEntitlement, APIUser, Routes } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb } from "store";
import { discordUsers, makeSnowflake, users } from "store/src/schema";
import { GatewayEventCallback } from "../events.js";

export const entitlementCreateCallback: GatewayEventCallback = async (
  env,
  entitlement: APIEntitlement,
) => {
  const db = getDb(env.HYPERDRIVE);
  if (entitlement.application_id !== env.DISCORD_APPLICATION_ID) return;
  if (!entitlement.user_id) return;

  const rest = new REST().setToken(env.DISCORD_TOKEN);
  const user = (await rest.get(Routes.user(entitlement.user_id))) as APIUser;

  if (env.GUILD_ID) {
    try {
      if (env.DONATOR_ROLE_ID) {
        await rest.put(
          Routes.guildMemberRole(env.GUILD_ID, user.id, env.DONATOR_ROLE_ID),
          { reason: `Entitlement created: ${entitlement.id}` },
        );
      }
      if (env.SUBSCRIBER_ROLE_ID) {
        await rest.put(
          Routes.guildMemberRole(env.GUILD_ID, user.id, env.SUBSCRIBER_ROLE_ID),
          { reason: `Entitlement created: ${entitlement.id}` },
        );
      }
    } catch {}
  }

  await db
    .insert(discordUsers)
    .values({
      id: makeSnowflake(user.id),
      name: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
      discriminator: user.discriminator,
    })
    .onConflictDoUpdate({
      target: discordUsers.id,
      set: {
        name: user.username,
        globalName: user.global_name,
        avatar: user.avatar,
        discriminator: user.discriminator,
      },
    });

  const isLifetimeSKU =
    !!env.LIFETIME_SKU && entitlement.sku_id === env.LIFETIME_SKU;

  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.discordId, makeSnowflake(user.id)),
    columns: { lifetime: true, firstSubscribed: true },
  });
  await db
    .insert(users)
    .values({
      discordId: makeSnowflake(user.id),
      name: user.global_name ?? user.username,
      lifetime: isLifetimeSKU,
      subscribedSince: entitlement.starts_at
        ? new Date(entitlement.starts_at)
        : undefined,
      firstSubscribed: entitlement.starts_at
        ? new Date(entitlement.starts_at)
        : undefined,
    })
    .onConflictDoUpdate({
      target: users.discordId,
      set: {
        name: user.global_name ?? user.username,
        // Keep lifetime if it's already true
        lifetime: env.LIFETIME_SKU
          ? dbUser?.lifetime
            ? true
            : isLifetimeSKU
          : undefined,
        subscribedSince: entitlement.starts_at
          ? new Date(entitlement.starts_at)
          : undefined,
        // Only override `firstSubscribed` if it isn't already defined
        firstSubscribed:
          entitlement.starts_at && !dbUser?.firstSubscribed
            ? new Date(entitlement.starts_at)
            : undefined,
        subscriptionExpiresAt: null,
      },
    });
};

// https://discord.dev/monetization/implementing-app-subscriptions#working-with-entitlements
// This is sent when a subscription ends
export const entitlementUpdateCallback: GatewayEventCallback = async (
  env,
  entitlement: APIEntitlement,
) => {
  const db = getDb(env.HYPERDRIVE);
  if (entitlement.application_id !== env.DISCORD_APPLICATION_ID) return;
  if (!entitlement.user_id) return;
  // This shouldn't happen
  if (!entitlement.ends_at) return;

  const endsAt = new Date(entitlement.ends_at);
  const rest = new REST().setToken(env.DISCORD_TOKEN);

  if (env.GUILD_ID) {
    try {
      if (env.SUBSCRIBER_ROLE_ID) {
        await rest.delete(
          Routes.guildMemberRole(
            env.GUILD_ID,
            entitlement.user_id,
            env.SUBSCRIBER_ROLE_ID,
          ),
          { reason: `Subscription ended for SKU ${entitlement.sku_id}` },
        );
      }
    } catch {}
  }

  await db
    .update(users)
    .set({ subscriptionExpiresAt: endsAt })
    .where(eq(users.discordId, makeSnowflake(entitlement.user_id)));
};
