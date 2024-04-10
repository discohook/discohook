import { z } from "zod";
import { getDiscordWebhookAuth } from "~/auth-discord-webhook.server";
import { LoaderArgs } from "~/util/loader";
import { zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { guildId } = zxParseQuery(request, {
    guildId: z.ostring(),
  });

  const discordWebhookAuth = getDiscordWebhookAuth(context);
  request.headers.delete("Cookie");
  try {
    const webhook = await discordWebhookAuth.authenticate("discord", request);
    if (webhook) {
      discordWebhookAuth.logout(request, { redirectTo: request.url });
    }
  } catch (e) {
    const response = e as Response;
    const loc = response.headers.get("Location");
    if (guildId && loc) {
      const url = new URL(loc);
      url.searchParams.set("guild_id", guildId);
      response.headers.set("Location", url.href);
    }
    return response;
  }
  return null;
};
