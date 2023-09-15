import styles from "./styles/app.css";
import icons from "./styles/coolicons.css";
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

export const links: LinksFunction = () => {
  const bundleStyles = cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : [];
  return [
    ...bundleStyles,
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: icons },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 text-black dark:bg-gray-600 dark:text-gray-50">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
