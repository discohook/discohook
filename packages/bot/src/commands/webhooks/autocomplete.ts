import {
  type APIGuildChannel,
  type APIWebhook,
  type GuildChannelType,
  Routes,
  WebhookType,
} from "discord-api-types/v10";
import type { AppCommandAutocompleteCallback } from "../../commands.js";

export const webhookAutocomplete: AppCommandAutocompleteCallback = async (
  ctx,
) => {
  // biome-ignore lint/style/noNonNullAssertion: only guild-only commands use this function
  const guildId = ctx.interaction.guild_id!;
  const query = ctx.getStringOption("webhook").value.trim();
  const channel = ctx.getAutocompleteChannelOption("filter-channel");

  // TODO: Use KV here, or query DB if we're confident enough in it

  const [guildWebhooks, channels] = await Promise.all([
    ctx.rest.get(Routes.guildWebhooks(guildId)) as Promise<APIWebhook[]>,
    (async () => {
      if (channel) return [];
      try {
        return await ctx.rest.get(Routes.guildChannels(guildId));
      } catch {
        return [];
      }
    })() as Promise<APIGuildChannel<GuildChannelType>[]>,
  ]);
  // TODO: Make this 'search' function better in the future
  const matches = guildWebhooks
    .filter(
      (w) =>
        w.type === WebhookType.Incoming &&
        w.name &&
        w.name.toLowerCase().includes(query.toLowerCase()) &&
        (channel ? w.channel_id === channel.id : true),
    )
    .sort((a, b) => {
      const alphabeticalScore = (a.name ?? "") > (b.name ?? "") ? -1 : 1;

      const channelA = channels.find((c) => c.id === a.channel_id);
      const channelB = channels.find((c) => c.id === b.channel_id);
      if (channelA && channelB) {
        return (
          channelA.position -
          channelB.position +
          (a.channel_id === b.channel_id ? alphabeticalScore : 0)
        );
      } else if (channelA) {
        return -1;
      }
      return alphabeticalScore;
    });

  return matches.map((w) => {
    const channelHead = channel
      ? ""
      : `#${channels.find((c) => c.id === w.channel_id)?.name ?? "unknown"}: `;
    const userTail = w.user
      ? ` | ${w.user.global_name ?? w.user.username}`
      : "";
    return {
      name: `${channelHead}${w.name}${userTail}`.slice(0, 100),
      value: w.id,
    };
  });
};
