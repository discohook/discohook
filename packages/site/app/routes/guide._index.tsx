import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import type { GuideFileMeta } from "./guide.$";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);

  const indexResponse = await context.env.ASSETS.fetch(
    "http://localhost/guide-index.json",
    { method: "GET" },
  );
  let index: Record<string, GuideFileMeta[]> = {};
  if (indexResponse.ok) {
    index = await indexResponse.json();
  }

  return { user, index };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Discohook Guides" },
    {
      property: "og:title",
      content: "Guides",
    },
    {
      property: "og:site_name",
      content: "Discohook",
    },
    {
      name: "theme-color",
      content: "#58b9ff",
    },
  ];
};

export default () => {
  const { t } = useTranslation();
  const { user, index } = useLoaderData<typeof loader>();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <p className="text-2xl font-bold">Discohook Guides</p>
        <hr className="my-4 border border-gray-100/10 rounded" />
        {Object.entries(index)
          .filter(([, files]) => files.length !== 0)
          .map(([path, files]) => {
            return (
              <div key={`guide-path-${path}`} className="mb-4">
                <p className="text-lg font-semibold">
                  {t(`guidePath.${path}`)}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {files.map((file) => (
                    <Link
                      key={`file-${path}-${file.file}`}
                      className={twJoin(
                        "block rounded-lg px-4 py-2 border transition-all",
                        "bg-gray-50 dark:bg-gray-800 border-[#DFDFE1] dark:border-[#424349] hover:border-[#D2D2D5] dark:hover:border-[#626369]",
                        "hover:bg-white hover:dark:bg-gray-700",
                      )}
                      to={`/guide/${path}/${file.file}`}
                    >
                      <p className="font-semibold">{file.title}</p>
                      <p
                        // Thanks https://stackoverflow.com/a/13924997
                        className={twJoin(
                          "overflow-hidden text-sm",
                          "[display:-webkit-box]",
                          "[-webkit-line-clamp:2]",
                          "[line-clamp:2]",
                          "[-webkit-box-orient:vertical]",
                        )}
                      >
                        {file.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
      </Prose>
    </div>
  );
};
