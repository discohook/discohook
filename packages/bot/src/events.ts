import { GatewayDispatchEvents } from "discord-api-types/v10";
import { guildMemberAddCallback } from "./events/guildMemberAdd.js";
import { guildMemberRemoveCallback } from "./events/guildMemberRemove.js";

export type GatewayEventCallback = (payload: any) => Promise<void>;

export const eventNameToCallback: Partial<
  Record<GatewayDispatchEvents, GatewayEventCallback>
> = {
  [GatewayDispatchEvents.GuildMemberAdd]: guildMemberAddCallback,
  [GatewayDispatchEvents.GuildMemberRemove]: guildMemberRemoveCallback,
};
