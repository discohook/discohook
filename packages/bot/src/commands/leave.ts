import dedent from "dedent-js";
import {
  APIDMChannel,
  APIGuild,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPICurrentUserCreateDMChannelJSONBody,
  Routes,
} from "discord-api-types/v10";
import { ChatInputAppCommandCallback } from "../commands.js";

export const leaveCommandHandler: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  if (
    !ctx.env.DEV_OWNER_ID ||
    !ctx.env.DEV_GUILD_ID ||
    ctx.user.id !== ctx.env.DEV_OWNER_ID ||
    ctx.interaction.guild_id !== ctx.env.DEV_GUILD_ID
  ) {
    return ctx.reply({ content: "Not available", ephemeral: true });
  }

  const guildId = ctx.getStringOption("guild-id").value;
  const reason = ctx.getStringOption("reason").value;
  const sendMsg = ctx.getBooleanOption("send-reason-message").value;
  const ban = ctx.getBooleanOption("ban").value;

  if (ban) {
    await ctx.env.KV.put(
      `moderation-guild-${guildId}`,
      JSON.stringify({ state: "banned", reason }),
    );
  }

  if (sendMsg) {
    const guild = (await ctx.rest.get(Routes.guild(guildId))) as APIGuild;
    const dm = (await ctx.rest.post(Routes.userChannels(), {
      body: {
        recipient_id: guild.owner_id,
      } satisfies RESTPostAPICurrentUserCreateDMChannelJSONBody,
    })) as APIDMChannel;
    await ctx.rest.post(Routes.channelMessages(dm.id), {
      body: {
        content: dedent`
          Hello,

          ${[
            `Discohook Utils has just left your server **${guild.name}** (${guild.id}).`,
            "Message components will be unresponsive (except for link buttons),",
            "and you will not be able to send or edit messages using webhooks owned by Discohook.",
          ].join(" ")}

          The reason given is below:
          > ${reason.replace(/\n/g, "\n> ")}

          You may wish to review Discohook's [terms of service](${
            ctx.env.DISCOHOOK_ORIGIN
          }/legal).
          ${
            ban
              ? "\nIf you attempt to re-add the bot, it will leave automatically.\n"
              : ""
          }
          If you believe this was done in error, contact us on the [Discohook support server](${
            ctx.env.DISCOHOOK_ORIGIN
          }/discord).
        `.trim(),
      } satisfies RESTPostAPIChannelMessageJSONBody,
    });
  }

  await ctx.rest.delete(Routes.userGuild(guildId));
  return ctx.reply({ content: `Left server ${guildId}`, ephemeral: true });
};
