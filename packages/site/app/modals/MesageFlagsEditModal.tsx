import { MessageFlags } from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { BigCheckbox } from "~/components/Checkbox";
import { QueryData } from "~/types/QueryData";
import { Modal, ModalProps } from "./Modal";

export const MessageFlagsEditModal = (
  props: ModalProps & {
    data: QueryData;
    setData: React.Dispatch<QueryData>;
    messageIndex?: number;
  },
) => {
  const { t } = useTranslation();
  const { data, setData, messageIndex } = props;
  const message =
    messageIndex !== undefined ? data.messages[messageIndex] : undefined;

  return (
    <Modal title={t("flags")} {...props}>
      <div className="space-y-2">
        <p>{t("messageFlagsNote")}</p>
        {message &&
          (() => {
            const flags = new MessageFlagsBitField(message.data.flags ?? 0);
            return (
              <>
                <BigCheckbox
                  label={t("messageFlag.4096")}
                  description={t("messageFlagsNoteSuppressNotifications")}
                  checked={flags.has(MessageFlags.SuppressNotifications)}
                  onChange={(e) => {
                    flags.set(
                      MessageFlags.SuppressNotifications,
                      e.currentTarget.checked,
                    );
                    message.data.flags = Number(flags.value);
                    setData({ ...data });
                  }}
                />
                <BigCheckbox
                  label={t("messageFlag.4")}
                  description={t("messageFlagsNoteSuppressEmbeds")}
                  checked={flags.has(MessageFlags.SuppressEmbeds)}
                  onChange={(e) => {
                    flags.set(
                      MessageFlags.SuppressEmbeds,
                      e.currentTarget.checked,
                    );
                    message.data.flags = Number(flags.value);
                    setData({ ...data });
                  }}
                />
              </>
            );
          })()}
        <div className="flex w-full">
          <Button className="mx-auto" onClick={() => props.setOpen(false)}>
            {t("ok")}
          </Button>
        </div>{" "}
      </div>
    </Modal>
  );
};
