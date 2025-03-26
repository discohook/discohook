import resourcesToBackend from "i18next-resources-to-backend";
import { RemixI18Next } from "remix-i18next/server";
import i18n from "~/i18n";

export const Backend = resourcesToBackend(
  // @ts-expect-error our target is ES2022
  (lng: string, ns: string) => import(`../public/i18n/${ns}/${lng}.json`),
);

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },
  i18next: i18n,
  plugins: [Backend],
});

export default i18next;
