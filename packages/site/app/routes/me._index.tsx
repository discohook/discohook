import { Link, useLoaderData } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/Button";
import { linkClassName } from "~/components/preview/Markdown";
import { TabHeader } from "~/components/tabs";
import { getUser } from "~/session.server";
import { getId } from "~/util/id";
import { LoaderArgs } from "~/util/loader";
import { getUserAvatar, getUserTag } from "~/util/users";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  return { user };
};

export default () => {
  const { t } = useTranslation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <TabHeader>{t("profile")}</TabHeader>
      <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-900 shadow-md p-4">
        <div className="flex">
          <img
            className="rounded-full ltr:mr-4 rtl:ml-4 h-[4.5rem] w-[4.5rem]"
            src={getUserAvatar(user, { size: 128 })}
            alt={user.name}
          />
          <div className="grow my-auto">
            <p className="text-2xl font-semibold leading-none dark:text-gray-100">
              {user.name}
            </p>
            <span className="text-base font-medium dark:text-gray-400">
              {getUserTag(user)}
            </span>
          </div>
          <Link to="/auth/logout" className="block mb-auto ml-auto">
            <Button discordstyle={ButtonStyle.Secondary}>{t("logOut")}</Button>
          </Link>
        </div>
        <div className="space-y-4 mt-4 rounded-lg p-4 bg-gray-400 dark:bg-gray-800">
          <div>
            <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
              {t("subscribedSince")}
            </p>
            <p className="text-base font-normal">
              {user.subscribedSince ? (
                t("timestamp.date_verbose", {
                  replace: { date: new Date(user.subscribedSince) },
                })
              ) : (
                <Link
                  to="/donate"
                  className={twMerge(
                    linkClassName,
                    "text-brand-pink dark:text-brand-pink",
                  )}
                >
                  {t("notSubscribed")}
                </Link>
              )}
              {user.lifetime ? ` (${t("lifetime")}!)` : ""}
            </p>
          </div>
          <div>
            <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
              {t("firstSubscribed")}
            </p>
            <p className="text-base font-normal">
              {user.firstSubscribed
                ? t("timestamp.date_verbose", {
                    replace: { date: new Date(user.firstSubscribed) },
                  })
                : t("never")}
            </p>
          </div>
          <div>
            <p className="uppercase font-bold text-sm leading-4 dark:text-gray-400">
              {t("joinedDiscohook")}
            </p>
            <p className="text-base font-normal">
              {t("timestamp.date_verbose", {
                replace: { date: new Date(getId(user).timestamp) },
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
