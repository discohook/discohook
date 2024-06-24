import { APIMessageComponentEmoji } from "discord-api-types/v10";

export const color = 0x58b9ff;

export const deluxeColor = 0xff81ff;

export const boolEmoji = (value: boolean | null) =>
  value === null
    ? "<:null:1253688417275871302>"
    : value
      ? "<:true:834927244500533258>"
      : "<:false:834927293633527839>";

export const boolPartialEmoji = (
  value: boolean | null,
): APIMessageComponentEmoji =>
  value === null
    ? { name: "null", id: "1253688417275871302" }
    : value
      ? { name: "true", id: "834927244500533258" }
      : { name: "false", id: "834927293633527839" };
