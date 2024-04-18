import { useEffect, useState } from "react";

export type LocaleCode = "en-US" | "en-GB" | "ar" | "zh" | "fr" | "nl";

export interface Settings {
  theme?: "light" | "dark" | "sync";
  messageDisplay?: "cozy" | "compact";
  compactAvatars?: boolean;
  skinTone?: 0 | 1 | 2 | 3 | 4;
  forceDualPane?: boolean;
  locale?: LocaleCode;
}

export const useLocalStorage = (): [
  Settings,
  (data: Partial<Settings>) => void,
] => {
  try {
    localStorage;
  } catch {
    return [{}, (data: Partial<Settings>) => {}];
  }

  const settings = JSON.parse(
    localStorage.getItem("discohook_settings") ?? "{}",
  );
  const [state, setState] = useState(settings as Settings);
  useEffect(() => {
    const listenStorageChange = () => {
      setState(JSON.parse(localStorage.getItem("discohook_settings") ?? "{}"));
    };
    window.addEventListener("storage", listenStorageChange);
    return () => window.removeEventListener("storage", listenStorageChange);
  }, []);

  const update = (data: Partial<Settings>) => {
    const newData = { ...settings, ...data };
    localStorage.setItem("discohook_settings", JSON.stringify(newData));
    window.dispatchEvent(new Event("storage"));
  };

  return [state, update];
};
