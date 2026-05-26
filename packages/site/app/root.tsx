import { Collapsible } from "@base-ui/react/collapsible";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import {
  ButtonStyle,
  ComponentType,
  RESTJSONErrorCodes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { t } from "i18next";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { ClientOnly } from "remix-utils/client-only";
import { twJoin } from "tailwind-merge";
import { apiUrl, BRoutes } from "./api/routing";
import { collapsibleStyles } from "./components/collapsible";
import { CoolIcon } from "./components/icons/CoolIcon";
import { codeStyle } from "./components/preview/Markdown";
import { Message } from "./components/preview/Message.client";
import getI18next from "./i18next.server";
import { Cell } from "./routes/donate";
import styles from "./styles/app.css";
import icons from "./styles/coolicons.css";
import { isErrorData, type RESTErrorWithContext } from "./util/discord";
import {
  getZodErrorMessage,
  useSafeFetcher,
  type LoaderArgs,
} from "./util/loader";

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
        const override = new URLSearchParams(window.location.search).get("theme");

        // query param gets priority. this is for the viewer route
        if (override === "light") {
          document.documentElement.classList.remove("dark");
        } else if (override === "dark") {
          document.documentElement.classList.add("dark");
        } else if (
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

function ErrorPermissions({ data }: { data: RESTErrorWithContext }) {
  const required = new PermissionsBitField(
    BigInt(data.context?.required_permissions ?? "0"),
  );
  const fetcher = useSafeFetcher<{
    user: string;
    bot: string;
    guild?: { user: string; bot: string; userOwner: boolean };
  }>({});
  const permissions = useMemo(() => {
    if (fetcher.data) {
      if (fetcher.data.guild) {
        return {
          guild: new PermissionsBitField(BigInt(fetcher.data.guild.bot)),
          channel: new PermissionsBitField(BigInt(fetcher.data.bot)),
        };
      }
      return { guild: new PermissionsBitField(BigInt(fetcher.data.bot)) };
    }
    return {};
  }, [fetcher.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: no loop for fetcher
  useEffect(() => {
    if (fetcher.data || fetcher.state !== "idle") return;
    if (data.context?.channel) {
      fetcher.load(apiUrl(BRoutes.channelPermissions(data.context.channel.id)));
    } else if (data.context?.guild) {
      fetcher.load(apiUrl(BRoutes.channelPermissions(data.context.guild.id)));
    }
  }, [data.context]);

  return (
    <div>
      <p className="text-lg font-medium">Permissions Error</p>
      <p>
        {data.code === RESTJSONErrorCodes.MissingPermissions ||
        data.context?.required_permissions !== undefined
          ? "Discohook Utils needs additional permissions to complete the request."
          : "Discohook Utils is missing access to the resource, so it cannot complete the request."}
      </p>
      {data.context?.required_permissions ? (
        <div className="rounded-lg bg-gray-100 dark:bg-gray-700 table w-full mt-2">
          <div className="table-header-group">
            <div className="table-row">
              <Cell
                edges="tl"
                className="font-semibold bg-gray-200 dark:bg-inherit"
              >
                Permission
              </Cell>
              {data.context?.guild !== undefined ||
              permissions?.guild !== undefined ? (
                <Cell
                  edges={data.context?.channel ? "t" : "tr"}
                  className="font-semibold bg-gray-200 dark:bg-inherit"
                >
                  Server
                </Cell>
              ) : null}
              {data.context?.channel ? (
                <Cell
                  edges="tr"
                  className="font-semibold bg-gray-200 dark:bg-inherit"
                >
                  Channel
                </Cell>
              ) : null}
            </div>
          </div>
          <div className="table-row-group">
            {Object.entries(PermissionFlags)
              .filter(([_, val]) => required.has(val))
              .map(([flag, value], i, arr) => (
                <div
                  key={flag}
                  className={twJoin(
                    "table-row",
                    // no unnecessary highlight
                    (arr.length > 4 &&
                      permissions.channel &&
                      !permissions.channel.has(value)) ||
                      (permissions.guild && !permissions.guild.has(value))
                      ? "bg-blurple/10"
                      : undefined,
                  )}
                >
                  <Cell edges={i === arr.length - 1 ? "bl" : "l"}>
                    {t(`permission.${flag}`, { lng: "en" })}
                  </Cell>
                  {data.context?.guild !== undefined ||
                  permissions?.guild !== undefined ? (
                    <Cell
                      edges={
                        i === arr.length - 1
                          ? !data.context?.channel
                            ? "br"
                            : "b"
                          : !data.context?.channel
                            ? "r"
                            : undefined
                      }
                      className={twJoin(
                        !permissions?.guild ? "animate-pulse" : undefined,
                      )}
                    >
                      <CoolIcon
                        className={twJoin(
                          "text-lg",
                          permissions?.guild
                            ? permissions.guild.has(value)
                              ? "text-green-400"
                              : "text-rose-400"
                            : "text-muted dark:text-muted-dark",
                        )}
                        icon={
                          permissions?.guild
                            ? permissions.guild.has(value)
                              ? "Circle_Check"
                              : "Close_Circle"
                            : "Help"
                        }
                      />
                    </Cell>
                  ) : null}
                  {data.context?.channel ? (
                    <Cell
                      edges={i === arr.length - 1 ? "br" : "r"}
                      className={twJoin(
                        !permissions?.channel ? "animate-pulse" : undefined,
                      )}
                    >
                      <CoolIcon
                        className={twJoin(
                          "text-lg",
                          permissions?.channel
                            ? permissions.channel.has(value)
                              ? "text-green-400"
                              : "text-rose-400"
                            : "text-muted dark:text-muted-dark",
                        )}
                        icon={
                          permissions?.channel
                            ? permissions.channel.has(value)
                              ? "Circle_Check"
                              : "Close_Circle"
                            : "Help"
                        }
                      />
                    </Cell>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      ) : null}
      <p className="mt-2 text-muted dark:text-muted-dark text-sm">
        {data.code}: {data.message}
      </p>
    </div>
  );
}

function ErrorGeneric({ data }: { data: RESTErrorWithContext }) {
  const { context: _, ...error } = data;
  return (
    <div>
      <p className="text-lg font-medium">Discord Error</p>
      <p>
        Discohook ran into an error from Discord while trying to fulfill the
        request. The message is:{" "}
        <span className={codeStyle}>{data.message}</span>
      </p>
      <Collapsible.Root
        className={twJoin(collapsibleStyles.root, "mt-2 dark:bg-gray-900")}
      >
        <Collapsible.Trigger
          className={twJoin(collapsibleStyles.trigger, "group/trigger")}
        >
          <CoolIcon
            icon="Chevron_Right"
            rtl="Chevron_Left"
            className="text-lg ltr:group-data-[panel-open]/trigger:rotate-90 rtl:group-data-[panel-open]/trigger:-rotate-90 transition-transform"
          />{" "}
          <p className="font-medium">Show original error</p>
        </Collapsible.Trigger>
        <Collapsible.Panel className={collapsibleStyles.panel}>
          <pre
            className="overflow-x-auto whitespace-pre-wrap font-code text-sm mt-1"
            dir="ltr"
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  // We don't need to log 404s
  if (!(isRouteErrorResponse(error) && error.status === 404)) {
    console.error(error);
  }
  const errorData =
    isRouteErrorResponse(error) && typeof error.data === "object"
      ? error.data
      : null;
  // we're displaying a discord error propagated from a route response
  if (errorData && isErrorData(errorData)) {
    const data = errorData as RESTErrorWithContext;
    return (
      <html lang="en" dir="ltr" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {/* remix complains about data.message even though it's a string, so we wrap it */}
          <title>{`${data.message} - Discohook`}</title>
          <Meta />
          <Links />
          <TailwindThemeScript />
        </head>
        <body className="bg-[#FBFBFB] text-black dark:bg-primary-600 dark:text-primary-230 h-screen flex">
          <div className="p-8 max-w-3xl mx-auto flex items-start">
            <img
              className="size-14 hidden sm:block me-4"
              src="/logos/icon.svg"
              alt=""
            />
            {data.code === RESTJSONErrorCodes.MissingAccess ||
            data.code === RESTJSONErrorCodes.MissingPermissions ? (
              <ErrorPermissions data={data} />
            ) : (
              <ErrorGeneric data={data} />
            )}
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" dir="ltr" className="dark">
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
