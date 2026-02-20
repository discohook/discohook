import { WebhookType } from "discord-api-types/v10";
import type { AppCommandAutocompleteCallback } from "../handler.js";

export const webhookAutocomplete: AppCommandAutocompleteCallback = async (
  ctx,
) => {
  // biome-ignore lint/style/noNonNullAssertion: only guild-only commands use this function
  const guildId = ctx.interaction.guild_id!;
  const query = ctx.getStringOption("webhook").value.trim();
  const channel = ctx.getAutocompleteChannelOption("filter-channel");

  const cached = ctx.client.guildWebhooks.get(guildId);
  if (cached) {
    const matches = cached
      .filter(
        (w) =>
          (channel ? w.channel.id === channel.id : true) &&
          w.name &&
          w.name.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => {
        const alphabeticalScore = (a.name ?? "") > (b.name ?? "") ? -1 : 1;
        const posScore = a.channel.position - b.channel.position;
        return (
          posScore + (a.channel.id === b.channel.id ? alphabeticalScore : 0)
        );
      });
    return matches.map((w) => {
      const channelHead = channel ? "" : `#${w.channel.name ?? "unknown"}: `;
      const userTail = w.user
        ? ` | ${w.user.global_name ?? w.user.username}`
        : "";
      return {
        name: `${channelHead}${w.name}${userTail}`.slice(0, 100),
        value: w.id,
      };
    });
  }

  const [guildWebhooks, channels] = await Promise.all([
    ctx.client.api.guilds.getWebhooks(guildId),
    (async () => {
      if (channel) return [];
      try {
        return await ctx.client.api.guilds.getChannels(guildId);
      } catch {
        return [];
      }
    })(),
  ]);
  ctx.client.guildWebhooks.set(
    guildId,
    guildWebhooks
      .filter((w) => w.type === WebhookType.Incoming)
      .map((webhook) => {
        const channel = channels.find((c) => c.id === webhook.channel_id);
        return {
          id: webhook.id,
          name: webhook.name,
          user: webhook.user
            ? {
                username: webhook.user.username,
                global_name: webhook.user.global_name,
              }
            : undefined,
          channel: channel
            ? {
                id: channel.id,
                name: channel.name ?? "unknown",
                position: "position" in channel ? channel.position : 0,
              }
            : {
                id: webhook.channel_id,
                name: "unknown",
                position: 0,
              },
        };
      }),
  );

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
        const aPos = "position" in channelA ? channelA.position : 0;
        const bPos = "position" in channelB ? channelB.position : 0;
        return (
          aPos - bPos + (a.channel_id === b.channel_id ? alphabeticalScore : 0)
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
