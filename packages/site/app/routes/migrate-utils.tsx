import { Link, MetaFunction, useLoaderData } from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { Button } from "~/components/Button";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { Prose } from "~/components/Prose";
import { Twemoji } from "~/components/Twemoji";
import { MessageComponents } from "~/components/preview/Components";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  getUser(request, context);

export const meta: MetaFunction = () => [
  { title: "About Discohook & Discohook Utils" },
];

export default function Legal() {
  const user = useLoaderData<typeof loader>();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <InfoBox>
          <Twemoji emoji="👋" className="inline-block align-sub mr-1" /> Hello
          there, please read below if you use Discohook or Discohook Utils! Also
          read the{" "}
          <Link to="/legal" className="underline hover:no-underline">
            updated legal documents
          </Link>
          !
        </InfoBox>
        <h1 className="font-bold text-2xl">
          What's the difference between Discohook and Discohook Utils?
        </h1>
        <p>
          In 2024, Discohook and Discohook Utils merged into one service.
          "Discohook" may refer to this website or its Discord bot. We now use
          Discohook Utils#4333 as our primary bot account.
        </p>
        <h1 className="font-bold text-2xl mt-4">
          Do I need to do anything if I already use Discohook Utils?
        </h1>
        <p>
          As far as your buttons go, nope! Just bask in the new and improved
          suite of functionality at your disposal.
        </p>
        <h1 className="font-bold text-2xl mt-4">
          I still have reaction roles with Discobot, not Discohook Utils
        </h1>
        <p>
          Simply invite Discohook Utils to your server and remove Discobot. Your
          reaction roles will continue working, but the Discohook Utils bot will
          be used to manage them instead.
        </p>
        <h1 className="font-bold text-2xl mt-4">
          Can I still use the old Discohook?
        </h1>
        <p>
          For the first month or so, the previous version of Discohook will
          still be accessible at discohook.org. After that, it's gone forever!!
        </p>
        <h1 className="font-bold text-xl mt-4">But what about my backups?</h1>
        <p>
          New backups are not stored on your browser, and are now instead stored
          in the cloud, available everywhere you are signed in with your Discord
          account - but we do still encourage you to keep offline backups
          somewhere on your computer!
          <br />
          <br />
          If you have backups on Discohook.org, click this button to link them
          to your account:
        </p>
        <Link to="/me/import-org-backups" className="block w-fit mt-1">
          <Button discordstyle={ButtonStyle.Link}>Import Backups</Button>
        </Link>
        <hr className="border border-gray-500/20 my-4" />
        <MessageComponents
          components={[
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  url: "/",
                  label: "Main editor",
                },
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  url: "/bot",
                  label: "Invite the Discohook bot",
                },
              ],
            },
          ]}
        />
      </Prose>
    </div>
  );
}
