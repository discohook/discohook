import { GatewayDispatchEvents } from "discord-api-types/v10";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.GuildDelete,
  async ({ api, data }) => {
    if (data.unavailable) return;
  },
);
