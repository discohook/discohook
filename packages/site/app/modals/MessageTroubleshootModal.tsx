import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { Modal, ModalProps } from "./Modal";

export const MessageTroubleshootModal = (props: ModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal title={t("havingTrouble")} {...props}>
      <p>{t("troubleshootMessage")}</p>
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          OK
        </Button>
      </div>
    </Modal>
  );
};
