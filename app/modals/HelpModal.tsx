import { Button } from "~/components/Button";
import { Modal, ModalProps } from "./Modal";

export const HelpModal = (props: ModalProps) => {
  return (
    <Modal title="Help" {...props}>
      <p></p>
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          OK
        </Button>
      </div>
    </Modal>
  );
};
