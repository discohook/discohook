import type { MetaFunction } from "@remix-run/cloudflare";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { TabsWindow } from "~/components/tabs";
import { getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  return { user };
};

export const meta: MetaFunction = () => [{ title: "Your Data - Discohook" }];

export default function Me() {
  const { t } = useTranslation();
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <TabsWindow
          tab={location.pathname}
          setTab={navigate}
          data={[
            {
              label: t("profile"),
              value: "/me",
            },
            {
              label: t("server_other"),
              value: "/me/servers",
            },
            {
              label: t("backups"),
              value: "/me/backups",
            },
            {
              label: t("shareLinks"),
              value: "/me/share-links",
            },
            {
              label: (
                <>
                  <p className="text-xs font-semibold uppercase text-brand-pink">
                    {t("deluxe")}
                  </p>
                  {t("linkEmbeds")}
                </>
              ),
              value: "/me/link-embeds",
            },
            // {
            //   label: (
            //     <>
            //       <p className="text-xs font-semibold uppercase text-brand-pink">
            //         {t("deluxe")}
            //       </p>
            //       {t("bots")}
            //     </>
            //   ),
            //   value: "/me/bots",
            // },
          ]}
        >
          <Outlet />
        </TabsWindow>
      </Prose>
    </div>
  );
}
