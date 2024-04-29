import { APIEmbed, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { useState } from "react";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import { PreviewButton } from "~/components/preview/Components";
import { Embed } from "~/components/preview/Embed";
import tags_ from "../../public/help/en.json";
import { Modal, ModalProps } from "./Modal";

export const HelpModal = (props: ModalProps) => {
  const [query, setQuery] = useState("");
  const tags: Record<string, string | APIEmbed> = tags_;

  return (
    <Modal title="Help" {...props}>
      <TextInput
        label="Search"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        className="w-full mb-2"
        placeholder="How do I ..."
      />
      <div className="overflow-y-auto max-h-96 flex flex-col">
        <div className="mx-auto space-y-4">
          {Object.entries(tags)
            .filter(
              ([key, value]) =>
                key === query ||
                (typeof value !== "string" &&
                  value.title?.toLowerCase()?.includes(query.toLowerCase())),
            )
            .map(([key, value]) => {
              if (typeof value === "string" && key !== query) return <></>;
              const data =
                typeof value === "string" ? (tags[value] as APIEmbed) : value;
              data.color = data.color ?? 0x58b9ff;

              return <Embed embed={data} />;
            })}
        </div>
      </div>
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
