import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/app.css";
import icons from "./styles/coolicons.css";

export const links: LinksFunction = () => {
  const bundleStyles = cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : [];
  return [
    ...bundleStyles,
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: icons },
    { rel: "manifest", href: "manifest.json" },
  ];
};

export default function App() {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const settings = JSON.parse(localStorage.getItem("boogiehook_settings") ?? "{}");

              if (
                settings.theme === "light" ||
                (!settings.theme &&
                  window.matchMedia("(prefers-color-scheme: light)").matches)
              ) {
                document.documentElement.classList.remove("dark");
              } else {
                document.documentElement.classList.add("dark");
              }
            `
          }}
        />
      </head>
      <body className="bg-white text-black dark:bg-[#313338] dark:text-[#dbdee1]">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
