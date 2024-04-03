import { Button } from "~/components/Button";
import { User } from "~/session.server";
import { getUserAvatar, getUserTag } from "~/util/users";
import { Modal, ModalProps } from "./Modal";

export const AuthSuccessModal = (props: ModalProps & { user: User | null }) => {
  return (
    <Modal title="Success" {...props}>
      {props.user && (
        <p>
          You are now logged in as{" "}
          <img
            className="rounded-full inline-block h-5 ml-1 mr-0.5"
            src={getUserAvatar(props.user, { size: 32 })}
            alt={props.user.name}
          />{" "}
          <span className="font-medium">{getUserTag(props.user)}</span>.
        </p>
      )}
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          Yay!
        </Button>
      </div>
    </Modal>
  );
};
