import { createCookie } from "@remix-run/cloudflare";
import { RemixI18Next } from "remix-i18next/server";
import i18n from "~/i18n";
import type { Context } from "./util/loader";

export const i18nCookie = createCookie("i18n", {
  httpOnly: true,
  secure: true,
});

// TODO: Custom backend for fetching from workers assets. For now, since
// we rarely SSR, we don't really need a server i18next instance so this
// is low priority.
const getI18next = (_ctx: Context) =>
  new RemixI18Next({
    detection: {
      supportedLanguages: [...i18n.supportedLngs],
      fallbackLanguage: i18n.fallbackLng,
      cookie: i18nCookie,
    },
    i18next: {
      ...i18n,
      // backend: {
      //   fetch: (url: string, options: RequestInit) => {
      //     const u = new URL(url);
      //     return ctx.env.ASSETS.fetch(
      //       u.href.replace(u.origin, "http://localhost"),
      //       options,
      //     );
      //   },
      // },
    },
    // plugins: [Backend],
  });

export default getI18next;
