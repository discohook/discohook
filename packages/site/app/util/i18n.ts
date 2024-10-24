import type { Resource } from "i18next";

const tr = (file: any) => ({ translation: file });

export const resources = {
  en: tr(require("../i18n/en.json")),
  "en-GB": tr(require("../i18n/en-GB.json")),
  zh: tr(require("../i18n/zh.json")),
  ar: tr(require("../i18n/ar.json")),
  nl: tr(require("../i18n/nl.json")),
  de: tr(require("../i18n/de.json")),
  it: tr(require("../i18n/it.json")),
  es: tr(require("../i18n/es.json")),
  sv: tr(require("../i18n/sv.json")),
  fr: tr(require("../i18n/fr.json")),
  cs: tr(require("../i18n/cs.json")),
  "pt-BR": tr(require("../i18n/pt-BR.json")),
  id: tr(require("../i18n/id.json")),
} satisfies Resource;

export type i18nResources = typeof resources;
