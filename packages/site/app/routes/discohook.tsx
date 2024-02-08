import { Link, MetaFunction, useLoaderData } from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { Prose } from "~/components/Prose";
import { Twemoji } from "~/components/Twemoji";
import { MessageComponents } from "~/components/preview/Components";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";
import { getUserAvatar } from "~/util/users";

export const loader = ({ request, context }: LoaderArgs) =>
  getUser(request, context);

export const meta: MetaFunction = () => [
  { title: "About Discohook & Discohook Utils - Boogiehook" },
];

export default function Legal() {
  const user = useLoaderData<typeof loader>();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <InfoBox>
          <Twemoji emoji="👋" className="inline-block align-sub mr-1" /> Hello
          there. If you were redirected from dutils.shay.cat, please read below!
          In short, Discohook Utils is now Boogiehook, but it's even better.
          Also, read the{" "}
          <Link to="/legal" className="underline hover:no-underline">
            updated legal documents
          </Link>
          .
        </InfoBox>
        <h1 className="font-bold text-3xl">
          What's the difference between Boogiehook, Discohook, and Discohook
          Utils?
        </h1>
        <p>
          Boogiehook refers to this website and its Discord bot. It is a
          spiritual successor to Discohook (maintained by a different person).
          It also directly follows Discohook Utils, and uses the same bot
          account (Discohook Utils#4333).
        </p>
        <h1 className="font-bold text-3xl mt-4">
          Do I need to do anything if I already use Discohook Utils?
        </h1>
        <p>
          As far as your buttons go, nope! Just bask in the new and improved
          suite of functionality at your disposal. Although we do recommend you
          nickname the bot to Boogiehook to avoid confusion. However, seeing as
          the bot is no longer built around Discohook, you will need to
          "re-learn" how its commands work now.
        </p>
        <h1 className="font-bold text-3xl mt-4">
          Should I still use Discohook?
        </h1>
        <p>
          You could, but Boogiehook is designed to be entirely independent. For
          most functions of the Boogiehook bot, you will be directed to
          Boogiehook at some point instead.
        </p>
        <h1 className="font-bold text-2xl mt-4">But what about my backups?</h1>
        <p>It's easy to migrate your backups from Discohook.</p>
        <ol className="list-decimal list-inside my-1.5 space-y-1">
          <li>
            Open Discohook (discohook.org). Click the "Backups" button, then
            click "Export All". Your browser will download a file called
            backups.json.
          </li>
          <li>
            Now head to your user page on Boogiehook (
            {user ? (
              <>
                click your profile picture{" "}
                <img
                  src={getUserAvatar(user)}
                  className="rounded-full h-4 inline-block align-sub"
                  alt={user.name}
                />{" "}
                at the top left
              </>
            ) : (
              <>
                click the{" "}
                <CoolIcon
                  icon="Log_Out"
                  className="rotate-180 text-blurple-400"
                />{" "}
                icon at the top left to log in
              </>
            )}
            ).
          </li>
          <li>
            Under "Your Backups", click the "Import" button. Select the file
            that you downloaded from Discohook.
          </li>
        </ol>
        <p>
          Note that Boogiehook backups are not stored the same way as Discohook
          backups! On Boogiehook, your backups are stored in the cloud and are
          available everywhere you are signed in with your Discord account.
          Although we do encourage you to keep offline backups of your data
          somewhere (on your computer) regardless.
        </p>
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
                  url: "/discord/bot",
                  label: "Invite the Boogiehook bot",
                },
              ],
            },
          ]}
        />
      </Prose>
    </div>
  );
}
