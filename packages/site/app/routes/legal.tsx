import { MetaFunction, useLoaderData } from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { Prose } from "~/components/Prose";
import { MessageComponents } from "~/components/preview/Components";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  getUser(request, context);

export const meta: MetaFunction = () => [
  { title: "Privacy & Terms - Discohook" },
];

export default function Legal() {
  const user = useLoaderData<typeof loader>();
  const [host, setHost] = useState<string>();
  useEffect(() => setHost(location.host), []);

  return (
    <div>
      <Header user={user} />
      <Prose>
        {host && host !== "discohook.app" && (
          <InfoBox severity="yellow">
            <CoolIcon icon="Shield_Warning" /> You are not on discohook.app, so
            the below policies may not apply to the service you are using.
            Proceed with caution.
          </InfoBox>
        )}
        <h1 className="font-bold text-2xl" id="terms-of-service">
          Terms of Service
        </h1>
        <p>
          By using Discohook or any of its subsequent services, including but
          not limited to Discohook's Discord application (Discohook Utils#4333),
          you agree to follow this document.
        </p>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            You will not use the service(s) to:
            <ul className="list-disc list-inside ml-4">
              <li>break a United States law;</li>
              <li>
                intentionally bring harm, physical or otherwise, to other users;
              </li>
              <li>
                violate Discord's Terms of Service, available at{" "}
                <a href="https://discord.com/terms">
                  https://discord.com/terms
                </a>
                .
              </li>
            </ul>
          </li>
          <li>
            You will not attempt to:
            <ul className="list-disc list-inside ml-4">
              <li>gain access to features otherwise not available to you;</li>
              <li>bring harm or downtime to the service(s);</li>
              <li>attack the hosting platforms used by the service(s).</li>
            </ul>
          </li>
          <li>
            You acknowledge that the developer of the service(s) reserves the
            right to partially or fully forbid you from accessing or using the
            service(s), without warning, at their own discretion.
          </li>
        </ul>
        <h1 className="font-bold text-2xl mt-4" id="privacy">
          Privacy
        </h1>
        <p>
          In short: Discohook stores user-provided data as necessary for
          operations performed by the service(s). This data is not sold.
        </p>
        <h2 className="font-bold text-lg mt-2">Definitions</h2>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            Database ID: This is a unique integer that represents a resource in
            Discohook's persistent database. It is not strictly bound to a
            Discord ID (snowflake), but it could correlate directly to one or
            multiple, depending on the resource.
          </li>
          <li>
            Moderation: Some actions may be logged by the server and linked to a
            Discord guild ID. Guild moderators may choose to view logs for their
            guild in order to investigate suspicious activity.
          </li>
        </ul>
        <h2 className="font-bold text-lg mt-2">Policy</h2>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            Some bot commands, especially those that cause new data to be
            created--for example "webhook create" and "buttons add"--will store
            data relevant to the result and the user that caused the execution.
          </li>
          <li>
            On the dedicated web-based interface:
            <ul className="list-disc list-inside ml-4">
              <li>
                When the user creates a Discord webhook, that webhook's
                details--especially its ID, name, token, avatar hash, and
                channel ID--are stored until there is reason to remove it
                {/* , along
                with the Database ID of the user that was logged in at the time
                of authorization */}
                .
              </li>
              <li>
                When the user sends a message, details about that event are
                stored for Moderation.
              </li>
              <li>
                When the user modifies a Discord webhook, a value is attached to
                the payload that identifies the user who made the change in the
                Discord guild's audit log page for Moderation.
              </li>
            </ul>
          </li>
          <li>
            All data is stored either on a PostgreSQL server, Cloudflare KV, or
            Backblaze B2, depending on the data.
          </li>
          <li>
            Data is not sold to third parties for any reason. Discohook is
            funded entirely through donations and Deluxe subscriptions.
          </li>
          <li>
            If the user has questions about data management and privacy, they
            may join the Discord guild linked at the bottom of this document by
            clicking on the button labeled "Support server" and inquire in the
            "support" or "general" channel.
          </li>
        </ul>
        <hr className="border border-gray-500/20 my-4" />
        <MessageComponents
          components={[
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  url: "https://github.com/shayypy/discohook/commits/main/packages/site/app/routes/legal.tsx",
                  label: "Page update history",
                },
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  url: "https://discord.com/terms",
                  label: "Discord's terms of service",
                },
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  url: "/discord",
                  label: "Support server",
                },
              ],
            },
          ]}
        />
      </Prose>
    </div>
  );
}
