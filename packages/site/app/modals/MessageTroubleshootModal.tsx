import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

export const MessageTroubleshootModal = (props: ModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal {...props}>
      <PlainModalHeader>{t("havingTrouble")}</PlainModalHeader>
      <p>{t("troubleshootMessage")}</p>
      <ModalFooter className="flex">
        <Button
          onClick={() => props.setOpen(false)}
          className="ltr:ml-auto rtl:mr-auto"
        >
          {t("ok")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
