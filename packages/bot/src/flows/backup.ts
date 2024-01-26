import { time } from "@discordjs/formatters";
import { getDate } from "discord-snowflake";
import { makeSnowflake } from "store/src/schema";
import type { QueryData } from "store/src/types";
import { cdn } from "../util/cdn.js";
import { LiveVariables } from "./flows.js";

export const getReplacements = (
  vars: LiveVariables,
  setVars: Record<string, string>,
) => {
  const now = new Date();
  return {
    ...setVars,
    // Legacy (v1) format options
    // Member
    "member.id": vars.user?.id,
    "member.name": vars.user?.username,
    "member.discriminator": vars.user?.discriminator,
    "member.display_name":
      vars.member?.nick ?? vars.user?.global_name ?? vars.user?.username,
    "member.tag":
      vars.user?.discriminator === "0"
        ? `${vars.user.username}#${vars.user.discriminator}`
        : vars.user?.username,
    "member.mention": vars.user ? `<@${vars.user.id}>` : undefined,
    "member.avatar_url":
      vars.member?.avatar && vars.guild && vars.user
        ? cdn.guildMemberAvatar(
            vars.guild.id,
            vars.user.id,
            vars.member.avatar,
            { size: 2048 },
          )
        : vars.user?.avatar
          ? cdn.avatar(vars.user.id, vars.user.avatar)
          : cdn.defaultAvatar(
              vars.user
                ? vars.user.discriminator === "0"
                  ? Number((BigInt(vars.user.id) >> 22n) % 6n)
                  : Number(vars.user.discriminator) % 5
                : 5,
            ),
    "member.default_avatar_url": cdn.defaultAvatar(
      vars.user
        ? vars.user.discriminator === "0"
          ? Number((BigInt(vars.user.id) >> 22n) % 6n)
          : Number(vars.user.discriminator) % 5
        : 5,
    ),
    "member.bot": vars.user?.bot ? "True" : "False",
    "member.created": vars.user
      ? time(getDate(makeSnowflake(vars.user.id)), "d")
      : undefined,
    "member.created_relative": vars.user
      ? time(getDate(makeSnowflake(vars.user.id)), "R")
      : undefined,
    "member.created_long": vars.user
      ? time(getDate(makeSnowflake(vars.user.id)), "F")
      : undefined,
    // Server
    "server.id": vars.guild?.id,
    "server.name": vars.guild?.name,
    "server.icon_url": vars.guild?.icon
      ? cdn.icon(vars.guild.id, vars.guild.icon, { size: 2048 })
      : "",
    "server.members": vars.guild?.members,
    // "server.online_members": vars.guild?.online_members,
    "server.channels": 0,
    "server.roles": vars.guild?.roles,
    "server.boosts": vars.guild?.boosts,
    // "server.emojis": vars.guild?.emojis,
    "server.emoji_limit": vars.guild?.emoji_limit,
    "server.sticker_limit": vars.guild?.sticker_limit,
    "server.created": vars.guild
      ? time(getDate(makeSnowflake(vars.guild.id)), "d")
      : undefined,
    "server.created_relative": vars.guild
      ? time(getDate(makeSnowflake(vars.guild.id)), "R")
      : undefined,
    "server.created_long": vars.guild
      ? time(getDate(makeSnowflake(vars.guild.id)), "F")
      : undefined,
    // More
    now: time(now, "d"),
    now_relative: time(now, "R"),
    now_long: time(now, "F"),
  };
};

export const processQueryData = async (
  data: QueryData,
  vars: LiveVariables,
  setVars: Record<string, string>,
) => {
  return data.messages.map((message) => {
    const data = {
      content: message.data.content,
      embeds: message.data.embeds,
      components: message.data.components,
      username: message.data.author?.name,
      avatar_url: message.data.author?.icon_url,
    };
    let stringified = JSON.stringify(data);
    const replacements = getReplacements(vars, setVars);
    for (const [key, value] of Object.entries(replacements)) {
      if (
        value == null ||
        key.includes(" ") ||
        Object.keys(data).includes(key)
      ) {
        continue;
      }
      // Remains to be seen if this is a good solution. Even more otherwise.
      // I think it's sensible and reasonably sandboxed, but I haven't yet
      // explored the possibilities of people purposely trying to break out
      // of it. If you are one of those people, please report to me privately!
      // Visit /discord on the main site.
      stringified = stringified.replaceAll(`{${key}}`, String(value));
    }
    const parsed = JSON.parse(stringified) as typeof data;
    return parsed;
  });
};
