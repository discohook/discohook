import { Button } from "~/components/Button";
import { Modal, ModalProps } from "./Modal";

export const PreviewDisclaimerModal = (props: ModalProps) => {
  return (
    <Modal title="Preview Disclaimer" {...props}>
      <p>
        The Discohook preview is only an estimation of what your message will
        look like when sent to Discord. The only 100% accurate view is when you
        actually send your message into Discord (and even then, Discord is often
        inconsistent).
      </p>
      <p className="mt-2">
        Components don't do anything in the preview! You will have to send your
        message to test buttons and select menus.
      </p>
      <p className="mt-2">
        If something doesn't seem right, just send the message in a private
        channel to make sure everything is working as expected. New Discord
        style updates will usually be reflected within a few days or weeks.
      </p>
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          OK
        </Button>
      </div>
    </Modal>
  );
};
