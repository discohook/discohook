import {
  APIContainerComponent,
  APIFileComponent,
  ButtonStyle,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import {
  MAX_FILES_PER_MESSAGE,
  fileInputChangeHandler,
  transformFileName,
} from "~/util/files";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { TextInput } from "../TextInput";
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
  const mid = getQdMessageId(message);

  const file = files.find(
    (f) =>
      `attachment://${transformFileName(f.file.name)}` === component.file.url,
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
                const newFiles = file
                  ? // Remove the previous file from the payload
                    files.filter((f) => f.id !== file.id)
                  : [...files];
                newFiles.push({
                  id: randomString(10),
                  file: draftFile,
                  url: URL.createObjectURL(draftFile),
                });
                setFiles(newFiles);

                component.file.url = `attachment://${transformFileName(
                  draftFile.name,
                )}`;
                setData({ ...data });
              }}
            />
            <input
              id={`files-${id}`}
              type="file"
              hidden
              onChange={async (e) => {
                const handler = fileInputChangeHandler(files, setFiles);
                const draftFiles = await handler(e);
                if (!draftFiles) return;
                if (file) {
                  // Remove the previous file from the payload
                  setFiles(files.filter((f) => f.id !== file.id));
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
              {t(file ? "replaceFile" : "addFile")}
            </Button>
          </div>
        </div>
        {file ? (
          <>
            <TextInput
              label={t("description")}
              className="w-full"
              value={file.description ?? ""}
              maxLength={256}
              onChange={({ currentTarget }) => {
                file.description = currentTarget.value || undefined;
                setFiles([...files]);
              }}
            />
            <Checkbox
              label={t("markSpoiler")}
              checked={component.spoiler ?? false}
              onChange={({ currentTarget }) => {
                component.spoiler = currentTarget.checked;
                setData({ ...data });
              }}
            />
          </>
        ) : null}
      </div>
    </TopLevelComponentEditorContainer>
  );
};
