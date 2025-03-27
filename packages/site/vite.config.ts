import {
  cloudflareDevProxyVitePlugin,
  vitePlugin as remix,
} from "@remix-run/dev";
import fs from "node:fs/promises";
import { defineConfig } from "vite";
import { denyImports, envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

const pathify = (filename: string) =>
  filename
    // Remove file extension
    .replace(/\.(?:ts|js|md)x?$/, "")
    // Path separators
    .replace(/([^[])\.([^\]])/g, "$1/$2")
    // Config routes require colons instead of dollar signs for some reason.
    // Doesn't support splat routes but we don't currently have any of those
    .replace(/([^[])\$([^\]])/g, "$1:$2")
    // Literal placeholders
    .replace(/\[(.+)\]/, "$1");

const getRouteFilenames = async (dir: string) => {
  return (await fs.readdir(dir)).filter(
    (f) =>
      [".ts", ".tsx", ".js", ".jsx", ".mdx"].filter((e) => f.endsWith(e))
        .length !== 0,
  );
};

export default defineConfig({
  server: { port: 8788 },
  plugins: [
    cloudflareDevProxyVitePlugin({ getLoadContext }),
    remix({
      future: {
        v3_fetcherPersist: true,
        // v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        // v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        unstable_optimizeDeps: true,
      },
      routes: async (defineRoutes) => {
        const filesV1 = await getRouteFilenames("./app/api/v1");
        return defineRoutes((route) => {
          for (const file of filesV1) {
            route(`/api/v1/${pathify(file)}`, `api/v1/${file}`);
          }
        });
      },
    }),
    envOnlyMacros(),
    denyImports({
      client: {
        files: ["api/v1/*", "**/.server/*", "**/*.server.*"],
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  build: {
    minify: true,
  },
});
