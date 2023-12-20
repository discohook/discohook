import { ActionArgs } from "~/util/loader";
import { zx } from "zodix";
import { ZodKofiDonationPayload } from "~/types/kofi";
import { json } from "@remix-run/cloudflare";

export const action = async ({ request, context }: ActionArgs) => {
  const verificationToken = context.env.KOFI_WEBHOOK_TOKEN;
  if (!verificationToken) {
    // Technically optional on ko-fi's side,
    // but there's no reason not to do this.
    throw new Error("Must provide KOFI_WEBHOOK_TOKEN");
  }

  const { data } = await zx.parseForm(request, ZodKofiDonationPayload);
  if (data.verification_token !== verificationToken) {
    throw json({ message: "Invalid verification token." }, 403);
  }
  return null;
};
