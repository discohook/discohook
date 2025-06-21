import { useTranslation } from "react-i18next";
import type { InvalidShareIdData } from "~/api/v1/share.$shareId";
import { Modal, type ModalProps } from "./Modal";

export const ShareExpiredModal = (
  props: ModalProps & { data?: InvalidShareIdData },
) => {
  const { t } = useTranslation();
  const { data } = props;

  return (
    <Modal title={t("shareExpired")} {...props}>
      {data && (
        <div>
          <p>{data.message}</p>
          {data.expiredAt && (
            <p>Expired at: {new Date(data.expiredAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </Modal>
  );
};
