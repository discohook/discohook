import { ButtonStyle } from "discord-api-types/v10";
import { TFunction } from "i18next";
import { twJoin } from "tailwind-merge";
import { DraftFile } from "~/routes/_index";
import {
  ATTACHMENT_URI_EXTENSIONS,
  MAX_FILES_PER_MESSAGE,
  transformFileName,
} from "~/util/files";
import { randomString } from "~/util/text";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { PasteFileButton } from "./editor/PasteFileButton";
import { CoolIcon } from "./icons/CoolIcon";

export const FileOrUrlInput: React.FC<{
  t: TFunction;
  key?: string;
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
}> = ({
  t,
  key,
  value,
  onChange,
  files,
  setFiles,
  fileClearable,
  className,
  labelKey,
  required,
}) => {
  const file = value?.startsWith("attachment://")
    ? files.find((f) => transformFileName(f.file.name) === new URL(value).host)
    : undefined;

  return file ? (
    <div>
      <p>{t(labelKey ?? "media")}</p>
      <div className="flex gap-2 w-full">
        <div
          className={twJoin(
            "my-auto rounded-lg",
            "border h-9 px-[14px] bg-white border-border-normal dark:border-border-normal-dark dark:bg-[#333338] flex w-full",
            className,
          )}
        >
          <p className="font-medium my-auto">{file.file.name}</p>
        </div>
        {fileClearable !== false ? (
          // TODO: we should determine whether the file is used elsewhere
          // and remove it from the state if not
          <button
            type="button"
            className={twJoin(
              "my-auto rounded-lg",
              "border h-9 w-9 bg-white border-border-normal dark:border-border-normal-dark dark:bg-[#333338]",
            )}
            onClick={() => onChange("")}
          >
            <CoolIcon icon="Close_MD" />
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
      </div>
      <div
        className={twJoin(
          "transition-all",
          value ? "max-w-[4.75rem]" : "max-w-[50%] w-full",
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
              // small
              return <CoolIcon icon="Archive" />;
            }}
            onChange={async (list) => {
              if (files.length >= MAX_FILES_PER_MESSAGE) return;

              const file = list[0];
              if (
                ATTACHMENT_URI_EXTENSIONS.filter((e) =>
                  file.name.toLowerCase().endsWith(e),
                ).length === 0
              ) {
                // the file cannot be used with attachment://
                // TODO: visible feedback
                return;
              }

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
          <Button
            className={twJoin(
              "h-9 min-w-0 px-4 grow max-w-full transition-all",
              "peer-data-[active=true]:max-w-0 peer-data-[active=true]:opacity-0 peer-data-[active=true]:pointer-events-none",
            )}
            onClick={() => {
              // const input = document.querySelector<HTMLInputElement>(
              //   `input#files-${id}`,
              // );
              // // Shouldn't happen
              // if (!input) return;
              // input.click();
            }}
            disabled={files.length >= MAX_FILES_PER_MESSAGE}
            discordstyle={ButtonStyle.Primary}
          >
            <CoolIcon icon="File_Upload" title={t("addFile")} />
          </Button>
        </div>
      </div>
    </div>
  );
};
