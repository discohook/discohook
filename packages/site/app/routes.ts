import { flatRoutes } from "@react-router/fs-routes";
import { type RouteConfig, route } from "@react-router/dev/routes";
import fs from "node:fs/promises";

const pathify = (filename: string) =>
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

const getRouteFilenames = async (dir: string) => {
  return (await fs.readdir(dir)).filter(
    (f) =>
      [".ts", ".tsx", ".js", ".jsx", ".mdx"].filter((e) => f.endsWith(e))
        .length !== 0,
  );
};

const filesV1 = await getRouteFilenames("./app/api/v1");

export default [
  ...filesV1.map((file) => route(`/api/v1/${pathify(file)}`, `api/v1/${file}`)),
  ...(await flatRoutes({ ignoredRouteFiles: ["**/.*", "api/v1/**"] })),
] satisfies RouteConfig;
