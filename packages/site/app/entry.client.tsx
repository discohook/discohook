/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import structuredClone from "@ungap/structured-clone";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

if (!("structuredClone" in globalThis)) {
  // @ts-expect-error
  globalThis.structuredClone = structuredClone;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
