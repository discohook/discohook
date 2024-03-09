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
          there. If you use Discohook Utils, please read below! In short,
          Discohook & Discohook Utils are now one in the same. Also, read the{" "}
          <Link to="/legal" className="underline hover:no-underline">
            updated legal documents
          </Link>
          .
        </InfoBox>
        <h1 className="font-bold text-3xl">
          What's the difference between Discohook and Discohook Utils?
        </h1>
        <p>
          In 2024, Discohook and Discohook Utils merged into one service.
          "Discohook" may refer to this website or its Discord bot. For
          technical reasons, we stuck with Discohook Utils#4333 for the bot
          account.
        </p>
        <h1 className="font-bold text-3xl mt-4">
          Do I need to do anything if I already use Discohook Utils?
        </h1>
        <p>
          As far as your buttons go, nope! Just bask in the new and improved
          suite of functionality at your disposal.
        </p>
        <h1 className="font-bold text-3xl mt-4">
          I still have reaction roles with Discobot, not Discohook Utils
        </h1>
        <p>
          Simply invite Discohook Utils to your server and remove Discobot. Your
          reaction roles will continue working, but Discohook Utils will be used
          to manage them instead.
        </p>
        <h1 className="font-bold text-3xl mt-4">
          Can I still use the old Discohook?
        </h1>
        <p>
          No, sorry. We hope you'll love this one though. If you're technically
          inclined, feel free to clone the old Discohook repository and host it
          for yourself. We take no responsibility if you see someone doing this
          and they turn out to be malicious!
        </p>
        <h1 className="font-bold text-2xl mt-4">But what about my backups?</h1>
        <p>
          Backups are no longer stored on your browser. Your backups are now
          stored in the cloud, and are available everywhere you are signed in
          with your Discord account. Although we do encourage you to keep
          offline backups of your data somewhere (on your computer) regardless.
        </p>
        <p>
          If you have backups on Discohook.org, click this button to link them
          to your account:
        </p>
        <Link to="/me/import-org-backups">
          <Button>Import</Button>
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
