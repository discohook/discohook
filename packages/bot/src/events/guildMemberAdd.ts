import { GatewayGuildMemberAddDispatchData } from "discord-api-types/v10";
import { GatewayEventCallback } from "../events.js";

export const guildMemberAddCallback: GatewayEventCallback = async (
  payload: GatewayGuildMemberAddDispatchData,
) => {
  console.log(payload);
};
