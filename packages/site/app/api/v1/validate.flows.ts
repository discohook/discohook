import { getUser } from "~/session.server";
import { refineZodDraftFlowMax } from "~/types/flows";
import { LoaderArgs } from "~/util/loader";
import { userIsPremium } from "~/util/users";

export const action = async ({ request, context }: LoaderArgs) => {
  const data = await request.json();

  const user = await getUser(request, context, true);
  const premium = userIsPremium(user);

  const parsed = await refineZodDraftFlowMax(premium).array().spa(data);

  // if (parsed.success) {
  //   // Check for message actions
  // }

  return {
    success: parsed.success,
    error: !parsed.success ? parsed.error.format() : undefined,
  };
};
