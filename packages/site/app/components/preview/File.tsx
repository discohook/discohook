import { APIFileComponent } from "discord-api-types/v10";
import { DraftFile } from "~/routes/_index";
import { transformFileName } from "~/util/files";
import { FileAttachment } from "./FileAttachment";

export const PreviewFile: React.FC<{
  component: APIFileComponent;
  files?: DraftFile[];
}> = ({ component, files }) => {
  const file = files?.find(
    (f) =>
      component.file.url === `attachment://${transformFileName(f.file.name)}`,
  );
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
