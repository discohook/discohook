import { useLoaderData } from "@remix-run/react";
import { APIWebhook } from "discord-api-types/v10";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDiscordWebhookAuth } from "~/auth-discord-webhook.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({
  request,
  context,
}: LoaderArgs): Promise<{
  error: string | null;
  webhook: APIWebhook | null;
}> => {
  const search = new URL(request.url).searchParams;
  if (search.get("error")) {
    return {
      error: search.get("error_description") ?? search.get("error"),
      webhook: null,
    };
  }
  try {
    const webhook = await getDiscordWebhookAuth(context).authenticate(
      "discord",
      request,
    );
    return { error: null, webhook };
  } catch (e) {
    if (e instanceof Response) {
      const txt = await e.text();
      let message = txt;
      try {
        const parsed = JSON.parse(txt) as { message: string };
        if (parsed.message) {
          try {
            const layer2 = JSON.parse(parsed.message) as {
              message: string;
              code: number;
            };
            if (layer2.message) {
              message = layer2.message;
            }
          } catch {
            message = parsed.message;
          }
        }
      } catch {}

      return { error: message, webhook: null };
    }
    return { error: String(e), webhook: null };
  }
};

export default function CreateWebhookPopup() {
  const { t } = useTranslation();
  const { error, webhook } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (window.opener && !error) {
      if (webhook) {
        window.opener.handlePopupClose(webhook);
      }
      window.close();
    }
  }, [webhook, error]);

  return (
    <div className="h-full flex">
      <div className="m-auto p-2 max-w-4xl">
        <p className="font-medium text-lg">
          {t(error ? "webhookCreateFailed" : "webhookCreated")}
        </p>
        {error ? (
          <p className="italic">{error}</p>
        ) : (
          <p>{t("webhookCreateSubtitle")}</p>
        )}
      </div>
    </div>
  );
}
