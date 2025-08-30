import { GatewayDispatchEvents } from "discord-api-types/v10";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.GuildCreate,
  async ({ client, data }) => {
    if (!client.ready) return;
  },
);
