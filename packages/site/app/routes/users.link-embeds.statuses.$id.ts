// See /api/v1/statuses.$id
// This route file is probably not necessary, and it's not particularly useful

import { redirect } from "@remix-run/cloudflare";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ params }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  throw redirect(`/link?backup=${id}`);
};
