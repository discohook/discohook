import { Resource } from "i18next";

import arabic from "../i18n/ar.json";
import britishEnglish from "../i18n/en-GB.json";
import english from "../i18n/en.json";
import french from "../i18n/fr.json";
import dutch from "../i18n/nl.json";
import chinese from "../i18n/zh.json";

export const resources = {
  en: {
    translation: english,
  },
  "en-GB": {
    translation: britishEnglish,
  },
  zh: {
    translation: chinese,
  },
  ar: {
    translation: arabic,
  },
  nl: {
    translation: dutch,
  },
  de: {
    translation: {
      defaultPlaceholder: "Triff eine Auswahl",
      donate: "Spenden",
      todayAt: "heute um {{time}} Uhr",
    },
  },
  it: {
    translation: {
      defaultPlaceholder: "Seleziona",
    },
  },
  es: {
    translation: {
      defaultPlaceholder: "Haz una selección",
      todayAt: "hoy a las {{time}}",
    },
  },
  se: {
    translation: {
      defaultPlaceholder: "Gör ett val",
    },
  },
  ne: {
    translation: {
      defaultPlaceholder: "Maak een selectie",
    },
  },
  fr: {
    translation: french,
  },
} satisfies Resource;

export type i18nResources = typeof resources;
