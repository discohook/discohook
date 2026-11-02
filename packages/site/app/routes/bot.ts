import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { redirect } from "react-router";
import type { LoaderArgs } from "~/util/loader";

const permissions = new PermissionsBitField(0);
// permissions.set(PermissionFlags.ManageGuild, true);
// Create & manage webhooks
permissions.set(PermissionFlags.ManageWebhooks, true);
permissions.set(PermissionFlags.ManageChannels, true);
// Flows (add/remove roles from members)
permissions.set(PermissionFlags.ManageRoles, true);
// Manage components, restore w/ options
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
// Profile (nickname)
permissions.set(PermissionFlags.ChangeNickname, true);

export const loader = ({ request, context }: LoaderArgs) => {
  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get("guildId");

  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", context.env.DISCORD_CLIENT_ID);
  url.searchParams.set("scope", "bot applications.commands");
  url.searchParams.set("permissions", permissions.toString());
  if (guildId) {
    url.searchParams.set("guild_id", guildId);
  }
  // if (searchParams.get("redirect") === "s") {
  //   url.searchParams.set("redirect_uri", `${origin}/s`);
  //   url.searchParams.set(
  //     "scope",
  //     "bot applications.commands guilds.members.read",
  //   );
  // }

  return redirect(url.href);
};
