export interface Settings {
  theme?: "light" | "dark";
  display?: "cozy" | "compact";
  fontSize?: number;
  confirmExit?: boolean;
  expandSections?: boolean;
}

export interface LocalStorage {
  settings?: Settings;
  databaseUpgradedVersion?: string;
}

export const getLocalStorage = (): LocalStorage => {
  try {
    localStorage;
  } catch {
    return {};
  }

  const settings = JSON.parse(
    localStorage.getItem("settings") ?? "{}",
  ) as Settings;
  const databaseUpgradedVersion =
    localStorage.getItem("database-upgraded-version") || undefined;

  return { settings, databaseUpgradedVersion };
};
