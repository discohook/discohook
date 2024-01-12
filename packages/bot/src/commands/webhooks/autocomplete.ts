import { APIWebhook, Routes } from "discord-api-types/v10";
import { AppCommandAutocompleteCallback } from "../../commands.js";

export const webhookAutocomplete: AppCommandAutocompleteCallback = async (
  ctx,
) => {
  const query = ctx.getStringOption("webhook").value.trim();
  const channel = ctx.getChannelOption("filter-channel");

  // Use KV here, or query DB if we're confident enough in it
  // Maybe we can refresh all channels on the webhook_update event

  const guildWebhooks = (await ctx.rest.get(
    // biome-ignore lint/style/noNonNullAssertion:
    Routes.guildWebhooks(ctx.interaction.guild_id!),
  )) as APIWebhook[];
  // Make this 'search' function better in the future
  const matches = guildWebhooks.filter(
    (w) =>
      !w.source_guild &&
      w.name &&
      w.name.toLowerCase().includes(query.toLowerCase()) &&
      (channel ? w.channel_id === channel.id : true),
  );

  return matches.map((w) => ({
    name: `${w.name}${
      w.user ? ` | ${w.user.global_name ?? w.user.username}` : ""
    }`.slice(0, 100),
    value: w.id,
  }));
};
