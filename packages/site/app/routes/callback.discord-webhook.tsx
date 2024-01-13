import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getDiscordWebhookAuth } from "~/auth-discord-webhook.server";
import { LoaderArgs } from "~/util/loader";

const strings = {
  created: "Webhook Created",
  failed: "Failed to create webhook",
  subtitle: "You should be returned to the editor shortly.",
};

export const loader = async ({ request, context }: LoaderArgs) => {
  const search = new URL(request.url).searchParams;
  if (search.get("error")) {
    return {
      error: search.get("error_description") ?? search.get("error"),
      webhook: null,
    };
  }
  const webhook = await getDiscordWebhookAuth(context).authenticate(
    "discord",
    request,
  );
  return { error: null, webhook };
};

export default function CreateWebhookPopup() {
  const { error, webhook } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (window.opener) {
      if (webhook) {
        window.opener.handlePopupClose(webhook);
      }
      window.close();
    }
  }, [webhook]);

  return (
    <div className="h-full flex">
      <div className="m-auto p-2 bg-gray-300 max-w-4xl">
        <p className="font-medium text-lg">
          {error ? strings.failed : strings.created}
        </p>
        {error && <p className="italic">{error}</p>}
        <p>{strings.subtitle}</p>
      </div>
    </div>
  );
}
