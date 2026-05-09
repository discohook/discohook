import type {
  ActionFunctionArgs,
  EntryContext,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { isRouteErrorResponse, RemixServer } from "@remix-run/react";
import type { Context } from "./util/loader";

// i18n
import { createInstance } from "i18next";
import isbot from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "./i18n";
import getI18next from "./i18next.server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: Context,
) {
  const instance = createInstance();
  const i18next = getI18next(loadContext);
  const lng = await i18next.getLocale(request);

  await instance.use(initReactI18next).init({
    ...i18n,
    lng,
    // We only use one namespace (for now)
    ns: "translation",
  });

  let status = responseStatusCode;
  const body = await renderToReadableStream(
    <I18nextProvider i18n={instance}>
      <RemixServer context={remixContext} url={request.url} />
    </I18nextProvider>,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        console.error(error);
        status = 500;
      },
    },
  );

  if (isbot(request.headers.get("user-agent"))) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status,
  });
}

// Suppress 404s & other errors we don't need to log in production
// Thanks Kazuki Matsuda: https://zenn.dev/mkizka/articles/0db9bc30e1f707?locale=en
export function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  if (
    (isRouteErrorResponse(error) && error.status === 404) ||
    request.signal.aborted
  ) {
    return;
  }
  console.error(error);
}
