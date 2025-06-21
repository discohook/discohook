import { GatewayDispatchEvents } from "discord-api-types/v10";
import { applicationAuthorizedCallback } from "./events/applicationAuthorized.js";
import { channelDeleteCallback } from "./events/channelDelete.js";
import {
  entitlementCreateCallback,
  entitlementUpdateCallback,
} from "./events/entitlementCreate.js";
import { entitlementDeleteCallback } from "./events/entitlementDelete.js";
import { guildDeleteCallback } from "./events/guildDelete.js";
import { guildMemberAddCallback } from "./events/guildMemberAdd.js";
import { guildMemberRemoveCallback } from "./events/guildMemberRemove.js";
import { messageReactionAddCallback } from "./events/messageReactionAdd.js";
import { messageReactionRemoveCallback } from "./events/messageReactionRemove.js";
import { webhooksUpdateCallback } from "./events/webhooksUpdate.js";
import type { Env } from "./types/env.js";
import { WebhookEvents } from "./types/webhook-events.js";

export type GatewayEventCallback = (env: Env, payload: any) => Promise<any>;

export const gatewayEventNameToCallback: Partial<
  Record<GatewayDispatchEvents, GatewayEventCallback>
> = {
  [GatewayDispatchEvents.GuildMemberAdd]: guildMemberAddCallback,
  [GatewayDispatchEvents.GuildMemberRemove]: guildMemberRemoveCallback,
  [GatewayDispatchEvents.GuildDelete]: guildDeleteCallback,
  [GatewayDispatchEvents.WebhooksUpdate]: webhooksUpdateCallback,
  [GatewayDispatchEvents.ChannelDelete]: channelDeleteCallback,
  [GatewayDispatchEvents.MessageReactionAdd]: messageReactionAddCallback,
  [GatewayDispatchEvents.MessageReactionRemove]: messageReactionRemoveCallback,
  [GatewayDispatchEvents.EntitlementUpdate]: entitlementUpdateCallback,
  [GatewayDispatchEvents.EntitlementDelete]: entitlementDeleteCallback,
};

export const webhookEventNameToCallback: Partial<
  Record<WebhookEvents, GatewayEventCallback>
> = {
  [WebhookEvents.ApplicationAuthorized]: applicationAuthorizedCallback,
  [WebhookEvents.EntitlementCreate]: entitlementCreateCallback,
};
