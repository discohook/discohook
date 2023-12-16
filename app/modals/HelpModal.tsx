import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { Button } from "~/components/Button";
import { PreviewButton } from "~/components/preview/Components";
import { Modal, ModalProps } from "./Modal";

export const HelpModal = (props: ModalProps) => {
  return (
    <Modal title="Help" {...props}>
      <p>Searchable box of all the help tags</p>
      <div className="flex w-full mt-4">
        <div className="flex gap-2 mx-auto">
          <Button onClick={() => props.setOpen(false)}>OK</Button>
          <PreviewButton
            data={{
              type: ComponentType.Button,
              style: ButtonStyle.Link,
              url: "/discord",
              label: "Support Server",
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
