import { Button } from "~/components/Button";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

export interface SimpleTextModalProps {
  title: string;
  children: React.ReactNode;
}

export const SimpleTextModal = (
  props: ModalProps & Partial<SimpleTextModalProps>,
) => {
  const { title, ...restProps } = props;
  return (
    <Modal {...restProps}>
      {title ? <PlainModalHeader>{title}</PlainModalHeader> : null}
      {props.children}
      <ModalFooter className="flex">
        <Button
          onClick={() => props.setOpen(false)}
          className="ltr:ml-auto rtl:mr-auto"
        >
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
};
