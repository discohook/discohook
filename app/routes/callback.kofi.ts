import { ActionFunctionArgs, json } from "@remix-run/node";
import { zx } from "zodix";
import { ZodKofiDonationPayload } from "~/types/kofi";

export const action = async ({ request }: ActionFunctionArgs) => {
  const verificationToken = process.env.KOFI_WEBHOOK_TOKEN;
  if (!verificationToken) {
    // Technically optional on ko-fi's side,
    // but there's no reason not to do this.
    throw new Error("Must provide KOFI_WEBHOOK_TOKEN");
  }

  const { data } = await zx.parseForm(request, ZodKofiDonationPayload);
  if (data.verification_token !== verificationToken) {
    throw json({ message: "Invalid verification token." }, 403);
  }
};
