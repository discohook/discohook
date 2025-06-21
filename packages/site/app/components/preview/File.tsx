import type { APIFileComponent } from "discord-api-types/v10";
import type { DraftFile } from "~/routes/_index";
import { resolveAttachmentUri } from "./Embed";
import { FileAttachment } from "./FileAttachment";

export const PreviewFile: React.FC<{
  component: APIFileComponent;
  files?: DraftFile[];
}> = ({ component, files }) => {
  const file = resolveAttachmentUri(component.file.url, files);
  return (
    <div className="">
      <FileAttachment
        attachment={{
          id: "0",
          url: file?.url ?? "#",
          proxy_url: "#",
          filename: file?.file.name ?? "unknown",
          size: file?.file.size ?? 0,
        }}
      />
    </div>
  );
};
