import { Collapsible } from "@base-ui-components/react/collapsible";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { collapsibleStyles } from "~/components/collapsible";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { getSnowflakeDate } from "~/util/discord";
import type { SubmitMessageResult } from "./MessageSendModal";
import { Modal, type ModalProps } from "./Modal";

export const MessageSendResultModal = (
  props: ModalProps & { result?: SubmitMessageResult },
) => {
  const { t } = useTranslation();
  const { result } = props;
  const success = result?.status === "success";

  return (
    <Modal {...props}>
      {result && (
        <div>
          <div className="text-xl font-medium flex items-center">
            <CoolIcon
              icon={success ? "Check" : "Close_MD"}
              className={`me-1 text-2xl ${
                success ? "text-green-600" : "text-rose-400"
              }`}
            />
            <p>{t(result.status)}</p>
          </div>
          {success && <p>{t("successResultTroubleshoot")}</p>}
          {success ? (
            <Collapsible.Root
              className={twJoin(collapsibleStyles.root, "mt-2")}
            >
              <Collapsible.Trigger className={collapsibleStyles.trigger}>
                <CoolIcon
                  icon="Chevron_Right"
                  className="block group-data-[panel-open]/trigger:rotate-90 transition text-lg"
                />
                <span className="text-base font-medium">
                  {t("messageDetails")}
                </span>
              </Collapsible.Trigger>
              <Collapsible.Panel className={collapsibleStyles.panel}>
                <p>
                  <Trans
                    t={t}
                    i18nKey="messageId"
                    components={[<span key="0">{result.data.id}</span>]}
                  />
                  <br />
                  <Trans
                    t={t}
                    i18nKey="channelId"
                    components={[<span key="0">{result.data.channel_id}</span>]}
                  />
                  <br />
                  {t("createdAtTime", {
                    replace: {
                      createdAt: getSnowflakeDate(result.data.id),
                    },
                  })}
                </p>
              </Collapsible.Panel>
            </Collapsible.Root>
          ) : (
            <div className="mt-2">
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-200 dark:bg-gray-800 p-2 font-code text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
