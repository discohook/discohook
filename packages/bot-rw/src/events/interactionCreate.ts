import { GatewayDispatchEvents } from "discord-api-types/v10";
import { interactionCreateHandler } from "../commands/handler";
import { createHandler } from "./handler";

export default createHandler(
  GatewayDispatchEvents.InteractionCreate,
  interactionCreateHandler,
);
