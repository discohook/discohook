import mime from "mime";
import { apiUrl, BRoutes } from "~/api/routing";
import type { PostimageDetails } from "~/api/v1/filehosts.postimages.images.$id.$hash";
import type { FilehostUploadResponse } from ".";

export const BASE = "https://postimages.org";
export const SHORT = "https://postimg.cc";
const ENDPOINT = `${BASE}/json`;

interface PostimgOptions {
  filename?: string;
  gallery?: string;
  /** In seconds (0 = never expire) */
  expiration?: number;
  /** Resizing options
   * - 0: Do not resize
   * - 1: 64x64
   * - 2: 150x150
   * - 3: 320x240
   * - 4: 640x480
   * - 5: 800x600
   * - 6: 1024x768
   * - 7: 1280x720
   * - 8: 1920x1080
   * - 9: 3840x2160
   */
  resize?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  onUploadProgress?: (progress: number) => void;
  onUploadEnd?: () => void;
}

interface UploadSuccess {
  url: string;
  image: string;
}

const getSession = () => Date.now() + Math.random().toString().substring(1);

export const uploadFile = async (
  fileOrUrl: string | Blob,
  options?: PostimgOptions,
): Promise<FilehostUploadResponse> => {
  const body = new FormData();
  const session = getSession();

  body.set("gallery", options?.gallery ?? "");
  body.set("optsize", String(options?.resize ?? "0"));
  body.set("expire", String(options?.expiration ?? "0"));
  body.set("numfiles", "1");
  try {
    body.set("forumurl", origin);
  } catch {
    body.set("forumurl", "http://localhost");
  }
  body.set("upload_session", session);
  let contentType = "application/octet-stream";
  if (typeof fileOrUrl === "string") {
    body.set("url", fileOrUrl);
    contentType = mime.getType(new URL(fileOrUrl).pathname) ?? contentType;
  } else {
    body.set("file", fileOrUrl, options?.filename);
    contentType = fileOrUrl.type;
  }

  const xhr = new XMLHttpRequest();
  const data = await new Promise<UploadSuccess | null>((resolve) => {
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        options?.onUploadProgress?.(event.loaded / event.total);
      }
    });
    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        options?.onUploadProgress?.(event.loaded / event.total);
      }
    });
    xhr.addEventListener("loadend", () => {
      options?.onUploadEnd?.();
      resolve(
        xhr.readyState === 4 && xhr.status === 200
          ? (JSON.parse(xhr.responseText) as UploadSuccess)
          : null,
      );
    });
    xhr.open("POST", ENDPOINT, true);
    xhr.send(body);
  });
  if (!data) {
    let text = `HTTP ${xhr.status}`;
    try {
      const err = JSON.parse(xhr.responseText);
      if (err.error) {
        text = `${err.error.code}: ${err.error.message}`;
      }
    } catch {}
    throw Error(`Failed to upload: ${text}`);
  }

  const [id, hash] = data.url.split("/").slice(3);
  const detailsResp = await fetch(
    apiUrl(BRoutes.filehostsPostimagesDetails(id, hash)),
  );
  if (!detailsResp.ok) {
    const err = (await detailsResp.json()) as any;
    throw Error(
      `Failed to fetch direct URL: ${err.message ?? `HTTP ${detailsResp.status}`} - page URL: ${data.url}`,
    );
  }
  const details = (await detailsResp.json()) as PostimageDetails;

  return {
    url: details.url,
    delete_url: details.delete_url,
    thumbnail_url: details.thumbnail_url,
    mime: contentType,
    // session,
  };
};

export const deleteFile = async (options: { hash: string; image: string }) => {
  await fetch(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Content-Type": "application/json",
      // Referer: `${SHORT}/${options.image}/${options.hash}`,
    },
  });
};
