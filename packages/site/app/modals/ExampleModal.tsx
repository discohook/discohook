import { Button } from "~/components/Button";
import { Message } from "~/components/preview/Message.client";
import { useLocalStorage } from "~/util/localstorage";
import { Modal, type ModalProps } from "./Modal";

export const ExampleModal = (props: ModalProps) => {
  const [settings] = useLocalStorage();

  return (
    <Modal title="Embed Example" {...props}>
      <p>
        Discord messages come in all shapes and sizes. Here's an example message
        that showcases every text field.
      </p>
      <div className="mt-4">
        <Message
          messageDisplay={settings.messageDisplay}
          compactAvatars={settings.compactAvatars}
          message={{
            author: { name: "Profile name" },
            content: "Content",
            embeds: [
              {
                author: {
                  name: "Author",
                },
                title: "Title",
                description: "Description\n\n<-- Sidebar color",
                color: 0xeb459f,
                fields: [
                  {
                    name: "Field 1 (inline)",
                    value: "Field 1 value",
                    inline: true,
                  },
                  {
                    name: "Field 2 (inline)",
                    value: "Field 2 value",
                    inline: true,
                  },
                  {
                    name: "Field 3 (inline)",
                    value: "Field 3 value",
                    inline: true,
                  },
                  {
                    name: "Field 4 (not inline)",
                    value: "Field 4 value",
                    inline: false,
                  },
                  {
                    name: "Field 5 (not inline)",
                    value: "Field 5 value",
                    inline: false,
                  },
                ],
                footer: {
                  text: "Footer",
                },
              },
            ],
          }}
        />
      </div>
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          OK
        </Button>
      </div>
    </Modal>
  );
};
