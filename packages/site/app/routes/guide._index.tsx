import { MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { FullscreenThrobber } from "~/root";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";
import { GuideFileMeta } from "./guide.$";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return { user };
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
  const { user } = useLoaderData<typeof loader>();

  const [indexData, setIndexData] = useState<Record<string, GuideFileMeta[]>>();
  useEffect(() => {
    if (!indexData) {
      fetch("/guide-index.json", { method: "GET" }).then((response) => {
        if (response.ok)
          response
            .json()
            .then((data) => setIndexData(data as typeof indexData));
      });
    }
  }, [indexData]);

  return (
    <div>
      <Header user={user} />
      {indexData ? (
        <Prose>
          <p className="text-2xl font-bold">Discohook Guides</p>
          <hr className="my-4 border border-gray-100/10 rounded" />
          {Object.entries(indexData)
            .filter(([, files]) => files.length !== 0)
            .map(([path, files]) => {
              return (
                <div key={`guide-path-${path}`} className="mb-4">
                  <p className="text-lg font-semibold">
                    {path.replace(/(?:-|^)(\w)/g, (sub) =>
                      sub.replace(/^-/, " ").toUpperCase(),
                    )}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {files.map((file) => (
                      <Link
                        key={`file-${path}-${file.file}`}
                        className="block rounded-lg px-4 py-2 bg-primary-200 dark:bg-gray-900 border border-gray-100/10 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
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
      ) : (
        <FullscreenThrobber />
      )}
    </div>
  );
};
