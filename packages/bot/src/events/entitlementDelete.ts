import { type APIEntitlement, Routes } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb, makeSnowflake, users } from "store";
import type { GatewayEventCallback } from "../events.js";
import { createREST } from "../util/rest.js";

// Discord removed the entitlement. I think in any case this means the user is
// no longer subscribed (through discord, at least), so it's safe to carefully
// remove subscription information
export const entitlementDeleteCallback: GatewayEventCallback = async (
  env,
  entitlement: APIEntitlement,
) => {
  if (entitlement.application_id !== env.DISCORD_APPLICATION_ID) return;
  if (!entitlement.user_id) return;

  if (env.GUILD_ID && env.SUBSCRIBER_ROLE_ID) {
    const rest = createREST(env);
    try {
      await rest.delete(
        Routes.guildMemberRole(
          env.GUILD_ID,
          entitlement.user_id,
          env.SUBSCRIBER_ROLE_ID,
        ),
        { reason: `Entitlement deleted: ${entitlement.id}` },
      );
    } catch {}
  }

  const db = getDb(env.HYPERDRIVE);
  const isLifetimeSKU =
    !!env.LIFETIME_SKU && entitlement.sku_id === env.LIFETIME_SKU;
  await db
    .update(users)
    .set({
      lifetime: isLifetimeSKU ? false : undefined,
      subscribedSince: isLifetimeSKU ? undefined : null,
      subscriptionExpiresAt: isLifetimeSKU ? undefined : null,
    })
    .where(eq(users.discordId, makeSnowflake(entitlement.user_id)));
};
