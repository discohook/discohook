import { type MetaFunction, useLoaderData } from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { Prose } from "~/components/Prose";
import { PreviewActionRow } from "~/components/preview/ActionRow";
import { linkClassName } from "~/components/preview/Markdown";
import { getUser } from "~/session.server";
import type { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  getUser(request, context);

export const meta: MetaFunction = () => [
  { title: "Privacy & Terms - Discohook" },
  { name: "og:site_name", content: "Discohook" },
  { name: "og:title", content: "Privacy & Terms" },
  {
    name: "theme-color",
    content: "#58b9ff",
  },
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
          <InfoBox severity="yellow" icon="Shield_Warning">
            You are not on discohook.app, so the below policies may not apply to
            the service you are using. Proceed with caution.
          </InfoBox>
        )}
        <h1 className="font-bold text-2xl" id="terms-of-service">
          Terms of Service
        </h1>
        <p>
          By using any of Discohook's services, including but not limited to
          Discohook's Discord applications (Discohook Utils#4333, Discobot#9898)
          and web-based interfaces (discohook.app, discohook.org), you agree to
          follow this document.
        </p>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            You will not use or attempt to use the services to:
            <ul className="list-disc list-inside ms-4">
              <li>break a United States law;</li>
              <li>
                intentionally bring harm, physical or otherwise, to yourself or
                other users;
              </li>
              <li>
                violate Discord's Terms of Service, available at{" "}
                <a href="https://discord.com/terms" className={linkClassName}>
                  https://discord.com/terms
                </a>
                ;
              </li>
              <li>gain access to features otherwise not available to you;</li>
              <li>bring harm or downtime to the services;</li>
              <li>
                bring harm or downtime to the hosting platforms depended on by
                the services.
              </li>
            </ul>
          </li>
          <li>
            You acknowledge that the administrator of the services reserves the
            right to partially or fully forbid you from accessing or using the
            services, without warning, at their own discretion.
          </li>
        </ul>
        <hr className="border border-gray-500/20 my-4" />
        <h1 className="font-bold text-2xl" id="privacy">
          Privacy
        </h1>
        <p>
          In short: Discohook stores user-provided data as necessary for
          operations performed by the services. This data is not sold.
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
        <h2 className="font-bold text-lg mt-2">
          Bot Applications (Discohook Utils#4333, Discobot#9898)
        </h2>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            Some bot commands, especially those that cause new data to be
            created--for example "webhook create" and "buttons add"--will store
            data relevant to the result and the user that caused the execution.
          </li>
          <li>
            The legacy bot application (Discobot#9898) is able to access a
            shared database for the purpose of long-term support, but it will
            not collect any new data on its own.
          </li>
        </ul>
        <h2 className="font-bold text-lg mt-2">Web Interface</h2>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            When the user creates a Discord webhook, that webhook's
            details--especially its ID, name, token, avatar hash, and channel
            ID--are stored until there is reason to remove it .
          </li>
          <li>
            When the user sends a message, details about that event are stored
            for Moderation.
          </li>
          <li>
            When the user modifies a Discord webhook, a value is attached to the
            payload that identifies the user who made the change in the Discord
            guild's audit log page for Moderation.
          </li>
        </ul>
        <h2 className="font-bold text-lg mt-2">Storage & Handling</h2>
        <ul className="list-disc list-inside my-1 space-y-1">
          <li>
            All data is stored either on a PostgreSQL server (region us-east),
            Cloudflare KV (distributed), or Backblaze B2 (region us-east),
            depending on the data.
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
        <PreviewActionRow
          component={{
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                url: "https://github.com/discohook/discohook/commits/main/packages/site/app/routes/legal.tsx",
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
          }}
        />
      </Prose>
    </div>
  );
}
