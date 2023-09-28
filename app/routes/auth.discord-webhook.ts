import { LoaderFunctionArgs } from "@remix-run/node";
import { discordWebhookAuth } from "~/auth-discord-webhook.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const webhook = await discordWebhookAuth.authenticate("discord", request);
  if (webhook) {
    discordWebhookAuth.logout(request, { redirectTo: "/auth/discord-webhook" });
  }
  return null;
};
