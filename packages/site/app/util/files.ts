import { isAudioType } from "~/components/preview/FileAttachment";
import type { DraftFile } from "~/routes/_index";
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

const getAudioDuration = async (src: string): Promise<number | null> => {
  const promise = new Promise<number>((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.src = src;
  });
  // Don't take more than 30s trying to load the file
  const result = await Promise.race([
    promise,
    new Promise<null>((r) => setTimeout(() => r(null), 30000)),
  ]);
  return result;
};

/**
 * Returns an onChange handler that will add one or multiple files to the
 * state from an input, then return them.
 */
export const fileInputChangeHandler = (
  files: DraftFile[],
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>,
  accept?: readonly string[],
) =>
  (async (event) => {
    const list = event.currentTarget.files;
    if (!list) return;

    const newFiles = [...files];
    const added: DraftFile[] = [];
    for (const file of Array.from(list)
      .filter((file) =>
        accept
          ? accept.find((ext) => file.name.toLowerCase().endsWith(ext)) !==
            undefined
          : true,
      )
      .slice(0, MAX_FILES_PER_MESSAGE - newFiles.length)) {
      const draft: DraftFile = {
        id: randomString(10),
        file,
        url: URL.createObjectURL(file),
      };
      newFiles.push(draft);
      added.push(draft);
    }
    setFiles(newFiles);
    event.currentTarget.value = "";
    (async () => {
      // Read all audio files at the same time and push only one additional
      // state update. We shouldn't really need to process all files every
      // time, but the difference should be negligible since browsers cache
      // the `Audio`.
      const withDurations = await Promise.all(
        newFiles.map((file) =>
          (async () => {
            if (!isAudioType(file.file.type) || !file.url) return file;
            const duration = await getAudioDuration(file.url);
            if (duration !== null) {
              file.duration_secs = duration;
            }
            return file;
          })(),
        ),
      );
      console.log(withDurations.map((w) => [w.file.name, w.duration_secs]));
      setFiles([...withDurations]);
    })();

    return added;
  }) satisfies React.ChangeEventHandler<HTMLInputElement>;
