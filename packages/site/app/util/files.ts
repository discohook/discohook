import { isAudioType } from "~/components/preview/FileAttachment";
import type { DraftFile } from "~/routes/_index";
import { APIAttachment } from "~/types/QueryData-raw";
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

/**
 * Make a filename safe for an attachment:// URI. Discord converts spaces to
 * underscores, then strips unfitting characters:
 * > The filename for these URLs must be ASCII alphanumeric with underscores,
 * > dashes, or dots.
 * >
 * > https://discord.com/developers/docs/reference#uploading-files
 *
 * I think filenames might have changed sometime in 2025, but I can't find a
 * reference, and the docs still list the above (1/2026).
 *
 * @param filename input filename
 * @returns URL-safe output filename
 */
export const transformFileName = (filename: string) =>
  filename
    .replace(/ /g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .trim() || "unknown";

export const attachmentFromFile = (file: DraftFile): APIAttachment => ({
  // file.id should be numeric, but it doesn't *really* matter because we
  // replace attachment IDs with serials on execution. this is just for
  // matching blobs to attachments.
  id: file.id,
  filename: file.file.name,
  content_type: file.file.type,
  size: file.file.size,
  url: file.url ?? "http://localhost",
  proxy_url: "http://localhost",
});

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
 *
 * Additionally, processes the duration of audio files asynchronously and
 * issues another state update if applicable.
 */
export const fileInputChangeHandler = (
  files: DraftFile[],
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>,
  attachments: APIAttachment[],
  setAttachments: (attachments: APIAttachment[]) => void,
  accept?: readonly string[],
) =>
  (async (event) => {
    const list = event.currentTarget.files;
    if (!list) return;

    const newFiles = [...files];
    const added: DraftFile[] = [];
    let newAttachments = [...attachments];
    const addedAttachments: APIAttachment[] = [];
    for (const file of Array.from(list)
      .filter((file) =>
        accept
          ? accept.find((ext) => file.name.toLowerCase().endsWith(ext)) !==
            undefined
          : true,
      )
      .slice(0, MAX_FILES_PER_MESSAGE - newFiles.length)) {
      const draft: DraftFile = {
        id: randomString(15, true),
        file,
        url: URL.createObjectURL(file),
      };
      newFiles.push(draft);
      added.push(draft);

      const att = attachmentFromFile(draft);

      // Replace attachment if one already exists but its file is missing - user likely refreshed
      // the page, which persists the attachment but not its binary data, and is adding it back to
      // the state. This makes it so they don't need to delete the stale attachment afterwards.
      const extantAttachment = attachments.find(
        (a) => a.filename === file.name,
      );
      const extantFile = files.find((a) => a.file.name === file.name);
      if (extantAttachment && !extantFile) {
        newAttachments = newAttachments.map((a) =>
          a === extantAttachment ? att : a,
        );
      } else {
        newAttachments.push(att);
      }
      addedAttachments.push(att);
    }
    setFiles(newFiles);
    setAttachments(newAttachments);

    event.currentTarget.value = "";
    // Read all audio files at the same time and push only one additional
    // state update. We shouldn't really need to process all files every
    // time, but the difference should be negligible since browsers cache
    // the `Audio`.
    (async () => {
      const withDurations = await Promise.all(
        addedAttachments.map((attachment) =>
          (async () => {
            if (!isAudioType(attachment.content_type) || !attachment.url) {
              return attachment;
            }
            const duration = await getAudioDuration(attachment.url);
            if (duration !== null) attachment.duration_secs = duration;
            return attachment;
          })(),
        ),
      );
      setAttachments(
        newAttachments.map(
          (att) => withDurations.find((a) => a.id === att.id) ?? att,
        ),
      );
    })();

    return added;
  }) satisfies React.ChangeEventHandler<HTMLInputElement>;
