import { FilehostUploadResponse } from ".";

export const BASE = "https://imgbb.com";
const BASE_API = "https://api.imgbb.com/1";

let isBrowser = false;
try {
  isBrowser = window !== undefined;
} catch {}

interface ImageVariant {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
}

interface UploadSuccess {
  status_code: number;
  success: { message: string; code: number };
  image: {
    name: string;
    extension: number;
    width: number;
    height: number;
    size: number;
    /** timestamp in seconds when the image was uploaded */
    time: number;
    /** TTL in seconds. 0 for no expiration */
    expiration: number;
    likes: number;
    extension_name: string;
    description: string | null;
    is_animated: 1 | 0;
    is_360: 1 | 0;
    nsfw: 1 | 0;
    id_encoded: string;
    /** human readable size */
    size_formatted: string;
    filename: string;
    /** direct link to the uploaded file */
    url: string;
    url_viewer: string;
    url_viewer_preview: string;
    url_viewer_thumb: string;
    image: ImageVariant & { size: number };
    thumb: ImageVariant;
    medium: ImageVariant;
    display_url: string;
    display_width: number;
    display_height: number;
    /** webpage one can visit to delete the image if uploaded anonymously */
    delete_url: string;
    views_label: string;
    likes_label: string;
    how_long_ago: string;
    date_fixed_peer: string;
    title: string;
    title_truncated: string;
    title_truncated_html: string;
    is_use_loader: boolean;
  };
  /** replica of form parameters */
  request: {
    type: string;
    action: string;
    timestamp: string;
    auth_token: string;
    expiration?: string;
  };
  status_txt: string;
}

interface APIUploadSuccess {
  data: Pick<
    UploadSuccess["image"],
    "title" | "url_viewer" | "url" | "display_url" | "delete_url"
  > & {
    id: string;
    width: string;
    height: string;
    /** bytes */
    size: string;
    /** timestamp in seconds when the image was uploaded */
    time: string;
    /** TTL in seconds. 0 for no expiration */
    expiration: string;
    image: ImageVariant;
    thumb: ImageVariant;
    medium: ImageVariant;
  };
  success: boolean;
  status: number;
}

interface IbbOptions {
  filename?: string;
  expiration?: string;
  auth_token?: string;
  cookie?: string;
  /** resize width */
  width?: number;
  /** resize height */
  height?: number;
  description?: string;
  title?: string;
  onUploadProgress?: (progress: number) => void;
  onUploadEnd?: () => void;
}

export const uploadFile = async (
  fileOrUrl: string | Blob,
  options?: IbbOptions,
): Promise<FilehostUploadResponse> => {
  const body = new FormData();
  if (typeof fileOrUrl === "string") {
    body.set("source", fileOrUrl);
    body.set("type", "url");
  } else {
    body.set("source", fileOrUrl, options?.filename);
    body.set("type", "file");
  }
  body.set("action", "upload");
  body.set("timestamp", Date.now().toString());
  if (options?.auth_token) body.set("auth_token", options.auth_token);
  if (options?.expiration) body.set("expiration", options.expiration);
  if (options?.title) body.set("title", options.title);
  if (options?.description) body.set("description", options.description);
  if (options?.width) body.set("width", String(options.width));
  if (options?.height) body.set("height", String(options.height));

  // Thanks https://stackoverflow.com/a/69400632
  // I suppose I could have put some more time into seeing whether other browsers
  // now support using fetch for this, but I don't exactly need to be cutting edge
  // when this solution suffices just fine.
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
    xhr.open("POST", `${BASE}/json`, true);
    // is this even supported in node? lol
    if (!isBrowser && options?.cookie) {
      xhr.setRequestHeader("Cookie", options.cookie);
    }
    xhr.send(body);
  });
  if (!data) {
    let text = `HTTP ${xhr.status}`;
    try {
      const err = JSON.parse(xhr.responseText);
      if (err.error) {
        text = `${err.error.code}: ${err.error.message}`;
      } else if (err.status_txt) {
        text = err.status_txt;
      }
    } catch {}
    throw Error(`Failed to upload: ${text}`);
  }

  return {
    url: data.image.url,
    delete_url: data.image.delete_url,
    width: data.image.width,
    height: data.image.height,
    expires_at: data.image.expiration
      ? (data.image.time + data.image.expiration) * 1000
      : null,
    mime: data.image.image.mime,
  };
};

export const uploadFileAPI = async (
  fileOrUrl: string | Blob,
  options: {
    key: string;
    name?: string;
    expiration?: number;
  },
) => {
  const body = new FormData();
  body.set("key", options.key);
  body.set("image", fileOrUrl);
  if (options.name) body.set("name", options.name);
  if (options.expiration) body.set("expiration", String(options.expiration));

  const res = await fetch(`${BASE_API}/upload`, { method: "POST", body });
  if (!res.ok) {
    throw Error(`Failed to upload image: HTTP ${res.status}`);
  }
  const { data: image } = (await res.json()) as APIUploadSuccess;
  return {
    url: image.url,
    delete_url: image.delete_url,
    width: Number(image.width),
    height: Number(image.height),
    expires_at: Number(image.expiration)
      ? (Number(image.time) + Number(image.expiration)) * 1000
      : null,
    mime: image.image.mime,
  };
};

export const deleteFile = async (
  id: string,
  options: {
    auth_token: string;
    type?: string;
  },
) => {
  const type = options.type ?? "image";
  const body = new URLSearchParams({
    auth_token: options.auth_token,
    pathname: `/${id}`,
    action: "delete",
    delete: type,
    from: "resource",
    owner: "",
    "deleting[id]": id,
    "deleting[type]": type,
    "deleting[url]": `https://ibb.co/${id}`,
    "deleting[privacy]": "",
    "deleting[parent_url]": "",
  });
  await fetch(`${BASE}/json`, {
    method: "POST",
    body,
    headers: { Accept: "application/json, text/javascript, */*; q=0.01" },
  });
};
