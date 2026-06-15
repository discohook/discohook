import { ButtonStyle } from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import type { DraftFile, SetDraftFile } from "~/modals/UploadFileModal";
import type { TFunction } from "~/types/i18next";
import type { QueryData } from "~/types/QueryData";
import {
  ATTACHMENT_URI_EXTENSIONS,
  attachmentFromFile,
  fileInputChangeHandler,
  MAX_FILES_PER_MESSAGE,
  transformFileName,
} from "~/util/files";
import { randomString } from "~/util/text";
import { Button } from "./Button";
import { ButtonSelect } from "./ButtonSelect";
import { DetectGifUrlFooter } from "./editor/EmbedEditor";
import { PasteFileButton } from "./editor/PasteFileButton";
import { CoolIcon } from "./icons/CoolIcon";
import { resolveAttachmentUri } from "./preview/Embed";
import { TextInput } from "./TextInput";

export const FileOrUrlInput: React.FC<{
  t: TFunction;
  key_?: string;
  value: string | undefined;
  /** Empty string when the user deletes the URL or the file is cleared */
  onChange: (url: string) => void;
  message: QueryData["messages"][number];
  refreshData: () => void;
  files: DraftFile[];
  setFiles: SetDraftFile;
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
  message,
  refreshData,
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
  const attachments = message.data.attachments ?? [];

  const id = randomString(10);
  const attachment = value?.startsWith("attachment://")
    ? resolveAttachmentUri(
        value,
        attachments,
        allowedExtensions === "*" ? true : allowedExtensions,
      )
    : undefined;
  const selectableAttachments = attachments.filter((a) =>
    allowedExtensions === "*"
      ? true
      : !!allowedExtensions.find((e) => a.filename.toLowerCase().endsWith(e)),
  );

  return attachment ? (
    <div>
      <p className="font-medium text-sm cursor-default">
        <span>{t(labelKey ?? "attachment")}</span>
        {attachment.content_type?.startsWith("image/") ? (
          <CoolIcon icon="Image_01" className="ms-1" />
        ) : attachment.content_type?.startsWith("video/") ? (
          <CoolIcon icon="Monitor_Play" className="ms-1" />
        ) : null}
      </p>
      <div className="flex w-full items-center">
        <div
          className={twJoin(
            "rounded-lg truncate flex w-full h-9 px-[14px]",
            "border border-border-normal dark:border-border-normal-dark",
            "bg-white dark:bg-[#333338]",
            className,
          )}
        >
          <p className="my-auto truncate">{attachment.filename}</p>
        </div>
        <button
          type="button"
          className={twJoin(
            "ms-1 rounded-lg h-9 pb-0 pt-0.5 px-2 bg-gray-200 dark:bg-[#333338] shrink-0",
            "border border-border-normal dark:border-border-normal-dark",
            "hover:text-blurple-400 active:hover:border-blurple-400 transition",
          )}
          onClick={() => {
            // Automatically upload or prompt to upload based on user prefs
          }}
        >
          <CoolIcon icon="Cloud_Upload" />
        </button>
        {fileClearable !== false ? (
          <button
            type="button"
            className={twJoin(
              "ms-1 rounded-lg h-9 pb-0 pt-0.5 px-2 bg-gray-200 dark:bg-[#333338] shrink-0",
              "border border-border-normal dark:border-border-normal-dark",
              "hover:text-red-400 active:hover:border-red-400 transition",
            )}
            onClick={() => {
              // If we have calculated the placement count as 0 or 1 (this is
              // the last placement), we should be safe to remove it entirely
              // from the message
              if (
                attachment.placement_count !== undefined &&
                attachment.placement_count <= 1
              ) {
                message.data.attachments = attachments.filter(
                  (a) => a !== attachment,
                );
              }

              // calls setData upstream
              onChange("");
            }}
          >
            <CoolIcon icon="Trash_Full" />
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
          placeholder="https://..."
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
        <p className="text-sm font-medium cursor-default">{t("upload")}</p>
        <div className="flex flex-row-reverse grid-cols-2 gap-1">
          <PasteFileButton
            t={t}
            disabled={attachments.length >= MAX_FILES_PER_MESSAGE}
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
              if (attachments.length >= MAX_FILES_PER_MESSAGE) return;

              const file = list[0];
              const newFile: DraftFile = {
                id: randomString(15, true),
                file,
                url: URL.createObjectURL(file),
              };
              setFiles([...files, newFile]);

              attachments.push(attachmentFromFile(newFile));
              message.data.attachments = attachments;

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
                attachments,
                (newAttachments) => {
                  message.data.attachments = newAttachments;
                  refreshData();
                },
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
          <div className="flex gap-0">
            <Button
              className={twJoin(
                "h-9 min-w-0 px-4 grow max-w-full transition-all",
                selectableAttachments.length !== 0
                  ? "rounded-e-none border-e-0"
                  : undefined,
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
              <CoolIcon
                icon="File_Upload"
                className={value ? "" : "lg:hidden"}
              />
              {value ? null : (
                <span className="hidden lg:block">{t("addFile")}</span>
              )}
            </Button>
            <ButtonSelect
              className={twJoin(
                "h-9 w-7 min-w-0 px-0 rounded-s-none",
                selectableAttachments.length === 0 ? "hidden" : "undefined",
              )}
              iconClassName="ms-0"
              options={selectableAttachments.map((attachment) => ({
                value: attachment,
                label: attachment.filename,
              }))}
              onValueChange={(attachment) => {
                onChange(
                  `attachment://${transformFileName(attachment.filename)}`,
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
