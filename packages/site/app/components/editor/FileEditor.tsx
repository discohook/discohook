import {
  type APIContainerComponent,
  type APIFileComponent,
  ButtonStyle,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { DraftFile } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
import {
  attachmentFromFile,
  fileInputChangeHandler,
  MAX_FILES_PER_MESSAGE,
  transformFileName,
} from "~/util/files";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { resolveAttachmentUri } from "../preview/Embed";
import { PasteFileButton } from "./PasteFileButton";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const FileEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APIFileComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  open?: boolean;
  files: DraftFile[];
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
}> = ({
  message,
  component,
  parent,
  index: i,
  data,
  setData,
  open,
  files,
  setFiles,
}) => {
  const { t } = useTranslation();
  const attachments = message.data.attachments ?? [];
  const attachment = resolveAttachmentUri(
    component.file.url,
    attachments,
    true,
  );

  const id = randomString(10);
  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={component}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      open={open}
      files={files}
    >
      <div className="space-y-2">
        <div className="w-full">
          <div className="flex flex-row-reverse grid-cols-2 gap-1">
            <PasteFileButton
              t={t}
              disabled={files.length >= MAX_FILES_PER_MESSAGE}
              className="peer h-9 min-w-0 grow max-w-full px-4"
              onChange={async (list) => {
                if (files.length >= MAX_FILES_PER_MESSAGE) return;
                const draftFile = list[0];

                const newAttachments = attachment
                  ? attachments.filter((a) => a !== attachment)
                  : [...attachments];
                const oldFile = attachment
                  ? files.find((f) => f.id === attachment.id)
                  : undefined;
                const newFiles = oldFile
                  ? files.filter((f) => f !== oldFile)
                  : [...files];

                const newFile: DraftFile = {
                  id: randomString(15, true),
                  file: draftFile,
                  url: URL.createObjectURL(draftFile),
                };
                newFiles.push(newFile);
                setFiles(newFiles);
                const att = attachmentFromFile(newFile);
                newAttachments.push(att);

                component.file.url = `attachment://${transformFileName(
                  att.filename,
                )}`;
                message.data.attachments = newAttachments;
                setData({ ...data });
              }}
            />
            <input
              id={`files-${id}`}
              type="file"
              hidden
              onChange={async (e) => {
                const handler = fileInputChangeHandler(
                  files,
                  setFiles,
                  attachments,
                  (newAttachments) => {
                    message.data.attachments = newAttachments;
                    setData({ ...data });
                  },
                );
                const draftFiles = await handler(e);
                if (!draftFiles) return;
                if (attachment) {
                  // Remove the previous attachment from the payload
                  message.data.attachments = attachments.filter(
                    (a) => a !== attachment,
                  );
                }

                component.file.url = `attachment://${transformFileName(
                  draftFiles[0].file.name,
                )}`;
                setData({ ...data });
              }}
            />
            <Button
              className={twJoin(
                "h-9 min-w-0 px-4 grow max-w-full transition-all",
              )}
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>(
                  `input#files-${id}`,
                );
                // Shouldn't happen
                if (!input) return;
                input.click();
              }}
              disabled={files.length >= MAX_FILES_PER_MESSAGE}
              discordstyle={ButtonStyle.Primary}
            >
              {t(attachment ? "replaceFile" : "addFile")}
            </Button>
          </div>
        </div>
        {attachment ? (
          <Checkbox
            label={t("markSpoiler")}
            checked={component.spoiler ?? false}
            onCheckedChange={(checked) => {
              component.spoiler = checked;
              setData({ ...data });
            }}
          />
        ) : null}
      </div>
    </TopLevelComponentEditorContainer>
  );
};
