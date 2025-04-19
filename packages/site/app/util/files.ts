import { DraftFile } from "~/routes/_index";
import { randomString } from "./text";

export const MAX_FILES_PER_MESSAGE = 10;
// export const MAX_DEFAULT_FILE_SIZE = 10_000_000; // 10mb
// export const MAX_BOOST_LVL3_FILE_SIZE = 100_000_000; // 100mb

/**
 * Supported extensions for the `attachment` URI according to
 * https://discord.dev/reference#editing-message-attachments-using-attachments-within-embeds
 */
export const ATTACHMENT_URI_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const;

export const transformFileName = (filename: string) =>
  filename.replace(/ /g, "_");

/**
 * Returns an onChange handler that will add one or multiple files to the
 * state from an input, then return them.
 */
export const fileInputChangeHandler =
  (
    files: DraftFile[],
    setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>,
  ): React.ChangeEventHandler<HTMLInputElement> =>
  async (event) => {
    const list = event.currentTarget.files;
    if (!list) return;

    const newFiles = [...files];
    for (const file of Array.from(list).slice(
      0,
      MAX_FILES_PER_MESSAGE - newFiles.length,
    )) {
      newFiles.push({
        id: randomString(10),
        file,
        url: URL.createObjectURL(file),
      });
    }
    setFiles(newFiles);
    event.currentTarget.value = "";

    return newFiles;
  };
