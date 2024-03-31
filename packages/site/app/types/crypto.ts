import { z } from "zod";
import { zx } from "zodix";

export const ZodCryptoWalletWatchPayload = z.object({
  type: z.literal("wallet"),
  message: z.string(),
  blockchain: z.string(),
  address: z.string(),
  currency: z.string(),
  value: zx.NumAsString,
});

export const ZodCryptoAlert = z.discriminatedUnion("type", [
  ZodCryptoWalletWatchPayload,
]);
