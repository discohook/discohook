import { channelLink, time } from "@discordjs/formatters";
import {
  APIEmbed,
  APIGuildMember,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIRole,
  APIUser,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { getDate } from "discord-snowflake";
import type { QueryData, TriggerKVGuild } from "store/src/types";
import { isSnowflakeSafe } from "../commands/reactionRoles.js";
import { cdn } from "../util/cdn.js";
import { FlowFailure, LiveVariables } from "./flows.js";

export const assertGetSnowflake = (id: string): `${bigint}` => {
  if (isSnowflakeSafe(id)) return id;
  throw Error(`${id} is not a snowflake.`);
};

const flattenMember = (
  vars: {
    member?: APIGuildMember | APIInteractionDataResolvedGuildMember;
    user?: APIUser;
    guild?: TriggerKVGuild;
  },
  prefix = "member",
): Record<string, string | number | undefined> => {
  const key = (attr: string) => `${prefix}.${attr}`;

  const mention = vars.user ? `<@${vars.user.id}>` : undefined;
  return {
    [key("role_ids")]: JSON.stringify(vars.member ? vars.member.roles : []),
    // Legacy-compatible (v1) format options
    [key("id")]: vars.user?.id,
    [key("name")]: vars.user?.username,
    [key("discriminator")]: vars.user?.discriminator,
    [key("display_name")]:
      vars.member?.nick ?? vars.user?.global_name ?? vars.user?.username,
    [key("tag")]:
      vars.user?.discriminator === "0"
        ? vars.user.username
        : `${vars.user?.username}#${vars.user?.discriminator}`,
    [key("mention")]: mention,
    [key("avatar_url")]:
      vars.member?.avatar && vars.guild && vars.user
        ? cdn.guildMemberAvatar(
            vars.guild.id,
            vars.user.id,
            vars.member.avatar,
            {
              size: 2048,
              extension: vars.member.avatar.startsWith("a_") ? "gif" : "webp",
            },
          )
        : vars.user?.avatar
          ? cdn.avatar(vars.user.id, vars.user.avatar, {
              size: 2048,
              extension: vars.user.avatar.startsWith("a_") ? "gif" : "webp",
            })
          : cdn.defaultAvatar(
              vars.user
                ? vars.user.discriminator === "0"
                  ? Number((BigInt(vars.user.id) >> 22n) % 6n)
                  : Number(vars.user.discriminator) % 5
                : 5,
            ),
    [key("default_avatar_url")]: cdn.defaultAvatar(
      vars.user
        ? vars.user.discriminator === "0"
          ? Number((BigInt(vars.user.id) >> 22n) % 6n)
          : Number(vars.user.discriminator) % 5
        : 5,
    ),
    [key("bot")]: vars.user?.bot ? "True" : "False",
    [key("created")]: vars.user
      ? time(getDate(assertGetSnowflake(vars.user.id)), "d")
      : undefined,
    [key("created_relative")]: vars.user
      ? time(getDate(assertGetSnowflake(vars.user.id)), "R")
      : undefined,
    [key("created_long")]: vars.user
      ? time(getDate(assertGetSnowflake(vars.user.id)), "F")
      : undefined,
    // User assumptions (other bots may use these?)
    mention,
    user: mention,
  };
};

const flattenChannel = (
  vars: { channel?: APIInteractionDataResolvedChannel },
  prefix = "channel",
): Record<string, string | undefined> => {
  const key = (attr: string) => `${prefix}.${attr}`;
  return {
    [key("id")]: vars.channel?.id,
    [key("name")]: vars.channel?.name ?? undefined,
    [key("mention")]: vars.channel ? `<#${vars.channel.id}>` : undefined,
    [key("link")]: vars.channel ? channelLink(vars.channel.id) : undefined,
  };
};

const flattenRole = (
  vars: { role?: APIRole },
  prefix = "role",
): Record<string, string | number | undefined> => {
  const key = (attr: string) => `${prefix}.${attr}`;
  return {
    [key("id")]: vars.role?.id,
    [key("name")]: vars.role?.name ?? undefined,
    [key("mention")]: vars.role ? `<@&${vars.role.id}>` : undefined,
    [key("color")]: vars.role ? `#${vars.role.color.toString(16)}` : undefined,
    [key("color_decimal")]: vars.role?.color,
  };
};

const ordinal = (num: number): string => {
  const str = String(num);
  return str.endsWith("11") || str.endsWith("12") || str.endsWith("13")
    ? `${num}th`
    : str.endsWith("1")
      ? `${num}st`
      : str.endsWith("2")
        ? `${num}nd`
        : str.endsWith("3")
          ? `${num}rd`
          : `${num}th`;
};

export const getReplacements = (
  vars: LiveVariables,
  setVars: Record<string, string | boolean>,
) => {
  const now = new Date();
  const values: Record<string, string | number | undefined> = {
    ...flattenMember(vars),
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

  // Select menu values
  if (vars.selected_values && vars.selected_values.length !== 0) {
    let i = 0;
    for (const value of vars.selected_values) {
      // Intentionally 1-indexed
      i += 1;
      values[`selected_values.${i}`] = value;
    }
    const first = vars.selected_values[0];
    values.selected_value = first;
    if (vars.selected_resolved && "members" in vars.selected_resolved) {
      const memberVars = flattenMember(
        {
          member: vars.selected_resolved.members?.[first],
          user: vars.selected_resolved.users?.[first],
          guild: vars.guild,
        },
        "selected_member",
      );
      Object.assign(values, memberVars);
    }
    if (vars.selected_resolved && "channels" in vars.selected_resolved) {
      const channelVars = flattenChannel(
        { channel: vars.selected_resolved.channels?.[first] },
        "selected_channel",
      );
      Object.assign(values, channelVars);
    }
    if (vars.selected_resolved && "roles" in vars.selected_resolved) {
      const roleVars = flattenRole(
        { role: vars.selected_resolved.roles?.[first] },
        "selected_role",
      );
      Object.assign(values, roleVars);
    }
  }

  // Allow shadowing per https://discohook.app/guide/recipes/checks
  for (const [key, val] of Object.entries(setVars)) {
    values[key] = String(val);
  }

  // Ordinal for any number value
  for (const [key, val] of Object.entries(values)) {
    if (typeof val === "number") {
      values[`${key}_ordinal`] = ordinal(val);
    }
  }

  return values;
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
    components: message.data.components
      ? structuredClone(message.data.components).map((row) => {
          for (const child of row.components) {
            if (
              child.type === ComponentType.Button &&
              (child.style === ButtonStyle.Link ||
                child.style === ButtonStyle.Premium)
            ) {
              // @ts-expect-error Prevent doublekeying due to site state
              child.custom_id = undefined;
            }
          }
          return row;
        })
      : [],
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
