import mime from "mime";

export const BASE = "https://catbox.moe";

export const uploadFile = async (
  fileOrUrl: string | Blob,
  options?: { userhash?: string },
) => {
  let contentType: string | undefined;
  const body = new FormData();
  if (typeof fileOrUrl === "string") {
    body.set("reqtype", "urlupload");
    body.set("url", fileOrUrl);
    try {
      contentType = mime.getType(new URL(fileOrUrl).pathname) ?? undefined;
    } catch {}
  } else {
    body.set("reqtype", "fileupload");
    body.set("fileToUpload", fileOrUrl);
    contentType = fileOrUrl.type;
  }
  if (options?.userhash) body.set("userhash", options.userhash);

  const res = await fetch(`${BASE}/user/api.php`, {
    method: "POST",
    body,
    headers: {
      "User-Agent": "Discohook/1.0 (+https://github.com/discohook/discohook)",
    },
  });
  if (!res.ok) {
    throw Error(
      `Failed to upload file: HTTP ${res.status}. ${await res.text()}`,
    );
  }
  const data = await res.text();
  const { origin, pathname } = new URL(data);
  const thumbnail_url = `${origin}/thumbs/${pathname.replace(/^\//, "t_")}`;

  return { url: data, thumbnail_url, mime: contentType };
};

// const uploadUrl = uploadFile;

export const deleteFile = async (
  filenames: string[],
  options: { userhash: string },
): Promise<null> => {
  const body = new FormData();
  body.set("reqtype", "deletefiles");
  body.set("userhash", options.userhash);
  body.set("files", filenames.join(" "));
  const res = await fetch(`${BASE}/user/api.php`, {
    method: "POST",
    body,
    headers: {
      "User-Agent": "Discohook/1.0 (+https://github.com/discohook/discohook)",
    },
  });
  if (!res.ok) {
    throw Error(`Failed to delete: HTTP ${res.status}. ${await res.text()}`);
  }
  return null;
};
