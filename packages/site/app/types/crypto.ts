import { z } from "zod";

export const ZodCryptoWalletWatchPayload = z.object({
  type: z.literal("wallet"),
  message: z.string(),
  blockchain: z.string(),
  address: z.string(),
  currency: z.string(),
  value: z.string(),
});

export const ZodCryptoAlert = z.discriminatedUnion("type", [
  ZodCryptoWalletWatchPayload,
]);
