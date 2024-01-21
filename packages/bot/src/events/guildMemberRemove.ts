import { GatewayGuildMemberRemoveDispatchData } from "discord-api-types/v10";
import { GatewayEventCallback } from "../events.js";

export const guildMemberRemoveCallback: GatewayEventCallback = async (payload: GatewayGuildMemberRemoveDispatchData) => {
}
