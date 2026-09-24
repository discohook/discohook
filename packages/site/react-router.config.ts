import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // Named "v8_viteEnvironmentApi" (not "unstable_viteEnvironmentApi") in this
  // installed React Router version - the flag was renamed/stabilized-toward-v8
  // since the older reference docs/templates that use the "unstable_" name.
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
