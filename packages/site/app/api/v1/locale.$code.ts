import { supportedLanguages } from "~/i18n";
import { i18nCookie } from "~/i18next.server";
import { zodUnionFromReadonly } from "~/types/zod";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export const action = async ({ params }: LoaderArgs) => {
  const { code } = zxParseParams(params, {
    code: zodUnionFromReadonly(supportedLanguages),
  });
  return new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": await i18nCookie.serialize(code, {
        expires: new Date(2038, 0),
      }),
    },
  });
};
