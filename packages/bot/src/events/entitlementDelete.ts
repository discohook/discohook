import { APIEntitlement } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb } from "store";
import { makeSnowflake, users } from "store/src/schema";
import { GatewayEventCallback } from "../events.js";

// Discord removed the entitlement. I think in any case this means the user is
// no longer subscribed (through discord, at least), so it's safe to carefully
// remove subscription information
export const entitlementDeleteCallback: GatewayEventCallback = async (
  env,
  entitlement: APIEntitlement,
) => {
  const db = getDb(env.HYPERDRIVE);
  if (entitlement.application_id !== env.DISCORD_APPLICATION_ID) return;
  if (!entitlement.user_id) return;

  const lifetimeSKU =
    !!env.LIFETIME_SKU && entitlement.sku_id === env.LIFETIME_SKU;
  await db
    .update(users)
    .set({
      lifetime: lifetimeSKU ? false : undefined,
      subscribedSince: lifetimeSKU ? undefined : null,
      subscriptionExpiresAt: lifetimeSKU ? undefined : null,
    })
    .where(eq(users.discordId, makeSnowflake(entitlement.user_id)));
};
