import { Button } from "~/components/Button";
import { Modal, ModalProps } from "./Modal";

export interface SimpleTextModalProps {
  title: string;
  children: React.ReactNode;
}

export const SimpleTextModal = (
  props: ModalProps & Partial<SimpleTextModalProps>,
) => {
  return (
    <Modal {...props}>
      {props.children}
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          OK
        </Button>
      </div>
    </Modal>
  );
};
