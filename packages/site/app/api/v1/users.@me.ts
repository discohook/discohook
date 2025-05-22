import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  return user;
};

export type ApiGetCurrentUser = typeof loader;
