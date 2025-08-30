import { GatewayDispatchEvents } from "discord-api-types/v10";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.WebhooksUpdate,
  async ({ data, api }) => {},
);
