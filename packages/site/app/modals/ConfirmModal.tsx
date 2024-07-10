import { useState } from "react";
import { Modal, ModalProps } from "./Modal";

export interface ConfirmModalProps {
  title: string;
  children: React.ReactNode;
}

export const ConfirmModal = (
  props: ModalProps & Partial<ConfirmModalProps>,
) => {
  const { title, children, ...rest } = props;
  // const { t } = useTranslation();
  return (
    <Modal title={title} {...rest}>
      {children}
    </Modal>
  );
};

export const useConfirmModal = () => {
  const [props, setProps] = useState<ConfirmModalProps>();
  return [
    <ConfirmModal
      open={!!props}
      setOpen={() => setProps(undefined)}
      {...props}
    />,
    setProps,
  ] as const;
};
