import { GatewayDispatchEvents } from "discord-api-types/v10";
import { guildCreateCallback } from "./events/guildCreate.js";
import { guildDeleteCallback } from "./events/guildDelete.js";
import { guildMemberAddCallback } from "./events/guildMemberAdd.js";
import { guildMemberRemoveCallback } from "./events/guildMemberRemove.js";
import { messageReactionAddCallback } from "./events/messageReactionAdd.js";
import { messageReactionRemoveCallback } from "./events/messageReactionRemove.js";
import { webhooksUpdateCallback } from "./events/webhooksUpdate.js";
import { Env } from "./types/env.js";

export type GatewayEventCallback = (env: Env, payload: any) => Promise<void>;

export const eventNameToCallback: Partial<
  Record<GatewayDispatchEvents, GatewayEventCallback>
> = {
  [GatewayDispatchEvents.GuildMemberAdd]: guildMemberAddCallback,
  [GatewayDispatchEvents.GuildMemberRemove]: guildMemberRemoveCallback,
  [GatewayDispatchEvents.GuildCreate]: guildCreateCallback,
  [GatewayDispatchEvents.GuildDelete]: guildDeleteCallback,
  [GatewayDispatchEvents.WebhooksUpdate]: webhooksUpdateCallback,
  [GatewayDispatchEvents.MessageReactionAdd]: messageReactionAddCallback,
  [GatewayDispatchEvents.MessageReactionRemove]: messageReactionRemoveCallback,
};
