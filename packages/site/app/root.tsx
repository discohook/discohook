import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { ClientOnly } from "remix-utils/client-only";
import styles from "../styles/app.css";
import { Message } from "./components/preview/Message.client";
import getI18next from "./i18next.server";
import icons from "./styles/coolicons.css";
import { type LoaderArgs, getZodErrorMessage } from "./util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const locale = await getI18next(context).getLocale(request);
  return { locale };
};

export const handle = { i18n: "common" };

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
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: icons },
  { rel: "manifest", href: "/manifest.json" },
];

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

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  useChangeLanguage(locale);

  return (
    <html lang={locale} className="dark" dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <TailwindThemeScript />
      </head>
      <body className="bg-white text-black dark:bg-primary-600 dark:text-primary-230 isolate">
        <ClientOnly fallback={<FullscreenThrobber />}>
          {() => <Outlet />}
        </ClientOnly>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  // We don't need to log 404s
  if (!(isRouteErrorResponse(error) && error.status === 404)) {
    console.error(error);
  }
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Error - Discohook</title>
        <Meta />
        <Links />
        <TailwindThemeScript />
      </head>
      <body className="bg-[#FBFBFB] text-black dark:bg-primary-600 dark:text-primary-230 h-screen flex">
        <div className="p-8 max-w-3xl mx-auto">
          <ClientOnly fallback={<FullscreenThrobber />}>
            {() => (
              <Message
                message={{
                  content: [
                    "You just encountered an error, here's all we know:",
                    "```",
                    isRouteErrorResponse(error)
                      ? typeof error.data === "object" &&
                        "message" in error.data
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
            )}
          </ClientOnly>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
