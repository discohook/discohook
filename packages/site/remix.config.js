import fs from "node:fs/promises";

const pathify = (
  /** @type {string} */
  filename,
) =>
  filename
    // Remove file extension
    .replace(/\.(?:ts|js|md)x?$/, "")
    // Path separators
    .replace(/([^[])\.([^\]])/g, "$1/$2")
    // Config routes require colons instead of dollar signs, for some reason
    // Doesn't support splat routes but we don't currently have any of those
    .replace(/([^[])\$([^\]])/g, "$1:$2")
    // Literal placeholders
    .replace(/\[(.+)\]/, "$1");

const getRouteFilenames = async (
  /** @type {string} */
  dir,
) => {
  return (await fs.readdir(dir)).filter(
    (f) =>
      [".ts", ".tsx", ".js", ".jsx", ".mdx"].filter((e) => f.endsWith(e))
        .length !== 0,
  );
};

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverConditions: ["workerd", "worker", "browser"],
  serverDependenciesToBundle: [
    // bundle everything except the virtual module for the static content manifest provided by wrangler
    // TODO: removable?
    /^(?!.*\b__STATIC_CONTENT_MANIFEST\b).*$/,
  ],
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  routes: async (defineRoutes) => {
    const filesV1 = await getRouteFilenames("./app/api/v1");
    return defineRoutes((route) => {
      for (const file of filesV1) {
        route(`/api/v1/${pathify(file)}`, `api/v1/${file}`);
      }
    });
  },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};
