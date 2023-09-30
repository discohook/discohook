import { useEffect, useState } from "react";

export interface Settings {
  theme?: "light" | "dark" | "sync";
  messageDisplay?: "cozy" | "compact";
  compactAvatars?: boolean;
}

export const useLocalStorage = (): [
  Settings,
  (data: Partial<Settings>) => void
] => {
  try {
    localStorage;
  } catch {
    return [{}, (data: Partial<Settings>) => {}];
  }

  const settings = JSON.parse(
    localStorage.getItem("boogiehook_settings") ?? "{}"
  );
  const [state, setState] = useState(settings as Settings);
  useEffect(() => {
    const listenStorageChange = () => {
      setState(JSON.parse(localStorage.getItem("boogiehook_settings") ?? "{}"));
    };
    window.addEventListener("storage", listenStorageChange);
    return () => window.removeEventListener("storage", listenStorageChange);
  }, []);

  const update = (data: Partial<Settings>) => {
    const newData = { ...settings, ...data };
    localStorage.setItem("boogiehook_settings", JSON.stringify(newData));
    window.dispatchEvent(new Event("storage"));
  };

  return [state, update];
};