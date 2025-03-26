import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { ClientOnly } from "remix-utils/client-only";
import { Message } from "./components/preview/Message.client";
import "./styles/coolicons.css";
import "./styles/tailwind.css";
import { getZodErrorMessage } from "./util/loader";

// i18n
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { getClientLocale } from "./util/localstorage";

export const meta: MetaFunction = () => {
  return [
    { title: "Discohook" },
    {
      name: "description",
      content:
        "Free, intuitive interface for creating webhook messages in your Discord server.",
    },
    {
      property: "og:image",
      content: "/logos/discohook_144w.png",
    },
    {
      name: "theme-color",
      content: "#58b9ff",
    },
    // This is here instead of `links` so that it can be overridden by server pages
    {
      tagName: "link",
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
  ];
};

export const links: LinksFunction = () => [
  // ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "manifest", href: "/manifest.json" },
];

export const handle = {
  i18n: "common",
};

const TailwindThemeScript = () => (
  <script
    // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted HTML
    dangerouslySetInnerHTML={{
      __html: `
    const settings = JSON.parse(localStorage.getItem("discohook_settings") ?? "{}");

    if (
      settings.theme === "light" ||
      (!settings.theme &&
        window.matchMedia("(prefers-color-scheme: light)").matches)
    ) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  `,
    }}
  />
);

export const FullscreenThrobber = () => (
  <div className="h-screen w-full flex absolute top-0 left-0">
    <img
      src="/logos/icon-light.svg"
      alt="Discohook"
      className="h-32 animate-pulse m-auto block dark:hidden"
    />
    <img
      src="/logos/icon.svg"
      alt="Discohook"
      className="h-32 animate-pulse m-auto hidden dark:block"
    />
  </div>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language} className="dark" dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <TailwindThemeScript />
      </head>
      <body className="bg-white text-black dark:bg-primary-600 dark:text-primary-230 isolate">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default function App() {
  const locale = getClientLocale();
  useChangeLanguage(locale);

  return (
    <ClientOnly fallback={<FullscreenThrobber />}>
      {() => <Outlet />}
    </ClientOnly>
  );
}

export function ErrorBoundary() {
  const locale = getClientLocale();
  useChangeLanguage(locale);

  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    console.error(error);
  }

  return (
    <ClientOnly fallback={<FullscreenThrobber />}>
      {() => (
        <div className="p-8 max-w-3xl mx-auto">
          <Message
            message={{
              content: [
                "You just encountered an error, here's all we know:",
                "```",
                isRouteErrorResponse(error)
                  ? typeof error.data === "object" && "message" in error.data
                    ? getZodErrorMessage(error.data)
                    : String(error.data)
                  : String(error),
                "```",
                "If you think this shouldn't have happened, visit the support server.",
              ].join("\n"),
              components: [
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.Button,
                      style: ButtonStyle.Link,
                      label: "Support Server",
                      url: "/discord",
                    },
                  ],
                },
              ],
            }}
          />
        </div>
      )}
    </ClientOnly>
  );
}
