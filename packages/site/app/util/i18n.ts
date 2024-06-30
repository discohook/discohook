import type { Resource } from "i18next";

export const resources = {
  en: {
    translation: require("../i18n/en.json"),
  },
  "en-GB": {
    translation: require("../i18n/en-GB.json"),
  },
  zh: {
    translation: require("../i18n/zh.json"),
  },
  ar: {
    translation: require("../i18n/ar.json"),
  },
  nl: {
    translation: require("../i18n/nl.json"),
  },
  de: {
    translation: require("../i18n/de.json"),
  },
  it: {
    translation: require("../i18n/it.json"),
  },
  es: {
    translation: require("../i18n/es.json"),
  },
  sv: {
    translation: require("../i18n/sv.json"),
  },
  fr: {
    translation: require("../i18n/fr.json"),
  },
} satisfies Resource;

export type i18nResources = typeof resources;
