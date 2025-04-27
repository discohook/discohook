import { APIWebhook, ButtonStyle } from "discord-api-types/v10";
import { useCallback, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { QueryData } from "~/types/QueryData";
import { useSafeFetcher } from "~/util/loader";
import { cycleCopyText } from "~/util/text";
import { action as ApiPostShare } from "../api/v1/share";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

export const MessageShareModal = (
  props: ModalProps & {
    targets: Record<string, APIWebhook>;
    data: QueryData;
  },
) => {
  const { t } = useTranslation();
  const { targets, data } = props;
  const [error, setError] = useError(t);

  const [includeTargets, setIncludeTargets] = useState(false);

  const shareFetcher = useSafeFetcher<typeof ApiPostShare>({
    onError: setError,
  });

  const generateShareData = useCallback(
    (options?: { includeTargets_?: boolean }) => {
      const { includeTargets_ } = options ?? {};

      const submitData =
        includeTargets_ ?? includeTargets
          ? {
              ...data,
              targets: Object.values(targets).map((t) => ({
                url: `https://discord.com/api/webhooks/${t.id}/${t.token}`,
              })),
            }
          : // On the original site (.org), targets would be stripped upon
            // loading the page and thus would never be available in the
            // QueryData, making this spread unnecessary. I think we might
            // consider doing that again.
            { ...data, targets: [] };

      shareFetcher.submit(
        { data: submitData },
        { method: "POST", action: apiUrl(BRoutes.share()) },
      );
    },
    [includeTargets, data, targets, shareFetcher.submit],
  );

  return (
    <Modal {...props}>
      <PlainModalHeader>{t("shareMessage")}</PlainModalHeader>
      {error}
      <div className="flex">
        <div className="grow">
          <TextInput
            label={
              <Trans
                t={t}
                i18nKey={
                  shareFetcher.data
                    ? "temporaryShareUrlExpires"
                    : "temporaryShareUrl"
                }
                components={[
                  <span
                    className="text-blurple dark:text-blurple-300"
                    title={
                      shareFetcher.data
                        ? t("timestamp.full", {
                            replace: {
                              date: new Date(shareFetcher.data.expires),
                            },
                          })
                        : ""
                    }
                  />,
                ]}
                count={
                  shareFetcher.data
                    ? Math.floor(
                        (new Date(shareFetcher.data.expires).getTime() -
                          new Date().getTime()) /
                          86_400_000,
                      )
                    : undefined
                }
              />
            }
            className="w-full"
            value={shareFetcher.data ? shareFetcher.data.url : ""}
            placeholder={t("clickGenerate")}
            readOnly
          />
        </div>
        <Button
          disabled={shareFetcher.state !== "idle" || !shareFetcher.data}
          onClick={(e) => {
            if (shareFetcher.data) {
              cycleCopyText(shareFetcher.data.url, t, e.currentTarget);
            }
          }}
          className="mt-auto ltr:ml-2 rtl:mr-2"
        >
          {t("copy")}
        </Button>
      </div>
      <p className="text-sm font-medium mt-1">{t("options")}</p>
      <Checkbox
        label={t("includeWebhookUrls")}
        checked={includeTargets}
        disabled={Object.keys(targets).length === 0}
        onChange={(e) => {
          setIncludeTargets(e.currentTarget.checked);
          if (shareFetcher.data) {
            generateShareData({ includeTargets_: e.currentTarget.checked });
          }
        }}
      />
      <ModalFooter className="flex">
        <Button
          disabled={shareFetcher.state !== "idle"}
          onClick={() => generateShareData()}
          className="ltr:ml-auto"
        >
          {t(shareFetcher.data ? "regenerate" : "generate")}
        </Button>
        <Button
          disabled={shareFetcher.state !== "idle" || !shareFetcher.data}
          onClick={shareFetcher.reset}
          className="ltr:ml-2 rtl:mr-2"
          discordstyle={ButtonStyle.Secondary}
        >
          {t("clear")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
