import { APIMessageComponentEmoji } from "discord-api-types/v10";

export const color = 0x58b9ff;

export const deluxeColor = 0xff81ff;

export const boolEmoji = (value: boolean) =>
  value ? "<:true:834927244500533258>" : "<:false:834927293633527839>";

export const boolPartialEmoji = (value: boolean): APIMessageComponentEmoji =>
  value
    ? { name: "true", id: "834927244500533258" }
    : { name: "false", id: "834927293633527839" };
