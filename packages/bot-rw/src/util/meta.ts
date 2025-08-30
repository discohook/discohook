import type { APIMessageComponentEmoji } from "discord-api-types/v10";

export const color = 0x58b9ff;

export const deluxeColor = 0xff81ff;

export const boolEmoji = (value: boolean | null) =>
  value === null
    ? "<:null:1263857962892660786>"
    : value
      ? "<:true:1263857933209571329>"
      : "<:false:1263857948086505482>";

export const boolPartialEmoji = (
  value: boolean | null,
): APIMessageComponentEmoji =>
  value === null
    ? { name: "null", id: "1263857962892660786" }
    : value
      ? { name: "true", id: "1263857933209571329" }
      : { name: "false", id: "1263857948086505482" };
