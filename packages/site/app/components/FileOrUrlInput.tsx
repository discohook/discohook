import { ButtonStyle } from "discord-api-types/v10";
import { TFunction } from "i18next";
import { twJoin } from "tailwind-merge";
import { DraftFile } from "~/routes/_index";
import {
  ATTACHMENT_URI_EXTENSIONS,
  MAX_FILES_PER_MESSAGE,
  fileInputChangeHandler,
  transformFileName,
} from "~/util/files";
import { randomString } from "~/util/text";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { DetectGifUrlFooter } from "./editor/EmbedEditor";
import { PasteFileButton } from "./editor/PasteFileButton";
import { CoolIcon } from "./icons/CoolIcon";

export const FileOrUrlInput: React.FC<{
  t: TFunction;
  key_?: string;
  value: string | undefined;
  /** Empty string when the user deletes the URL or the file is cleared */
  onChange: (url: string) => void;
  files: DraftFile[];
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
  /** Defaults to true */
  fileClearable?: boolean;
  className?: string;
  labelKey?: string;
  required?: boolean;
  cdn?: string;
  gifPrompt?: boolean;
  allowedExtensions?: readonly string[] | "*";
}> = ({
  t,
  key_: key,
  value,
  onChange,
  files,
  setFiles,
  fileClearable,
  className,
  labelKey,
  required,
  cdn,
  gifPrompt,
  allowedExtensions = ATTACHMENT_URI_EXTENSIONS,
}) => {
  const id = randomString(10);
  const file = value?.startsWith("attachment://")
    ? files.find((f) => transformFileName(f.file.name) === new URL(value).host)
    : undefined;

  return file ? (
    <div>
      <p className="font-medium text-sm cursor-default">
        <span>{t(labelKey ?? "attachment")}</span>
        {file.file.type.startsWith("image/") ? (
          <CoolIcon icon="Image_01" />
        ) : file.file.type.startsWith("video/") ? (
          <CoolIcon icon="Monitor_Play" />
        ) : null}
      </p>
      <div className="flex gap-2 w-full">
        <div
          className={twJoin(
            "my-auto rounded-lg truncate",
            "border h-9 px-[14px] bg-white border-border-normal dark:border-border-normal-dark dark:bg-[#333338] flex w-full",
            className,
          )}
        >
          <p className="my-auto truncate">{file.file.name}</p>
        </div>
        {fileClearable !== false ? (
          // TODO: we should determine whether the file is used elsewhere
          // and remove it from the state if not
          <button
            type="button"
            className={twJoin(
              "my-auto rounded-lg flex shrink-0",
              "border h-9 aspect-square bg-white border-border-normal dark:border-border-normal-dark dark:bg-[#333338]",
            )}
            onClick={() => onChange("")}
          >
            <CoolIcon icon="Close_MD" className="m-auto" />
          </button>
        ) : null}
      </div>
    </div>
  ) : (
    <div className="flex gap-2 w-full">
      <div
        className={twJoin(
          "w-full transition-[max-width]",
          value ? "max-w-full" : "max-w-[50%]",
        )}
      >
        <TextInput
          key={key}
          label={t(labelKey ?? "url")}
          required={required}
          type="url"
          className="w-full"
          value={value ?? ""}
          onChange={({ currentTarget }) => onChange(currentTarget.value)}
        />
        {gifPrompt ? (
          <DetectGifUrlFooter
            t={t}
            value={value}
            onChange={onChange}
            cdn={cdn}
          />
        ) : null}
      </div>
      <div
        className={twJoin(
          "transition-all min-w-[6.75rem]",
          value ? "max-w-[6.75rem]" : "max-w-[50%] w-full",
        )}
      >
        <p className="text-sm font-medium cursor-default">{t("file")}</p>
        <div className="flex flex-row-reverse grid-cols-2 gap-1">
          <PasteFileButton
            t={t}
            disabled={files.length >= MAX_FILES_PER_MESSAGE}
            className="peer h-9 min-w-0 grow max-w-full px-4"
            getChildren={(state) => {
              // normal size
              if (state === "active_mac") return t("pasteCmd");
              if (state === "active") return t("pasteCtrl");
              // conditionally small
              return value ? (
                <CoolIcon icon="Archive" />
              ) : (
                <>
                  <CoolIcon icon="Archive" className="lg:hidden" />
                  <span className="hidden lg:block">{t("pasteFile")}</span>
                </>
              );
            }}
            onChange={async (list) => {
              if (files.length >= MAX_FILES_PER_MESSAGE) return;

              const file = list[0];
              // if (
              //   allowedExtensions !== "*" &&
              //   allowedExtensions.find((e) =>
              //     file.name.toLowerCase().endsWith(e),
              //   ) !== undefined
              // ) {
              //   // the file cannot be used with attachment://
              //   // TODO: visible feedback
              //   return;
              // }

              const newFiles = [...files];
              newFiles.push({
                id: randomString(10),
                file,
                url: URL.createObjectURL(file),
              });
              setFiles(newFiles);
              onChange(`attachment://${transformFileName(file.name)}`);
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
                allowedExtensions !== "*" ? allowedExtensions : undefined,
              );
              const draftFiles = await handler(e);
              if (!draftFiles) return;

              onChange(
                `attachment://${transformFileName(draftFiles[0].file.name)}`,
              );
            }}
            accept={
              allowedExtensions !== "*"
                ? allowedExtensions.join(",")
                : undefined
            }
          />
          <Button
            className={twJoin(
              "h-9 min-w-0 px-4 grow max-w-full transition-all",
            )}
            title={t("addFile")}
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
            <CoolIcon icon="File_Upload" className={value ? "" : "lg:hidden"} />
            {value ? null : (
              <span className="hidden lg:block">{t("addFile")}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
