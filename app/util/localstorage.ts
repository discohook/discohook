import { useState } from "react";

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

  const update = (data: Partial<Settings>) => {
    const newData = { ...settings, ...data };
    localStorage.setItem("boogiehook_settings", JSON.stringify(newData));
    setState(newData);
  };

  return [state, update];
};
