import { ButtonBuilder, ContainerBuilder } from "@discordjs/builders";
import { ButtonStyle } from "@discordjs/core";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { cdn } from "../util/cdn.js";
import type { ChatInputAppCommandCallback } from "./handler.js";

const permissions = new PermissionsBitField(0);
// permissions.set(PermissionFlags.ManageGuild, true);
// Create & manage webhooks & their messages
permissions.set(PermissionFlags.ManageWebhooks, true);
permissions.set(PermissionFlags.ManageChannels, true);
permissions.set(PermissionFlags.ManageMessages, true);
// Flows (add/remove roles from members)
permissions.set(PermissionFlags.ManageRoles, true);
// Welcomer, flows (custom message, create thread)
permissions.set(PermissionFlags.ReadMessageHistory, true);
permissions.set(PermissionFlags.ViewChannel, true);
permissions.set(PermissionFlags.SendMessages, true);
permissions.set(PermissionFlags.EmbedLinks, true);
permissions.set(PermissionFlags.UseExternalEmojis, true);
permissions.set(PermissionFlags.AttachFiles, true);
permissions.set(PermissionFlags.CreatePublicThreads, true);
permissions.set(PermissionFlags.CreatePrivateThreads, true);
permissions.set(PermissionFlags.SendMessagesInThreads, true);
// Profile customization
permissions.set(PermissionFlags.ChangeNickname, true);
// Flows
// permissions.set(PermissionFlags.ModerateMembers, true);

const url = new URL(
  `https://discord.com/oauth2/authorize?${new URLSearchParams({
    client_id: Bun.env.DISCORD_APPLICATION_ID,
    permissions: permissions.toString(),
    scope: "bot",
  })}`,
);

export const inviteCallback: ChatInputAppCommandCallback = async (ctx) => {
  const emojiId = ctx.isPremium()
    ? "1356993126513901599" // pink
    : "793970422504751114"; // blue

  const container = new ContainerBuilder()
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents((t) =>
          t.setContent(
            "## Add Discohook to your server\nAfter inviting, you can use Discohook to create buttons, selects, and custom flows.",
          ),
        )
        .setThumbnailAccessory((t) => t.setURL(cdn.emoji(emojiId))),
    )
    .addActionRowComponents((r) =>
      r.addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(url.href)
          .setLabel("Invite"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(`${Bun.env.DISCOHOOK_ORIGIN}/guide`)
          .setLabel("Guides"),
      ),
    );

  await ctx.reply({
    components: [container],
    ephemeral: true,
    componentsV2: true,
  });
};
