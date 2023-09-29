import LocalizedStrings from "react-localization";
import { CoolIcon } from "~/components/CoolIcon";
import { getSnowflakeDate } from "~/util/discord";
import { SubmitMessageResult } from "./MessageSendModal";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "Submit Result",
    success: "Success",
    error: "Error",
    fullError: "Full Error:",
    messageDetails: "Message Details",
    messageId: "Message ID:",
    channelId: "Channel ID:",
    createdAt: "Created at:",
    successTroubleshoot:
      "If you cannot see the message, make sure it wasn't deleted by another bot. Some moderation bots consider all webhook messages to be spam by default.",
  },
});

export const MessageSendResultModal = (
  props: ModalProps & { result?: SubmitMessageResult }
) => {
  const { result } = props;
  const success = result?.status === "success";

  return (
    <Modal title={strings.title} {...props}>
      {result && (
        <div>
          <p className="text-xl font-medium flex">
            <CoolIcon
              icon={success ? "Check" : "Close_MD"}
              className={`mr-1 text-2xl ${
                success ? "text-green-600" : "text-rose-600"
              }`}
            />
            <span className="my-auto">{strings[result.status]}</span>
          </p>
          {success && <p>{strings.successTroubleshoot}</p>}
          <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          {success ? (
            <div>
              <details className="p-2 bg-gray-200 dark:bg-gray-700 rounded">
                <summary className="font-medium">
                  {strings.messageDetails}
                </summary>
                <p>
                  {strings.messageId} {result.data.id}
                  <br />
                  {strings.channelId} {result.data.channel_id}
                  <br />
                  {strings.createdAt}{" "}
                  {getSnowflakeDate(result.data.id).toLocaleString()}
                </p>
              </details>
            </div>
          ) : (
            <div>
              <p>{strings.fullError}</p>
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
