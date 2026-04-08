import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { getQdMessageId } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
import { getMessageDisplayName } from "~/util/message";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

export const MessageSendModeModal = ({
  data,
  setSettingMessageIndex,
  ...props
}: ModalProps & {
  data: QueryData;
  setSettingMessageIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}) => {
  const { t } = useTranslation();

  return (
    <Modal {...props}>
      <PlainModalHeader onClose={() => props.setOpen(false)}>
        {t("switchSendMode")}
      </PlainModalHeader>
      <p className="-mt-2">{t("switchSendModeBody")}</p>
      <div className="space-y-1 mt-2">
        {data.messages.length > 0 ? (
          data.messages.map((message, i) => {
            const id = getQdMessageId(message);
            return (
              <div key={`message-send-${id}`} className="flex">
                <button
                  type="button"
                  onClick={() => {
                    setSettingMessageIndex(i);
                    props.setOpen(false);
                  }}
                  className={twJoin(
                    "rounded-lg py-2 px-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex",
                    "grow w-full cursor-pointer overflow-hidden",
                  )}
                >
                  <div className="my-auto grow text-left me-2 truncate">
                    <p className="font-semibold text-base truncate">
                      {getMessageDisplayName(t, i, message)}
                    </p>
                    {message.reference ? (
                      <p className="text-sm leading-none text-muted dark:text-muted-dark truncate">
                        {message.reference.replace(
                          /^https:\/\/discord.com\/channels\/(\d+)\/(\d+)\//,
                          "",
                        )}
                      </p>
                    ) : null}
                  </div>
                  <div className="ms-auto my-auto flex gap-x-2 text-2xl items-center">
                    {message.reference ? (
                      <CoolIcon
                        title={t("willBeEdited")}
                        icon="Edit_Pencil_01"
                        className="text-blurple dark:text-blurple-400"
                      />
                    ) : null}
                    <CoolIcon icon="Chevron_Right" rtl="Chevron_Left" />
                  </div>
                </button>
              </div>
            );
          })
        ) : (
          <p>{t("noMessages")}</p>
        )}
      </div>
    </Modal>
  );
};
