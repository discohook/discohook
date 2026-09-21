/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@cloudflare/workers-types" />

declare module "__STATIC_CONTENT_MANIFEST" {
  const manifest: string;
  export default manifest;
}
