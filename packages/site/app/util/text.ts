import { type APIButtonComponent, ComponentType } from "discord-api-types/v10";
import type { TFunction } from "~/types/i18next";
import type { APIMessageTopLevelComponent, WithKey } from "~/types/QueryData";
import { hasCustomId } from "./discord";

export const copyText = (text: string) => {
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";

  const root = document.body;
  // @ts-expect-error
  root.append(input);

  input.focus();
  input.select();

  document.execCommand("copy");

  input.remove();
};

export const cycleCopyText = (
  text: string,
  t: TFunction,
  element: HTMLElement,
  originalKey?: string,
) => {
  copyText(text);

  const key = originalKey ?? "copy";
  const inner = Array.from(element.childNodes).find(
    (n) => n.textContent === t(key),
  );
  if (inner) {
    inner.textContent = t("copied");
    setTimeout(() => {
      inner.textContent = t(key);
    }, 1500);
  }
};

export const randomString = (length: number, onlyDigits = false) => {
  const chars = onlyDigits
    ? // sacrifice uniqueness per length to reduce complexity; we don't want
      // random digit strings to start with 0, so there are no zeroes
      "123456789"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * we need to create stable internal identifiers for pretty much everything
 * in order to properly preserve the collapsed/open state when data changes
 * index. this works basically the same way as message._id
 */
export const getStableKey = <T extends { _key?: string }>(item: T): string => {
  if (item._key) return item._key;
  const key = randomString(10);
  item._key = key;
  return key;
};

// `_key` is editor-only state and we generally don't want it to go anywhere
// else, but it wouldn't be a big deal if it did
export const stripKey = <T extends { _key?: string }>(
  item: T,
  options?: { removeCustomId?: boolean },
): T => {
  const { _key, ...rest } = item;
  if (
    options?.removeCustomId &&
    // should be called something like "supports custom id" or "needs custom
    // id" as it's type-based and doesn't actually read custom_id
    !hasCustomId(rest as unknown as APIButtonComponent) &&
    "custom_id" in rest
  ) {
    rest.custom_id = undefined;
  }
  return rest as T;
};

export const stripComponentKeys = <T extends APIMessageTopLevelComponent>(
  components: T[],
  options?: { removeCustomId?: boolean },
): T[] =>
  components.map((component) => {
    const stripped = stripKey(component);
    switch (stripped.type) {
      case ComponentType.Container:
        return {
          ...stripped,
          components: stripComponentKeys(stripped.components, options),
        } as T;

      case ComponentType.ActionRow:
        return {
          ...stripped,
          components: stripped.components.map((c) => stripKey(c, options)),
        } as T;
      case ComponentType.Section:
        return {
          ...stripped,
          accessory: stripKey(
            stripped.accessory as WithKey<typeof stripped.accessory>,
            options,
          ),
        };
      default:
        return stripped;
    }
  });

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
  vw.setUint32(0, Number.parseInt(hex, 16), false);
  const arrByte = new Uint8Array(arrBuff);

  return [arrByte[1], arrByte[2], arrByte[3]];
};

export const getRgbComponents = (color: number) => hexToRgb(color.toString(16));

// Thanks https://stackoverflow.com/a/14919494
/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export const fileSize = (bytes: number, dp = 0) => {
  let b = bytes;
  const thresh = 1000;

  if (Math.abs(b) < thresh) {
    // Discord shows "bytes" for small files but abbreviations otherwise
    return `${b} bytes`;
  }

  const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  const r = 10 ** dp;

  while (Math.round(Math.abs(b) * r) / r >= thresh && u < units.length - 1) {
    b = b / thresh;
    u += 1;
  }

  return `${b.toFixed(dp)} ${units[u]}`;
};

const isObject = (value: unknown) =>
  typeof value === "object" && value !== null;

export const mapKeys = (
  object: unknown,
  fn: (key: string) => string,
): Record<string, unknown> | unknown[] => {
  if (Array.isArray(object)) {
    return object.map((value) =>
      isObject(value) ? mapKeys(value, fn) : value,
    );
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(
    object as Record<string, unknown>,
  )) {
    if (isObject(value)) {
      result[fn(key)] = mapKeys(value, fn);
    } else {
      result[fn(key)] = value;
    }
  }

  return result;
};

export const toSnakeCase = (object: unknown) =>
  mapKeys(object, (key) =>
    key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`),
  );
