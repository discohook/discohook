import { Button } from "~/components/Button";
import { Modal, ModalFooter, type ModalProps } from "./Modal";

export interface SimpleTextModalProps {
  title: string;
  children: React.ReactNode;
}

export const SimpleTextModal = (
  props: ModalProps & Partial<SimpleTextModalProps>,
) => {
  const { title, ...restProps } = props;
  return (
    <Modal title={title} {...restProps} size="sm">
      {props.children}
      <ModalFooter className="flex">
        <Button onClick={() => props.setOpen(false)} className="ms-auto">
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
};
