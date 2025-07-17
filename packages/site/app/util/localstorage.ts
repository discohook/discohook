import { useEffect, useState } from "react";
import type { LocaleCode } from "~/i18n";

export interface Settings {
  theme?: "light" | "dark" | "sync";
  messageDisplay?: "cozy" | "compact";
  webhookInput?: "modern" | "classic";
  compactAvatars?: boolean;
  skinTone?: 0 | 1 | 2 | 3 | 4;
  forceDualPane?: boolean;
  locale?: LocaleCode;
  defaultMessageFlag?: "standard" | "components";
}

export const useLocalStorage = <T = Settings>(
  key = "discohook_settings",
): [T, (data: Partial<T>) => void] => {
  try {
    localStorage;
  } catch {
    return [{} as T, (_data: Partial<T>) => {}];
  }

  const settings = JSON.parse(localStorage.getItem(key) ?? "{}");
  // biome-ignore lint/correctness/useHookAtTopLevel: server/client case
  const [state, setState] = useState(settings as T);
  // biome-ignore lint/correctness/useHookAtTopLevel: ^
  useEffect(() => {
    const eventKey = `storage_${key}`;
    const listenStorageChange = () => {
      setState(JSON.parse(localStorage.getItem(key) ?? "{}"));
    };
    window.addEventListener(eventKey, listenStorageChange);
    return () => window.removeEventListener(eventKey, listenStorageChange);
  }, [key]);

  const update = (data: Partial<T>) => {
    const newData = { ...settings, ...data };
    localStorage.setItem(key, JSON.stringify(newData));
    window.dispatchEvent(new Event(`storage_${key}`));
  };

  return [state, update];
};
