import { Link } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { Button } from "~/components/Button";
import { Markdown } from "~/components/preview/Markdown";
import { Modal, ModalProps } from "./Modal";

export const FailureDataModal = (props: ModalProps & { data: unknown }) => {
  return (
    <Modal title="Failure" {...props}>
      <p>You just encountered an error, here's all we know:</p>
      <div className="my-1">
        <Markdown
          content={
            props.data
              ? typeof props.data === "object" && "message" in props.data
                ? `> ${props.data.message}`
                : `\`\`\`\n${String(props.data)}\`\`\``
              : ""
          }
          features="full"
        />
      </div>
      <p>
        If you think this shouldn't have happened, visit the support server.
      </p>
      <div className="flex w-full mt-4">
        <Link to="/discord" className="block mx-auto">
          <Button discordstyle={ButtonStyle.Link}>Support Server</Button>
        </Link>
      </div>
    </Modal>
  );
};
