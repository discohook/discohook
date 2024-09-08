import { time } from "@discordjs/formatters";
import { APIEmbed } from "discord-api-types/v10";
import { getDate } from "discord-snowflake";
import type { QueryData } from "store/src/types";
import { isSnowflakeSafe } from "../commands/reactionRoles.js";
import { cdn } from "../util/cdn.js";
import { FlowFailure, LiveVariables } from "./flows.js";

export const assertGetSnowflake = (id: string): `${bigint}` => {
  if (isSnowflakeSafe(id)) return id;
  throw Error(`${id} is not a snowflake.`);
};

export const getReplacements = (
  vars: LiveVariables,
  setVars: Record<string, string | boolean>,
) => {
  const now = new Date();
  return {
    // TODO: This prevents shadowing. Do we want to allow users to shadow variables?
    ...Object.fromEntries(
      Object.entries(setVars).map(([k, v]) => [k, String(v)]),
    ),
    "member.role_ids": JSON.stringify(vars.member ? vars.member.roles : []),
    // Legacy (v1) format options
    // Member
    "member.id": vars.user?.id,
    "member.name": vars.user?.username,
    "member.discriminator": vars.user?.discriminator,
    "member.display_name":
      vars.member?.nick ?? vars.user?.global_name ?? vars.user?.username,
    "member.tag":
      vars.user?.discriminator === "0"
        ? vars.user.username
        : `${vars.user?.username}#${vars.user?.discriminator}`,
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
      ? time(getDate(assertGetSnowflake(vars.user.id)), "d")
      : undefined,
    "member.created_relative": vars.user
      ? time(getDate(assertGetSnowflake(vars.user.id)), "R")
      : undefined,
    "member.created_long": vars.user
      ? time(getDate(assertGetSnowflake(vars.user.id)), "F")
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
      ? time(getDate(assertGetSnowflake(vars.guild.id)), "d")
      : undefined,
    "server.created_relative": vars.guild
      ? time(getDate(assertGetSnowflake(vars.guild.id)), "R")
      : undefined,
    "server.created_long": vars.guild
      ? time(getDate(assertGetSnowflake(vars.guild.id)), "F")
      : undefined,
    // More
    now: time(now, "d"),
    now_relative: time(now, "R"),
    now_long: time(now, "F"),
  };
};

export const processQueryData = async (
  queryData: QueryData,
  vars: LiveVariables,
  setVars: Record<string, string | boolean>,
  messageIndex?: number | null,
) => {
  const message =
    messageIndex === null
      ? queryData.messages[
          Math.floor(Math.random() * queryData.messages.length)
        ]
      : queryData.messages[messageIndex ?? 0];
  if (!message) {
    throw new FlowFailure("No message at the specified position.");
  }

  const query = new URLSearchParams();
  if (message.thread_id) {
    // TODO: should be templatable?
    query.set("thread_id", message.thread_id);
  }
  const data = {
    content: message.data.content || undefined,
    embeds:
      message.data.embeds?.map((e) => {
        if (e.color === null) e.color = undefined;
        return e as APIEmbed;
      }) || undefined,
    components: message.data.components,
    username: message.data.author?.name,
    avatar_url: message.data.author?.icon_url,
    thread_name: message.data.thread_name,
    flags: message.data.flags,
  };
  let stringified = JSON.stringify(data);
  const replacements = getReplacements(vars, setVars);
  for (const [key, value] of Object.entries(replacements)) {
    if (value == null || key.includes(" ") || Object.keys(data).includes(key)) {
      continue;
    }
    // Remains to be seen if this is a good solution. I think it's reasonably
    // "sandboxed," but I haven't yet explored purposely trying to break out
    // of it. If you can do that or know how, please report to me privately!
    // https://discohook.app/discord
    stringified = stringified.replaceAll(`{${key}}`, String(value));
  }
  const parsed = JSON.parse(stringified) as typeof data;
  return { body: parsed, query };
};
