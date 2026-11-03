import { ButtonStyle } from "discord-api-types/v10";
import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";
import { Cell } from "./donate";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return { user };
};

export const meta: MetaFunction = () => {
  const year = new Date().getUTCFullYear();
  const title = `The Best Discohook Alternative (${year}): Discohook`;
  return [
    { title },
    { name: "og:site_name", content: "Discohook" },
    { name: "og:title", content: title },
    {
      name: "og:description",
      content:
        "If you use Discohook and you're looking for the best website for designing webhook messages, look no further!",
    },
    { name: "theme-color", content: "#FF81FF" },
  ];
};

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
  const year = new Date().getFullYear();

  return (
    <div>
      <Header user={user} />
      <div className="max-w-4xl mx-auto p-4 text-lg">
        <h1 className="text-3xl font-bold">
          The Best Discohook Alternative ({year})
        </h1>
        <div className="flex items-center gap-2 my-2">
          <img
            src="https://avatars.githubusercontent.com/u/43248357?v=4&size=128"
            className="rounded-full h-10"
            alt=""
          />
          <div>
            <p className="leading-tight text-base font-medium">Shay</p>
            <p className="leading-tight text-sm text-muted dark:text-muted-dark">
              Developer of this website
            </p>
          </div>
        </div>
        <p>
          Do you currently use discohook.org for designing your webhook
          messages? Are you looking for something more? It's true that
          discohook.org hasn't received updates in a while - that's because
          development efforts have shifted to{" "}
          <span className="font-semibold">discohook.app</span>, which is the
          modern and featureful replacement.
        </p>
        <p className="mt-1">Take a look at the side-by-side comparison:</p>
        <div className="mt-4 rounded-lg bg-slate-100 dark:bg-gray-700 table w-full">
          <div className="table-header-group">
            <div className="table-row">
              <Cell edges="tl" className="font-semibold">
                Feature
              </Cell>
              <Cell edges="t" className="font-semibold" premium>
                discohook.app
              </Cell>
              <Cell edges="tr" className="font-semibold">
                discohook.org
              </Cell>
            </div>
          </div>
          <div className="table-row-group">
            <div className="table-row">
              <Cell edges="l">
                Components-based messages (Containers, Sections, ...)
              </Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Buttons, selects, customizable flows</Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Welcomer messages</Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Bot profile customization</Cell>
              <Cell premium>Yes, for free</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Send messages with custom bot (not webhook)</Cell>
              <Cell>Not yet</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Thread support</Cell>
              <Cell premium>
                <Link
                  to="/guide/getting-started/threads"
                  className={linkClassName}
                >
                  Yes
                </Link>
              </Cell>
              <Cell edges="r" premium>
                Yes
              </Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Message scheduling</Cell>
              <Cell premium>
                Yes{" "}
                <span className="text-sm">
                  (
                  <span title="including" className="cursor-help">
                    incl.
                  </span>{" "}
                  repeating)
                </span>
              </Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Poll editor</Cell>
              <Cell>Not yet</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Shareable templates</Cell>
              <Cell>Not yet</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Private templates (backups)</Cell>
              <Cell premium>
                <Link
                  to="/guide/getting-started/backups"
                  className={linkClassName}
                >
                  Yes
                </Link>
              </Cell>
              <Cell premium edges="r">
                Yes
              </Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Allowed mentions (ping controls)</Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Log in with Discord</Cell>
              <Cell premium>
                Yes <span className="text-sm">(optional)</span>
              </Cell>
              <Cell edges="r">No</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Language support</Cell>
              <Cell premium>
                <Link
                  to="https://translate.shay.cat/projects/discohook/"
                  className={linkClassName}
                >
                  About 10
                </Link>
              </Cell>
              <Cell edges="r">English-only</Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">
                <span
                  className="cursor-help"
                  title="We do not have an app published in app stores. There are some apps which claim to be Discohook, but these are not published by us and should not be downloaded. However, you can add Discohook to your home screen like any other website, usually via the share button -> add to home screen."
                >
                  Mobile support
                </span>
              </Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r" premium>
                Yes
              </Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">JSON import & export</Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r" premium>
                Yes
              </Cell>
            </div>
            <div className="table-row">
              <Cell edges="l">Live builder preview</Cell>
              <Cell premium>Yes</Cell>
              <Cell edges="r">Outdated</Cell>
            </div>
            <div className="table-row">
              <Cell edges="bl">Documented API</Cell>
              <Cell edges="b" premium>
                <Link to="https://docs.discohook.app" className={linkClassName}>
                  Yes
                </Link>
              </Cell>
              <Cell edges="br">No</Cell>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <p className="ms-auto font-medium">Ready to get started?</p>
          <Link to="/" className="block">
            <Button discordstyle={ButtonStyle.Primary}>Open Editor</Button>
          </Link>
        </div>
        <h1 className="text-xl font-bold mt-4">
          <Twemoji className="h-5" emoji="📜" /> About Discohook
        </h1>
        <div className="space-y-2 mt-1">
          <p>
            Discohook is a free tool for customizing Discord servers. Since
            2019, it has been founded on providing features that users actually
            want, without being overly prescriptive about how you use it.
            Discohook contains no AI chatbots, no advertisements, and no
            trackers.
          </p>
          <p>
            Furthermore, Discohook is open source software, meaning users can
            inspect and modify the source code to their liking to improve the
            project.
          </p>
        </div>
      </div>
    </div>
  );
}
