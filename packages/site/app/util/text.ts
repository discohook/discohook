export const copyText = (text: string) => {
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";

  const root = document.body;
  root.append(input);

  input.focus();
  input.select();

  document.execCommand("copy");

  input.remove();
};

export const randomString = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

export const base64Decode = (urlSafeBase64: string) => {
  const base64 = urlSafeBase64.replace(/-/g, "+").replace(/_/g, "/");

  if (typeof window === "undefined") {
    return Buffer.from(base64, "base64").toString("utf8");
  }

  try {
    const encoded = atob(base64)
      .split("")
      .map((char) => char.charCodeAt(0).toString(16))
      .map((hex) => `%${hex.padStart(2, "0").slice(-2)}`)
      .join("");

    return decodeURIComponent(encoded);
  } catch {
    // return nothing
  }
};

export const base64Encode = (utf8: string) => {
  if (typeof window === "undefined") {
    return Buffer.from(utf8, "utf8").toString("base64");
  }

  const encoded = encodeURIComponent(utf8);

  const escaped = encoded.replace(/%[\dA-F]{2}/g, (hex) => {
    return String.fromCharCode(Number.parseInt(hex.slice(1), 16));
  });

  return btoa(escaped);
};

export const base64UrlEncode = (utf8: string) => {
  return base64Encode(utf8)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const hexToRgb = (hex: string) => {
  const arrBuff = new ArrayBuffer(4);
  const vw = new DataView(arrBuff);
  vw.setUint32(0, parseInt(hex, 16), false);
  const arrByte = new Uint8Array(arrBuff);

  return [arrByte[1], arrByte[2], arrByte[3]];
};

export const getRgbComponents = (color: number) => hexToRgb(color.toString(16));
