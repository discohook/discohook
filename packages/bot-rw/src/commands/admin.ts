import dedent from "dedent-js";
import { eq } from "drizzle-orm";
import { upsertDiscordUser, users } from "store";
import type { InteractionContext } from "../interactions.js";
import type { ChatInputAppCommandCallback } from "./handler.js";

const canRunDevCommand = (ctx: InteractionContext) =>
  Bun.env.DEV_OWNER_ID !== undefined &&
  Bun.env.DEV_GUILD_ID !== undefined &&
  ctx.user.id === Bun.env.DEV_OWNER_ID &&
  ctx.interaction.guild_id === Bun.env.DEV_GUILD_ID;

export const leaveCommandHandler: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  if (!canRunDevCommand(ctx)) {
    await ctx.reply({ content: "Not available", ephemeral: true });
    return;
  }

  const guildId = ctx.getStringOption("guild-id").value;
  const reason = ctx.getStringOption("reason").value;
  const sendMsg = ctx.getBooleanOption("send-reason-message").value;
  const ban = ctx.getBooleanOption("ban").value;

  await ctx.defer({ ephemeral: true });

  if (ban) {
    await ctx.client.KV.put(
      `moderation-guild-${guildId}`,
      JSON.stringify({ state: "banned", reason }),
    );
  }

  if (sendMsg) {
    const guild = await ctx.client.api.guilds.get(guildId);
    const dm = await ctx.client.api.users.createDM(guild.owner_id);
    await ctx.client.api.channels.createMessage(dm.id, {
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
          Bun.env.DISCOHOOK_ORIGIN
        }/legal).
        ${
          ban
            ? "\nIf you attempt to re-add the bot, it will leave automatically.\n"
            : ""
        }
        If you believe this was done in error, contact us on the [Discohook support server](${
          Bun.env.DISCOHOOK_ORIGIN
        }/discord).
      `.trim(),
    });
  }

  await ctx.client.api.users.leaveGuild(guildId);
  await ctx.followup.editOriginalMessage({ content: `Left server ${guildId}` });
};

const USD_REGEX = /^\$(\d+)$/;

const TIME_REGEX = /^(\d+)(d|w|m|y)$/i;

// $6 / 30 days = 20c per day
const USD_PER_DAY = 6 / 30;

export const grantDeluxeCommandHandler: ChatInputAppCommandCallback<
  true
> = async (ctx) => {
  if (!canRunDevCommand(ctx)) {
    await ctx.reply({ content: "Not available", ephemeral: true });
    return;
  }

  const userId = ctx.getStringOption("user-id").value;
  const duration = ctx.getStringOption("duration").value;

  let days: number;
  let lifetime: boolean | undefined;
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
      const unit = (match[2] ?? "null").toLowerCase() as "d" | "w" | "m" | "y";
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
          await ctx.reply({
            content: `Could not resolve value of unit "${unit}"`,
            ephemeral: true,
          });
          return;
      }
      break;
    }
    case duration === "lifetime": {
      days = 0;
      lifetime = true;
      break;
    }
    default:
      await ctx.reply({
        content: "Invalid duration format",
        ephemeral: true,
      });
      return;
  }
  days = Math.ceil(days);

  const discordUser = await ctx.client.api.users.get(userId);

  const db = ctx.client.getDb();
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
      subscriptionExpiresAt: lifetime ? null : expiresAt,
      lifetime,
    })
    .where(eq(users.id, dbUser.id));

  await ctx.reply({
    content: `Granted ${lifetime ? "♾️" : days} days of Deluxe membership to ${discordUser.username} (${discordUser.id})`,
    ephemeral: true,
  });
};

export const revokeDeluxeCommandHandler: ChatInputAppCommandCallback<
  true
> = async (ctx) => {
  if (!canRunDevCommand(ctx)) {
    return ctx.reply({ content: "Not available", ephemeral: true });
  }

  const userId = ctx.getStringOption("user-id").value;
  const discordUser = await ctx.client.api.users.get(userId);

  const db = ctx.client.getDb();
  await db
    .update(users)
    .set({
      lifetime: false,
      subscribedSince: null,
      subscriptionExpiresAt: null,
    })
    .where(eq(users.discordId, BigInt(userId)));

  await ctx.reply({
    content: `Revoked Deluxe membership from ${discordUser.username} (${discordUser.id})`,
    ephemeral: true,
  });
};
