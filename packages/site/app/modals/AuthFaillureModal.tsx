import { Button } from "~/components/Button";
import { codeBlockStyle } from "~/components/preview/Markdown";
import { Modal, ModalProps } from "./Modal";

export const AuthFailureModal = (props: ModalProps & { message?: string }) => {
  return (
    <Modal title="Failure" {...props}>
      <p>
        You have not been logged in. One of the required scopes may be missing
        or you may have simply cancelled.
      </p>
      {!!props.message && (
        <div className="mt-1">
          <pre className={codeBlockStyle}>{props.message}</pre>
        </div>
      )}
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          OK
        </Button>
      </div>
    </Modal>
  );
};
