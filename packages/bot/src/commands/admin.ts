import dedent from "dedent-js";
import {
  APIDMChannel,
  APIGuild,
  APIUser,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPICurrentUserCreateDMChannelJSONBody,
  Routes,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb, upsertDiscordUser } from "store";
import { users } from "store/src/schema/schema.js";
import { ChatInputAppCommandCallback } from "../commands.js";
import { InteractionContext } from "../interactions.js";

const canRunDevCommand = (ctx: InteractionContext) =>
  ctx.env.DEV_OWNER_ID !== undefined &&
  ctx.env.DEV_GUILD_ID !== undefined &&
  ctx.user.id === ctx.env.DEV_OWNER_ID &&
  ctx.interaction.guild_id === ctx.env.DEV_GUILD_ID;

export const leaveCommandHandler: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  if (!canRunDevCommand(ctx)) {
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

const USD_REGEX = /^\$(\d+)$/;

const TIME_REGEX = /^(\d+)(d|w|m|y)$/i;

// $6 / 30 days = 20c per day
const USD_PER_DAY = 6 / 30;

export const grantDeluxeCommandHandler: ChatInputAppCommandCallback<true> =
  async (ctx) => {
    if (!canRunDevCommand(ctx)) {
      return ctx.reply({ content: "Not available", ephemeral: true });
    }

    const userId = ctx.getStringOption("user-id").value;
    const duration = ctx.getStringOption("duration").value;

    let days: number;
    switch (true) {
      case USD_REGEX.test(duration): {
        // biome-ignore lint/style/noNonNullAssertion: above
        const match = USD_REGEX.exec(duration)!;
        const dollars = Number(match[1]);
        days = dollars / USD_PER_DAY;
        break;
      }
      case TIME_REGEX.test(duration): {
        // biome-ignore lint/style/noNonNullAssertion: above
        const match = TIME_REGEX.exec(duration)!;
        const amount = Number(match[1]);
        const unit = match[2].toLowerCase() as "d" | "w" | "m" | "y";
        switch (unit) {
          case "d":
            days = amount;
            break;
          case "w":
            days = amount * 7;
            break;
          case "m":
            days = amount * 31;
            break;
          case "y":
            days = amount * 366;
            break;
          default:
            return ctx.reply({
              content: `Could not resolve value of unit "${unit}"`,
              ephemeral: true,
            });
        }
        break;
      }
      default:
        return ctx.reply({
          content: "Invalid duration format",
          ephemeral: true,
        });
    }
    days = Math.ceil(days);

    const discordUser = (await ctx.rest.get(Routes.user(userId))) as APIUser;

    const db = getDb(ctx.env.HYPERDRIVE);
    const dbUser = await upsertDiscordUser(db, discordUser);

    const now = new Date();
    const expiresAt = new Date(
      // Stack renewals as much as possible
      (dbUser.subscriptionExpiresAt &&
      dbUser.subscriptionExpiresAt.getTime() > now.getTime()
        ? dbUser.subscriptionExpiresAt
        : now
      ).getTime() +
        days * 86_400_000,
    );

    // TODO: create entitlement and expire it after time allotted
    await db
      .update(users)
      .set({
        firstSubscribed: dbUser.firstSubscribed ?? now,
        subscribedSince: dbUser.subscribedSince ?? now,
        subscriptionExpiresAt: expiresAt,
      })
      .where(eq(users.id, dbUser.id));

    return ctx.reply({
      content: `Granted ${days} days of Deluxe membership to ${discordUser.username} (${discordUser.id})`,
      ephemeral: true,
    });
  };
