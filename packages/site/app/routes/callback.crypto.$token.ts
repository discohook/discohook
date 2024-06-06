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
      const response = await fetch(
        "https://blockchain.info/tobtc?currency=USD&value=4",
        {
          method: "GET",
        },
      );
      // If the increased value is less than whatever $6 is worth right now, reject
      const btcMin = Number(await response.text());
      if (payload.value < btcMin) {
        // Alert the user somehow
        break;
      }
      // Determine the user who donated
      break;
    }
    default:
      break;
  }

  return null;
};
