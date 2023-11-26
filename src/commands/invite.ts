import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { ChatInputAppCommandCallback } from "../commands.js";
import { MessageFlags } from "discord-api-types/v10";

export const inviteCallback: ChatInputAppCommandCallback = async (ctx) => {
  const permissions = new PermissionsBitField(0);
  // permissions.set(PermissionFlags.ManageGuild, true);
  // Create & manage webhooks
  permissions.set(PermissionFlags.ManageWebhooks, true);
  permissions.set(PermissionFlags.ManageChannels, true);
  // Flows (add/remove roles from members)
  permissions.set(PermissionFlags.ManageRoles, true);
  // Create buttons?
  permissions.set(PermissionFlags.ManageMessages, true);
  // Welcomer, flows (custom message)
  permissions.set(PermissionFlags.ReadMessageHistory, true);
  permissions.set(PermissionFlags.ViewChannel, true);
  permissions.set(PermissionFlags.SendMessages, true);
  permissions.set(PermissionFlags.EmbedLinks, true);
  permissions.set(PermissionFlags.UseExternalEmojis, true);
  permissions.set(PermissionFlags.AttachFiles, true);
  // Flows
  permissions.set(PermissionFlags.ModerateMembers, true);

  const url = new URL(`https://discord.com/api/oauth2/authorize?` + new URLSearchParams({
    client_id: ctx.followup.applicationId,
    permissions: String(permissions.value),
    scope: 'bot',
  }));

  return ctx.reply({
    content: url.href,
    flags: MessageFlags.Ephemeral,
  })
}
