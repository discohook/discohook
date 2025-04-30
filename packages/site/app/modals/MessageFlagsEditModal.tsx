import { MessageFlags } from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { BigCheckbox } from "~/components/Checkbox";
import { QueryData } from "~/types/QueryData";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

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
    <Modal {...props}>
      <PlainModalHeader>{t("flags")}</PlainModalHeader>
      <div className="space-y-2">
        <p>{t("messageFlagsNote")}</p>
        {message
          ? (() => {
              const flags = new MessageFlagsBitField(message.data.flags ?? 0);
              return (
                <>
                  <BigCheckbox
                    label={t(
                      `messageFlag.${MessageFlags.SuppressNotifications}`,
                    )}
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
                  {
                    // If components V2, only show this checkbox if it is
                    // already enabled, so that it can be disabled
                    !flags.has(MessageFlags.IsComponentsV2) ||
                    flags.has(MessageFlags.SuppressEmbeds) ? (
                      <BigCheckbox
                        label={t(`messageFlag.${MessageFlags.SuppressEmbeds}`)}
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
                    ) : null
                  }
                  {/* <BigCheckbox
                    label={t(`messageFlag.${MessageFlags.IsComponentsV2}`)}
                    description={t("messageFlagsNoteIsComponentsV2")}
                    checked={flags.has(MessageFlags.IsComponentsV2)}
                    onChange={(e) => {
                      flags.set(
                        MessageFlags.IsComponentsV2,
                        e.currentTarget.checked,
                      );
                      message.data.flags = Number(flags.value);
                      setData({ ...data });
                    }}
                  /> */}
                </>
              );
            })()
          : null}
        <ModalFooter className="flex gap-2 flex-wrap">
          <Button
            className="ltr:ml-auto rtl:mr-auto"
            onClick={() => props.setOpen(false)}
          >
            {t("ok")}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};
