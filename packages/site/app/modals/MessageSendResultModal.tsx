import { Trans, useTranslation } from "react-i18next";
import { CoolIcon } from "~/components/CoolIcon";
import { getSnowflakeDate } from "~/util/discord";
import { SubmitMessageResult } from "./MessageSendModal";
import { Modal, ModalProps } from "./Modal";

export const MessageSendResultModal = (
  props: ModalProps & { result?: SubmitMessageResult },
) => {
  const { t } = useTranslation();
  const { result } = props;
  const success = result?.status === "success";

  return (
    <Modal title={t("submitResultTitle")} {...props}>
      {result && (
        <div>
          <p className="text-xl font-medium flex">
            <CoolIcon
              icon={success ? "Check" : "Close_MD"}
              className={`mr-1 text-2xl ${
                success ? "text-green-600" : "text-rose-600"
              }`}
            />
            <span className="my-auto">{t(result.status)}</span>
          </p>
          {success && <p>{t("successResultTroubleshoot")}</p>}
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          {success ? (
            <div>
              <details className="p-2 bg-gray-200 dark:bg-gray-700 rounded">
                <summary className="font-medium">{t("messageDetails")}</summary>
                <p>
                  <Trans
                    t={t}
                    i18nKey="messageId"
                    components={[<span>{result.data.id}</span>]}
                  />
                  <br />
                  <Trans
                    t={t}
                    i18nKey="channelId"
                    components={[<span>{result.data.channel_id}</span>]}
                  />
                  <br />
                  <Trans
                    t={t}
                    i18nKey={"createdAt"}
                    value={{
                      createdAt: getSnowflakeDate(
                        result.data.id,
                      ).toLocaleString(),
                    }}
                  />
                </p>
              </details>
            </div>
          ) : (
            <div>
              <p>{t("fullError")}</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-gray-200 dark:bg-gray-700 p-2">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
