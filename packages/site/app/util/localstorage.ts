import { useEffect, useState } from "react";
import i18n, { type SupportedLanguage, supportedLanguages } from "~/i18n";

export type LocaleCode =
  | "en-US"
  | "en-GB"
  | "ar"
  | "zh"
  | "fr"
  | "nl"
  | "es"
  | "de"
  | "it"
  | "cs"
  | "id"
  | "uk"
  | "ru";

export interface Settings {
  theme?: "light" | "dark" | "sync";
  messageDisplay?: "cozy" | "compact";
  webhookInput?: "modern" | "classic";
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
  // biome-ignore lint/correctness/useHookAtTopLevel: server/client case
  const [state, setState] = useState(settings as Settings);
  // biome-ignore lint/correctness/useHookAtTopLevel: ^
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

export const getClientLocale = (): SupportedLanguage => {
  try {
    localStorage;
  } catch {
    return i18n.fallbackLng as SupportedLanguage;
  }
  const lang = localStorage.getItem("locale") as SupportedLanguage | null;
  if (lang && supportedLanguages.includes(lang)) {
    return lang;
  }
  return i18n.fallbackLng as SupportedLanguage;
};
