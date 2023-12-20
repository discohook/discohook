import { getDiscordWebhookAuth } from "~/auth-discord-webhook.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const discordWebhookAuth = getDiscordWebhookAuth(context);
  const webhook = await discordWebhookAuth.authenticate("discord", request);
  if (webhook) {
    discordWebhookAuth.logout(request, { redirectTo: "/auth/discord-webhook" });
  }
  return null;
};
