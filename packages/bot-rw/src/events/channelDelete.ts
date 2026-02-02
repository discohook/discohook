import { GatewayDispatchEvents } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { webhooks } from "store";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.ChannelDelete,
  async ({ data, client }) => {
    const db = client.getDb();
    await db.delete(webhooks).where(eq(webhooks.channelId, data.id));
  },
);
