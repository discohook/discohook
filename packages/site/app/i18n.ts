export const supportedLanguages = [
  "en",
  "en-GB",
  "zh",
  "ar",
  "nl",
  "de",
  "it",
  "es",
  "sv",
  "fr",
  "cs",
  "pt-BR",
  "id",
  "uk",
  "ru",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export default {
  supportedLngs: [...supportedLanguages],
  fallbackLng: "en",
  defaultNS: "common",
};
