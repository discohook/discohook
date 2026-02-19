import { Collapsible } from "@base-ui-components/react/collapsible";
import { DiscordErrorData } from "@discordjs/rest";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { collapsibleStyles } from "~/components/collapsible";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { getSnowflakeDate } from "~/util/discord";
import type { SubmitMessageResult } from "./MessageSendModal";
import { Modal, type ModalProps } from "./Modal";

const ordinal = (num: number) => {
  // 1, 2, 3 and 21, 22, 23, but not 11, 12, 13
  if (/([^1]|^)1$/.test(String(num))) {
    return `${num}st`;
  } else if (/([^1]|^)2$/.test(String(num))) {
    return `${num}nd`;
  } else if (/([^1]|^)3$/.test(String(num))) {
    return `${num}rd`;
  }
  return `${num}th`;
};

const DisplayErrorBody = ({
  errors,
}: {
  errors: Required<DiscordErrorData>["errors"];
}) => {
  if (typeof errors === "string") {
    return <p>{errors}</p>;
  }
  if (
    "code" in errors &&
    typeof errors.code === "string" &&
    typeof errors.message === "string"
  ) {
    return (
      <p className="inline">
        {/* <CoolIcon icon="Octagon_Warning" className="text-rose-400" />{" "} */}
        {errors.message}{" "}
        <span className="text-muted dark:text-muted-dark">({errors.code})</span>
      </p>
    );
  }
  if ("_errors" in errors && Array.isArray(errors._errors)) {
    return (
      <ul
        className={twJoin(
          "-mt-1",
          errors._errors.length === 1 ? undefined : "list-disc list-inside",
        )}
      >
        {errors._errors.map((e, i) => (
          <li key={i}>
            <DisplayErrorBody errors={e} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="list-disc list-inside space-y-1">
      {Object.entries(errors).map(([key, val]) => (
        <li key={key}>
          <span className="font-medium">
            {Number.isNaN(Number(key))
              ? key
              : `${ordinal(Number(key) + 1)} item`}
            :
          </span>
          <div className="ms-4">
            <DisplayErrorBody errors={val} />
          </div>
        </li>
      ))}
    </ul>
  );
};

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
              {result.data.errors ? (
                <div>
                  <DisplayErrorBody errors={result.data.errors} />
                  <Collapsible.Root
                    className={twJoin(collapsibleStyles.root, "mt-2")}
                  >
                    <Collapsible.Trigger
                      className={twJoin(
                        collapsibleStyles.trigger,
                        "group/trigger",
                      )}
                    >
                      <CoolIcon
                        icon="Chevron_Right"
                        rtl="Chevron_Left"
                        className="text-lg ltr:group-data-[panel-open]/trigger:rotate-90 rtl:group-data-[panel-open]/trigger:-rotate-90 transition-transform"
                      />{" "}
                      <p className="font-medium">Show original error</p>
                    </Collapsible.Trigger>
                    <Collapsible.Panel className={collapsibleStyles.panel}>
                      <pre
                        className="overflow-x-auto whitespace-pre-wrap font-code text-sm mt-1"
                        dir="ltr"
                      >
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </Collapsible.Panel>
                  </Collapsible.Root>
                </div>
              ) : (
                <pre
                  className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-200 dark:bg-gray-800 p-2 font-code text-sm mt-2"
                  dir="ltr"
                >
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
