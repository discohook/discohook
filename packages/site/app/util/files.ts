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
