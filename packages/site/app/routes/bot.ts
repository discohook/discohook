import { redirect } from "@remix-run/cloudflare";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { LoaderArgs } from "~/util/loader";

const permissions = new PermissionsBitField(0);
// permissions.set(PermissionFlags.ManageGuild, true);
// Create & manage webhooks
permissions.set(PermissionFlags.ManageWebhooks, true);
permissions.set(PermissionFlags.ManageChannels, true);
// Flows (add/remove roles from members)
permissions.set(PermissionFlags.ManageRoles, true);
// Create buttons?
permissions.set(PermissionFlags.ManageMessages, true);
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
// Flows
permissions.set(PermissionFlags.ModerateMembers, true);

export const loader = ({ request, context }: LoaderArgs) =>
  redirect(
    new URL(
      `https://discord.com/oauth2/authorize?${new URLSearchParams({
        client_id: context.env.DISCORD_CLIENT_ID,
        scope: "bot applications.commands",
        permissions: permissions.toString(),
        guild_id: new URL(request.url).searchParams.get("guildId") ?? "",
      })}`,
    ).href,
  );
