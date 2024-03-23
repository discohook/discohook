import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { ZodCryptoAlert } from "~/types/crypto";
import { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export const action = async ({ request, params, context }: LoaderArgs) => {
  const { token } = zxParseParams(params, {
    token: z.string(),
  });
  if (
    !context.env.CRYPTO_ALERTS_TOKEN ||
    token !== context.env.CRYPTO_ALERTS_TOKEN
  ) {
    throw json({ message: "Invalid or missing token" }, 400);
  }

  const data = await request.json();
  const payload = ZodCryptoAlert.parse(data);

  switch (payload.type) {
    case "wallet": {
      // Calculate exchange rate
      // 
      break;
    }
    default:
      break;
  }

  return null;
};
