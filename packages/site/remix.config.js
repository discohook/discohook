import fs from "node:fs/promises";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverConditions: ["workerd", "worker", "browser"],
  serverDependenciesToBundle: [
    // bundle everything except the virtual module for the static content manifest provided by wrangler
    /^(?!.*\b__STATIC_CONTENT_MANIFEST\b).*$/,
  ],
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  routes: async (defineRoutes) => {
    const filesV1 = (await fs.readdir("./app/api/v1")).filter(
      (f) =>
        [".ts", ".tsx", ".js", ".jsx"].filter((e) => f.endsWith(e)).length !==
        0,
    );
    return defineRoutes((route) => {
      route("/api/:v", "api/v.ts", () => {
        for (const file of filesV1) {
          const path = file
            // Remove file extension
            .replace(/\.(?:t|j)sx?$/, "")
            // Path separators
            .replace(/([^[])\.([^\]])/g, "$1/$2")
            // Config routes require colons instead of dollar signs, for some reason
            // Doesn't support splat routes but we don't currently have any of those
            .replace(/([^[])\$([^\]])/g, "$1:$2")
            // Literal placeholders
            .replace(/\[(.+)\]/, "$1");
          route(path, `api/v1/${file}`);
        }
      });
    });
  },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};
