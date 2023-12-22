import { z } from "zod";

export const ZodKofiDonationPayload = z.object({
  data: z.object({
    verification_token: z.string(),
    message_id: z.string(),
    timestamp: z.string(),
    type: z.enum(["Subscription", "Donation", "Commission", "Shop Order"]),
    is_public: z.boolean(),
    from_name: z.string(),
    message: z.string(),
    amount: z.string(),
    url: z.string(),
    email: z.string(),
    currency: z.string(),
    is_subscription_payment: z.boolean(),
    is_first_subscription_payment: z.boolean(),
    kofi_transaction_id: z.string(),
    shop_items: z.nullable(
      z.array(
        z.object({
          direct_link_code: z.string(),
          variation_name: z.string(),
          quantity: z.number(),
        })
      )
    ),
    tier_name: z.nullable(z.string()),
    shipping: z.nullable(
      z.object({
        full_name: z.string(),
        street_address: z.string(),
        city: z.string(),
        state_or_province: z.string(),
        postal_code: z.string(),
        country: z.string(),
        country_code: z.string(),
        telephone: z.string(),
      })
    ),
  }),
});

export type KofiDonationPayload = z.infer<typeof ZodKofiDonationPayload>;
