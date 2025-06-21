import { useState } from "react";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

export interface ConfirmModalProps {
  title: string;
  children: React.ReactNode;
}

export const ConfirmModal = (
  props: ModalProps & Partial<ConfirmModalProps>,
) => {
  const { title, children, ...rest } = props;
  return (
    <Modal {...rest}>
      <PlainModalHeader>{title}</PlainModalHeader>
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
