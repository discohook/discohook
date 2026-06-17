import type { FilehostUploadResponse } from ".";

export const BASE = "https://sxcu.net";
const BASE_API = `${BASE}/api`;

// let isBrowser = false;
// try {
//   isBrowser = window !== undefined;
// } catch {}

const userAgent = "sxcuUploader/1.0 (+https://discohook.app)";

interface SxcuOptions {
  domain?: string;
  /** Subdomain's upload token */
  token?: string;
  // collection?: string;
  // collection_token?: string;
  // self_destruct?: boolean;
  // og_properties?: {
  //   title?: string;
  //   description?: string;
  //   color?: string;
  //   site_name?: string;
  //   discord_hide_url?: boolean;
  // };
  onUploadProgress?: (progress: number) => void;
  onUploadEnd?: () => void;
}

interface UploadSuccess {
  id: string; // snowflake
  url: string;
  del_url: string;
  thumb?: string;
}

export const uploadFile = async (
  file: Blob,
  options?: SxcuOptions,
): Promise<FilehostUploadResponse> => {
  const body = new FormData();
  body.set("file", file);
  body.set("noembed", "");
  if (options?.token) body.set("token", options.token);

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
    xhr.open("POST", `${BASE_API}/files/create`, true);
    // https://discord.com/channels/589748476200484884/589750818979315724/1511436135904186468
    // xhr.setRequestHeader("User-Agent", userAgent);
    xhr.send(body);
  });
  if (!data) {
    let text = `HTTP ${xhr.status}`;
    try {
      const err = JSON.parse(xhr.responseText);
      if (err.code) {
        text = `${err.code}: ${err.error}`;
      } else if (err.error) {
        text = err.error;
      }
    } catch {}
    if (text === "HTTP 0") {
      // I think the preflight sometimes times out which results in a
      // CORS error
      text = "Try again.";
    }
    throw Error(`Failed to upload: ${text}`);
  }

  const url = new URL(data.url);
  if (options?.domain) url.hostname = options.domain;
  return {
    url: url.href,
    delete_url: data.del_url,
    thumbnail_url: data.thumb,
    mime: file.type,
  };
};

/**
 * Delete a file from the server
 *
 * @param id file snowflake
 * @param token deletion token
 */
export const deleteFile = async (id: string, token: string) => {
  const res = await fetch(`${BASE_API}/files/delete/${id}/${token}`, {
    method: "GET",
    headers: { "User-Agent": userAgent },
  });
  if (!res.ok) {
    let text = `HTTP ${res.status}`;
    try {
      const err = JSON.parse(await res.text());
      if (err.code) {
        text = `${err.code}: ${err.error}`;
      } else if (err.error) {
        text = err.error;
      }
    } catch {}
    throw Error(`Failed to delete: ${text}`);
  }
};
