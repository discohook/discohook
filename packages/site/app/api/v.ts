import { z } from "zod";
import { zx } from "zodix";
import { LoaderArgs } from "~/util/loader";

export const API_VERSIONS = [1];

export const loader = async ({ params }: LoaderArgs) => {
  const { v: version } = zx.parseParams(params, {
    v: z
      .string()
      .refine((v) => API_VERSIONS.map((a) => `v${a}`).includes(v))
      .transform((v) => Number(v.replace(/^v/, ""))),
  });
  return version;
};

export const action = loader;
