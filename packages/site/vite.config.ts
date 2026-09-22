import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const require = createRequire(import.meta.url);

// load highlights upfront
const highlightJsLanguages = [
  ...new Set(
    readFileSync(
      new URL("./app/util/highlighting.ts", import.meta.url),
      "utf-8",
    ).match(/highlight\.js\/lib\/languages\/[a-z0-9-]+/g),
  ),
];

export default defineConfig({
  build: {
    rollupOptions: {
      external: [/^cloudflare:/],
    },
  },
  optimizeDeps: {
    include: ["highlight.js/lib/core", ...highlightJsLanguages],
  },
  resolve: {
    alias: {
      // remix-auth/remix-auth-oauth2 requires this. See
      // app/util/remix-auth-server-runtime-shim.ts for details.
      "@remix-run/server-runtime": fileURLToPath(
        new URL(
          "./app/util/remix-auth-server-runtime-shim.ts",
          import.meta.url,
        ),
      ),
      // force djs to use the web compatible package despite nodejs_compat flag
      "@discordjs/rest": path.join(
        path.dirname(require.resolve("@discordjs/rest")),
        "web.mjs",
      ),
    },
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      persistState: { path: "../../persistence" },
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
  server: { port: 8788 },
});
